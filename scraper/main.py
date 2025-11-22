import time
import os
import logging
import duckdb
import concurrent.futures
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException,
    ElementClickInterceptedException,
    StaleElementReferenceException,
)
import re
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# --- Configuration ---
MAX_WORKERS = 16  # Number of browsers to open at once
OUTPUT_DIR = "data"

# List of states from the dropdown
BUNDESLAENDER = [
    "Baden-Württemberg",
    "Bayern",
    "Berlin",
    "Brandenburg",
    "Bremen",
    "Hamburg",
    "Hessen",
    "Mecklenburg-Vorpommern",
    "Niedersachsen",
    "Nordrhein-Westfalen",
    "Rheinland-Pfalz",
    "Saarland",
    "Sachsen",
    "Sachsen-Anhalt",
    "Schleswig-Holstein",
    "Thüringen",
]

# Setup Logging
if not os.path.exists("logs"):
    os.makedirs("logs")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - [%(processName)s] - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("logs/scraper.log"), logging.StreamHandler()],
)


def init_db_for_state(state_name):
    """Create a separate DB file for each state to avoid locking collisions."""
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    safe_name = (
        state_name.replace("-", "_")
        .replace("ü", "ue")
        .replace("ö", "oe")
        .replace("ä", "ae")
    )
    db_path = f"{OUTPUT_DIR}/foundations_{safe_name}.duckdb"

    con = duckdb.connect(db_path)
    con.execute("""
        CREATE TABLE IF NOT EXISTS foundations (
            id INTEGER PRIMARY KEY,
            bundesland VARCHAR,
            name VARCHAR,
            short_desc VARCHAR,
            portrait VARCHAR,
            themen VARCHAR,
            zusatzinfo VARCHAR,
            contact_info VARCHAR,
            full_html VARCHAR,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    con.execute("CREATE SEQUENCE IF NOT EXISTS seq_foundations_id START 1")
    return con, db_path


def parse_modal_html(html_content):
    soup = BeautifulSoup(html_content, "html.parser")
    data = {"Portrait": "", "Themen": "", "Zusatzinformationen": ""}

    current_section = None
    for element in soup.children:
        if element.name == "h4":
            header_text = element.get_text(strip=True)
            if "Portrait" in header_text:
                current_section = "Portrait"
            elif "Themen" in header_text:
                current_section = "Themen"
            elif "Zusatzinformationen" in header_text:
                current_section = "Zusatzinformationen"
            else:
                current_section = None
        elif current_section:
            text = (
                element.get_text(" ", strip=True)
                if element.name
                else str(element).strip()
            )
            if text:
                data[current_section] += text + "\n"
    return data


def nuke_cookie_banner(driver):
    """Aggressively removes cookie banner elements via JS."""
    try:
        driver.execute_script("""
            var banner = document.querySelector('.brlbs-cmpnt-dialog-box-entrance');
            if (banner) banner.remove();
            var backdrop = document.getElementById('BorlabsDialogBackdrop');
            if (backdrop) backdrop.remove();
        """)
    except Exception:
        pass


def handle_cookie_consent(driver, wait):
    """
    Handles the 'Borlabs' cookie banner by clicking 'Alle akzeptieren' or removing it.
    """
    try:
        logging.info("Checking for cookie banner...")
        accept_btn = wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".brlbs-btn-accept-all"))
        )
        accept_btn.click()
        logging.info("✅ Clicked 'Alle akzeptieren'.")
        wait.until(
            EC.invisibility_of_element_located(
                (By.CSS_SELECTOR, ".brlbs-cmpnt-dialog-box-entrance")
            )
        )
        time.sleep(1)
    except TimeoutException:
        logging.info("No cookie banner found (timeout). Nuking via JS to be safe.")
        nuke_cookie_banner(driver)
    except Exception as e:
        logging.warning(f"Cookie handler exception: {e}")


def scrape_bundesland(state_name):
    """Worker function to scrape a single Bundesland."""
    process_name = f"Worker-{state_name}"
    logging.info(f"Starting scrape for: {state_name}")

    con, db_path = init_db_for_state(state_name)

    options = webdriver.ChromeOptions()
    options.add_argument("--window-size=1200,800")
    # options.add_argument("--headless")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()), options=options
    )
    wait = WebDriverWait(driver, 10)

    try:
        driver.get("https://stiftungssuche.de/stiftungssuche/")

        # 1. Select Bundesland
        select_element = wait.until(
            EC.presence_of_element_located((By.ID, "bundesland"))
        )
        select = Select(select_element)
        select.select_by_value(state_name)
        logging.info(f"Selected state: {state_name}")
        time.sleep(1)

        # 2. Click Search
        search_btn = driver.find_element(By.CSS_SELECTOR, 'button[value="search"]')
        driver.execute_script("arguments[0].click();", search_btn)

        time.sleep(2)

        # 3. Handle Cookies
        handle_cookie_consent(driver, wait)

        # Wait for results
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "card-result")))
        logging.info(f"Initial results loaded for {state_name}")

        # Try to find the total number of results from the green alert box
        total_results = None
        try:
            alert = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, "div.alert.alert-success")
                )
            )
            alert_text = alert.text
            m = re.search(r"([\d\.]+)\s+Ergebnisse gefunden", alert_text)
            if m:
                total_results = int(m.group(1).replace(".", ""))
                logging.info(f"Found total results for {state_name}: {total_results}")
        except TimeoutException:
            logging.info(f"No total results alert found for {state_name}")

        scraped_indices = set()
        # simple counter for progress logging
        scraped_count = 0

        while True:
            cards = driver.find_elements(By.CLASS_NAME, "card-result")
            new_data_batch = []

            # --- Processing Loop ---
            for index, card in enumerate(cards):
                if index in scraped_indices:
                    continue

                success = False
                for attempt in range(3):
                    try:
                        driver.execute_script(
                            "arguments[0].scrollIntoView({block: 'center'});", card
                        )

                        title = card.find_element(By.TAG_NAME, "h4").text.strip()
                        short_desc = card.find_element(By.TAG_NAME, "a").text.strip()

                        # Click (JS)
                        link_element = card.find_element(
                            By.CSS_SELECTOR, ".stretched-link"
                        )
                        driver.execute_script("arguments[0].click();", link_element)

                        # Wait for Modal
                        wait.until(
                            EC.visibility_of_element_located((By.ID, "modalPortrait"))
                        )
                        wait.until(
                            EC.invisibility_of_element_located(
                                (
                                    By.CSS_SELECTOR,
                                    "#modalPortraitContent .spinner-border",
                                )
                            )
                        )

                        # Extract
                        content_html = driver.find_element(
                            By.ID, "modalPortraitContent"
                        ).get_attribute("innerHTML")
                        contact_info = driver.find_element(
                            By.ID, "modalPortraitKontakt"
                        ).text.strip()
                        parsed_sections = parse_modal_html(content_html)

                        new_data_batch.append(
                            (
                                state_name,
                                title,
                                short_desc,
                                parsed_sections["Portrait"].strip(),
                                parsed_sections["Themen"].strip(),
                                parsed_sections["Zusatzinformationen"].strip(),
                                contact_info,
                                content_html,
                            )
                        )

                        # Close Modal
                        close_btn = driver.find_element(
                            By.CSS_SELECTOR, "#modalPortrait .btn-close"
                        )
                        driver.execute_script("arguments[0].click();", close_btn)
                        wait.until(
                            EC.invisibility_of_element_located((By.ID, "modalPortrait"))
                        )

                        scraped_indices.add(index)
                        scraped_count = len(scraped_indices)
                        # Log progress with total if available
                        total_display = total_results if total_results else "unknown"
                        logging.info(
                            f"Scraped card {scraped_count}/{total_display} in {state_name}: {title}"
                        )
                        success = True
                        break

                    except (
                        ElementClickInterceptedException,
                        StaleElementReferenceException,
                    ):
                        handle_cookie_consent(driver, wait)  # Check blocked
                        time.sleep(0.5)
                    except Exception:
                        time.sleep(1)

                if not success:
                    logging.error(f"Failed to scrape card {index} in {state_name}")

            # --- Save Batch ---
            if new_data_batch:
                logging.info(
                    f"Saving {len(new_data_batch)} records for {state_name}..."
                )
                con.executemany(
                    """
                    INSERT INTO foundations (
                        id, bundesland, name, short_desc, portrait, themen, zusatzinfo, contact_info, full_html
                    ) VALUES (nextval('seq_foundations_id'), ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                    new_data_batch,
                )

            # --- Pagination ---
            try:
                # Scroll to bottom to ensure button is visible
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(1)

                # Nuke cookies again just in case they block the footer
                nuke_cookie_banner(driver)

                load_more_btns = driver.find_elements(By.ID, "load_more")
                if not load_more_btns:
                    logging.info(
                        f"Load more button NOT found for {state_name}. Finished."
                    )
                    break

                load_more_btn = load_more_btns[0]

                if load_more_btn.is_displayed():
                    logging.info(
                        f"Clicking 'Load More' for {state_name} (Current: {len(cards)})"
                    )
                    driver.execute_script("arguments[0].click();", load_more_btn)

                    current_count = len(cards)
                    # Increased timeout to 30s for slow servers
                    WebDriverWait(driver, 30).until(
                        lambda d: len(d.find_elements(By.CLASS_NAME, "card-result"))
                        > current_count
                    )
                    time.sleep(2)  # Buffer for animation
                else:
                    logging.info(f"Load more button hidden for {state_name}. Finished.")
                    break

            except TimeoutException:
                logging.error(
                    f"Timeout waiting for more results in {state_name}. Might be end of list or slow net."
                )
                break
            except Exception as e:
                logging.error(f"Pagination error in {state_name}: {e}")
                break

    except Exception as e:
        logging.error(f"Critical failure in {state_name} worker: {e}")
    finally:
        con.close()
        driver.quit()
        logging.info(f"Finished {state_name}")


if __name__ == "__main__":
    logging.info(f"Starting parallel scraper with {MAX_WORKERS} workers.")
    with concurrent.futures.ProcessPoolExecutor(max_workers=MAX_WORKERS) as executor:
        executor.map(scrape_bundesland, BUNDESLAENDER)

import time
import duckdb
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException,
    NoSuchElementException,
    ElementClickInterceptedException,
)
from webdriver_manager.chrome import ChromeDriverManager

# --- Configuration ---
DB_NAME = "foundations.duckdb"
BASE_URL = "https://stiftungssuche.de/stiftungssuche/"
BATCH_SIZE = 50  # Safety break to prevent infinite loops during testing


def init_db():
    """Initialize DuckDB connection and schema."""
    con = duckdb.connect(DB_NAME)
    con.execute("""
        CREATE TABLE IF NOT EXISTS foundations (
            id INTEGER PRIMARY KEY,
            name VARCHAR,
            short_desc VARCHAR,
            full_details VARCHAR,
            contact_info VARCHAR,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    con.execute("CREATE SEQUENCE IF NOT EXISTS seq_foundations_id START 1")
    return con


def setup_driver():
    """Setup Chrome Driver."""
    options = webdriver.ChromeOptions()
    # options.add_argument("--headless") # Uncomment to run without UI
    options.add_argument("--start-maximized")
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()), options=options
    )
    return driver


def scrape_process():
    con = init_db()
    driver = setup_driver()
    wait = WebDriverWait(driver, 10)

    try:
        print(f"[*] Navigating to {BASE_URL}...")
        driver.get(BASE_URL)

        # 1. Click the "Suchen" button
        # Selector based on user snippet: <button type="submit" name="action" value="search" ...>
        search_btn = wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, 'button[value="search"]'))
        )
        print("[*] Clicking Search...")
        search_btn.click()

        # Wait for the first batch of results
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "card-result")))

        scraped_indices = set()  # Keep track of which indices we've processed

        while True:
            # Re-find all cards currently in the DOM
            cards = driver.find_elements(By.CLASS_NAME, "card-result")
            print(f"[*] Found {len(cards)} cards in DOM.")

            new_data_batch = []

            # Iterate through cards we haven't scraped yet
            for index, card in enumerate(cards):
                if index in scraped_indices:
                    continue

                try:
                    # Scroll card into view to ensure clicks work
                    driver.execute_script(
                        "arguments[0].scrollIntoView({block: 'center'});", card
                    )
                    time.sleep(0.5)  # Small animation buffer

                    # Extract basic info from the card before opening
                    title = card.find_element(By.TAG_NAME, "h4").text.strip()
                    short_desc = card.find_element(By.TAG_NAME, "a").text.strip()

                    print(f"Processing: {title}...")

                    # Click to expand (Open Modal)
                    # Selector based on user snippet: <a ... onclick="javascript:open_portrait(...)">
                    click_target = card.find_element(By.CSS_SELECTOR, ".stretched-link")
                    click_target.click()

                    # Wait for Modal to appear and Spinner to disappear
                    # Modal ID: #modalPortrait
                    # Content ID: #modalPortraitContent
                    wait.until(
                        EC.visibility_of_element_located((By.ID, "modalPortrait"))
                    )

                    # Wait for the spinner to vanish (indicating content loaded)
                    # Snippet: <div class="spinner-border" ...>
                    wait.until(
                        EC.invisibility_of_element_located(
                            (By.CSS_SELECTOR, "#modalPortraitContent .spinner-border")
                        )
                    )

                    # Extract Data from Modal
                    modal_content = driver.find_element(
                        By.ID, "modalPortraitContent"
                    ).text
                    modal_contact = driver.find_element(
                        By.ID, "modalPortraitKontakt"
                    ).text

                    new_data_batch.append(
                        (title, short_desc, modal_content, modal_contact)
                    )

                    # Close Modal
                    close_btn = driver.find_element(
                        By.CSS_SELECTOR, "#modalPortrait .btn-close"
                    )
                    close_btn.click()

                    # Wait for modal to actually close before moving on
                    wait.until(
                        EC.invisibility_of_element_located((By.ID, "modalPortrait"))
                    )

                    scraped_indices.add(index)

                except Exception as e:
                    print(f"[!] Error scraping card {index}: {e}")
                    # Try to force close modal if stuck open
                    try:
                        driver.find_element(
                            By.CSS_SELECTOR, "#modalPortrait .btn-close"
                        ).click()
                    except:
                        pass

            # Save Batch to DuckDB
            if new_data_batch:
                print(f"[*] Saving {len(new_data_batch)} records to DuckDB...")
                con.executemany(
                    "INSERT INTO foundations (id, name, short_desc, full_details, contact_info) VALUES (nextval('seq_foundations_id'), ?, ?, ?, ?)",
                    new_data_batch,
                )

            # 2. Handle "Weitere Ergebnisse" (Load More)
            try:
                load_more_btn = driver.find_element(By.ID, "load_more")

                # Check if button is visible and enabled
                if load_more_btn.is_displayed():
                    print("[*] Clicking 'Weitere Ergebnisse'...")
                    driver.execute_script("arguments[0].click();", load_more_btn)

                    # Wait for new cards to appear (count should increase)
                    current_count = len(cards)
                    WebDriverWait(driver, 10).until(
                        lambda d: len(d.find_elements(By.CLASS_NAME, "card-result"))
                        > current_count
                    )
                    time.sleep(1)  # Buffer for DOM stability
                else:
                    print("[*] Load more button not visible. Finished.")
                    break

            except (NoSuchElementException, TimeoutException):
                print("[*] No more results to load or timed out.")
                break
            except Exception as e:
                print(f"[!] Error clicking load more: {e}")
                break

    finally:
        print("[*] Scrape complete. Closing driver.")
        con.close()
        driver.quit()


if __name__ == "__main__":
    scrape_process()

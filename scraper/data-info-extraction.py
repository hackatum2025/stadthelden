#%%
import duckdb
import pandas as pd
import os

# Configuration: Select which bundesland to process
SELECTED_BUNDESLAND = "Bayern"  # Change this to process a different bundesland

OUTPUT_DIR = "data"
BUNDESLAENDER_DIR = os.path.join(OUTPUT_DIR, "foundations_bundeslaender")


def get_safe_bundesland_name(bundesland):
    """
    Converts bundesland name to safe filename format.
    Matches the naming convention used in main.py
    """
    return (
        bundesland.replace("-", "_")
        .replace("ü", "ue")
        .replace("ö", "oe")
        .replace("ä", "ae")
    )


# get all data from the duckdb and put into a dataframe
def load_bundesland_db_to_dataframe(bundesland):
    """
    Loads a specific bundesland DuckDB database into a pandas DataFrame.
    """
    safe_name = get_safe_bundesland_name(bundesland)
    db_path = os.path.join(BUNDESLAENDER_DIR, f"foundations_{safe_name}.duckdb")
    
    if not os.path.exists(db_path):
        print(f"❌ Error: Bundesland database '{db_path}' not found.")
        return None

    con = duckdb.connect(db_path)
    df = con.execute("SELECT * FROM foundations;").fetchdf()
    print(f"✅ Total foundations scraped for {bundesland}: {len(df)}")
    con.close()
    return df


df = load_bundesland_db_to_dataframe(SELECTED_BUNDESLAND)


# %%
# go through the contact info and separate out into address and email and phone number if they exist
def extract_contact_info(df):
    """
    Extracts address, email, and phone number from the contact_info column.
    """
    import re

    def extract_address(contact_info):
        # The original extract_address function is kept as is
        # A simple heuristic to extract address (this can be improved)
        lines = contact_info.split("\n")
        address_lines = [
            line
            for line in lines
            if not re.search(r"[\w\.-]+@[\w\.-]+", line)
            and not re.search(r"\+?\d[\d\s/-]{7,}\d", line)
        ]
        return " ".join(address_lines).strip() if address_lines else None

    def extract_url(contact_info):
        # This regex looks for common URL patterns
        # The protocol (http:// or https://) is made optional to catch more variations.
        match = re.search(
            r"(?:https?://)?(?:www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:/[^\s]*)?",
            contact_info,
        )
        return match.group(0) if match else None

    df["url"] = df["contact_info"].apply(extract_url)  # Changed column name to 'url'
    df["address"] = df["contact_info"].apply(extract_address)

    return df


df = extract_contact_info(df)
df


# %%
# save the result to new duckdb file
def save_dataframe_to_duckdb(df, output_path):
    """
    Saves the given DataFrame to a DuckDB database.
    """
    con = duckdb.connect(output_path)
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
            scraped_at TIMESTAMP,
            url VARCHAR,
            address VARCHAR
        )
    """)
    con.execute("INSERT INTO foundations SELECT * FROM df;")
    con.close()
    print(f"🎉 DataFrame saved to {output_path}")


# Save with bundesland-specific filename
safe_name = get_safe_bundesland_name(SELECTED_BUNDESLAND)
OUTPUT_BUNDESLAND_DB_PATH = os.path.join(OUTPUT_DIR, f"foundations_{safe_name}_enhanced.duckdb")
save_dataframe_to_duckdb(df, OUTPUT_BUNDESLAND_DB_PATH)

# %%

# %%
import duckdb
import pandas as pd
import os

# Define the directory where the individual state DBs are stored
OUTPUT_DIR = "data"
MASTER_DB_PATH = os.path.join(OUTPUT_DIR, "foundations_master.duckdb")


def create_master_db():
    """
    Combines all individual state DuckDB files into a single master DuckDB file.
    """
    if not os.path.exists(OUTPUT_DIR):
        print(f"❌ Error: Output directory '{OUTPUT_DIR}' not found.")
        return

    # Initialize the master database connection
    master_con = duckdb.connect(MASTER_DB_PATH)

    # Create the foundations table in the master DB if it doesn't exist
    master_con.execute("""
        CREATE TABLE IF NOT EXISTS foundations (
            id INTEGER, -- ID from original state DB, will be re-indexed in master
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

    # Get a list of all individual state DuckDB files
    state_db_files = [
        f
        for f in os.listdir(OUTPUT_DIR)
        if f.startswith("foundations_") and f.endswith(".duckdb")
    ]

    if not state_db_files:
        print(f"No individual state database files found in '{OUTPUT_DIR}'.")
        master_con.close()
        return

    print(
        f"Found {len(state_db_files)} state database files. Combining into master DB..."
    )

    for db_file in state_db_files:
        state_db_path = os.path.join(OUTPUT_DIR, db_file)
        try:
            # Attach each state database to the master database connection
            master_con.execute(f"ATTACH '{state_db_path}' AS state_db;")

            # Insert data from the attached state database into the master table
            # We select all columns except the 'id' from the source, as we will re-index
            master_con.execute("""
                INSERT INTO foundations (bundesland, name, short_desc, portrait, themen, zusatzinfo, contact_info, full_html, scraped_at)
                SELECT bundesland, name, short_desc, portrait, themen, zusatzinfo, contact_info, full_html, scraped_at
                FROM state_db.main.foundations;
            """)
            print(f"✅ Successfully imported data from {db_file}")
            master_con.execute(f"DETACH state_db;")  # Detach after use
        except Exception as e:
            print(f"❌ Error importing data from {db_file}: {e}")
            # Ensure detachment even if an error occurs during insertion
            try:
                master_con.execute(f"DETACH state_db;")
            except Exception as detach_e:
                print(f"❌ Error detaching state_db for {db_file}: {detach_e}")

    # Re-index the master table to have a continuous primary key
    print("Re-indexing master table...")
    master_con.execute(
        "CREATE TABLE foundations_new AS SELECT ROW_NUMBER() OVER () AS id, * EXCLUDE (id) FROM foundations;"
    )
    master_con.execute("DROP TABLE foundations;")
    master_con.execute("ALTER TABLE foundations_new RENAME TO foundations;")
    master_con.execute("ALTER TABLE foundations ADD PRIMARY KEY (id);")
    print("✅ Master table re-indexed with new primary key.")

    master_con.close()
    print(f"🎉 Master database created at {MASTER_DB_PATH}")


if __name__ == "__main__":
    create_master_db()


# %%
# get all data from the duckdb and put into a dataframe
def load_master_db_to_dataframe():
    """
    Loads the master DuckDB database into a pandas DataFrame.
    """
    if not os.path.exists(MASTER_DB_PATH):
        print(f"❌ Error: Master database '{MASTER_DB_PATH}' not found.")
        return None

    con = duckdb.connect(MASTER_DB_PATH)
    df = con.execute("SELECT * FROM foundations;").fetchdf()
    con.close()
    return df


df = load_master_db_to_dataframe()


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


OUTPUT_MASTER_DB_PATH = os.path.join(OUTPUT_DIR, "foundations_master_enhanced.duckdb")
save_dataframe_to_duckdb(df, OUTPUT_MASTER_DB_PATH)

# %%

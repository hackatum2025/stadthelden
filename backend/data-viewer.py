# %%
import duckdb
import pandas as pd

# Connect to the database file created by the scraper
db_path = "foundations.duckdb"

try:
    con = duckdb.connect(db_path)

    # Load all data into a pandas DataFrame and output it
    df_all: pd.DataFrame = con.sql("SELECT * FROM foundations").df()
    print(f"✅ Total foundations scraped: {len(df_all)}")

    print("\n📄 All records:")
    # Print entire DataFrame (may be large); adjust or export if needed
    print(df_all.to_string(index=False))

    # 3. (Optional) Export to CSV if you want to open in Excel
    # Uncomment the lines below to export
    # con.sql("COPY foundations TO 'foundations_export.csv' (HEADER, DELIMITER ',')")
    # print("\n📄 Exported all data to 'foundations_export.csv'")

except Exception as e:
    print(f"❌ Error opening database: {e}")
    print("Make sure 'foundations.duckdb' exists in this folder.")

# %%

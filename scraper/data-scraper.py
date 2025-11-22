
#!/usr/bin/env python3
"""
Web scraper using crawl4ai to crawl all Bavarian foundation URLs
and save the markdown results to a new DuckDB database.
"""
import duckdb
import pandas as pd
import os
from crawl4ai import AsyncWebCrawler
import asyncio
from urllib.parse import urlparse
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Database paths
OUTPUT_DIR = "data"
MASTER_DB_PATH = os.path.join(OUTPUT_DIR, "foundations_master_enhanced.duckdb")
CRAWLED_DB_PATH = os.path.join(OUTPUT_DIR, "foundations_bayern_crawled.duckdb")


def normalize_url(url):
    """Normalize URL by adding https:// if no protocol is present."""
    if not url:
        return None
    url = url.strip()
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    return url


async def crawl_url(crawler, url, foundation_id, name):
    """Crawl a single URL and return the markdown content."""
    try:
        normalized_url = normalize_url(url)
        logger.info(f"Crawling {normalized_url} (ID: {foundation_id}, Name: {name})")
        
        result = await crawler.arun(url=normalized_url)
        
        if result.success:
            markdown_content = result.markdown or ""
            logger.info(f"✅ Successfully crawled {normalized_url} ({len(markdown_content)} chars)")
            return {
                'foundation_id': foundation_id,
                'url': url,
                'normalized_url': normalized_url,
                'markdown': markdown_content,
                'success': True,
                'error': None
            }
        else:
            error_msg = result.error_message or "Unknown error"
            logger.warning(f"❌ Failed to crawl {normalized_url}: {error_msg}")
            return {
                'foundation_id': foundation_id,
                'url': url,
                'normalized_url': normalized_url,
                'markdown': None,
                'success': False,
                'error': error_msg
            }
    except Exception as e:
        logger.error(f"❌ Exception while crawling {url}: {str(e)}")
        return {
            'foundation_id': foundation_id,
            'url': url,
            'normalized_url': normalize_url(url),
            'markdown': None,
            'success': False,
            'error': str(e)
        }


async def crawl_all_bavarian_urls(batch_size=10):
    """Crawl all Bavarian foundation URLs in batches."""
    # Connect to master database
    if not os.path.exists(MASTER_DB_PATH):
        logger.error(f"❌ Master database not found at {MASTER_DB_PATH}")
        return
    
    con = duckdb.connect(MASTER_DB_PATH)
    
    # Get all Bavarian foundations with URLs
    query = """
        SELECT id, name, url
        FROM foundations
        WHERE bundesland = 'Bayern' AND url IS NOT NULL AND url != ''
        ORDER BY id
    """
    df = con.execute(query).fetchdf()
    con.close()
    
    total_urls = len(df)
    logger.info(f"Found {total_urls} Bavarian foundations with URLs to crawl")
    
    if total_urls == 0:
        logger.warning("No URLs found to crawl")
        return
    
    # Create output database
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
    
    output_con = duckdb.connect(CRAWLED_DB_PATH)
    output_con.execute("""
        CREATE TABLE IF NOT EXISTS crawled_content (
            id INTEGER PRIMARY KEY,
            foundation_id INTEGER,
            url VARCHAR,
            normalized_url VARCHAR,
            markdown TEXT,
            success BOOLEAN,
            error VARCHAR,
            crawled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    output_con.close()
    
    # Crawl URLs in batches
    async with AsyncWebCrawler() as crawler:
        results = []
        
        for i in range(0, total_urls, batch_size):
            batch = df.iloc[i:i+batch_size]
            logger.info(f"Processing batch {i//batch_size + 1}/{(total_urls + batch_size - 1)//batch_size} "
                       f"(URLs {i+1}-{min(i+batch_size, total_urls)} of {total_urls})")
            
            # Create tasks for this batch
            tasks = [
                crawl_url(crawler, row['url'], row['id'], row['name'])
                for _, row in batch.iterrows()
            ]
            
            # Execute batch
            batch_results = await asyncio.gather(*tasks)
            results.extend(batch_results)
            
            # Save batch results to database
            batch_df = pd.DataFrame(batch_results)
            output_con = duckdb.connect(CRAWLED_DB_PATH)
            output_con.execute("""
                INSERT INTO crawled_content (foundation_id, url, normalized_url, markdown, success, error)
                SELECT foundation_id, url, normalized_url, markdown, success, error
                FROM batch_df
            """)
            output_con.close()
            
            logger.info(f"✅ Saved batch {i//batch_size + 1} to database")
    
    # Final summary
    output_con = duckdb.connect(CRAWLED_DB_PATH)
    success_count = output_con.execute("SELECT COUNT(*) FROM crawled_content WHERE success = true").fetchone()[0]
    fail_count = output_con.execute("SELECT COUNT(*) FROM crawled_content WHERE success = false").fetchone()[0]
    output_con.close()
    
    logger.info(f"🎉 Crawling complete!")
    logger.info(f"   Total URLs: {total_urls}")
    logger.info(f"   Successful: {success_count}")
    logger.info(f"   Failed: {fail_count}")
    logger.info(f"   Database saved to: {CRAWLED_DB_PATH}")


def main():
    """Main entry point."""
    # Ensure logs directory exists
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    logger.info("Starting Bavarian foundation URL crawler...")
    asyncio.run(crawl_all_bavarian_urls(batch_size=10))


if __name__ == "__main__":
    main()


# %%

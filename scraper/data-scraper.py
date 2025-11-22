
#!/usr/bin/env python3
"""
Web scraper using crawl4ai to crawl all Bavarian foundation URLs from foundations_Bayern_enhanced.duckdb
and save the markdown results to a CSV file.
"""
import duckdb
import pandas as pd
import os
import csv
from crawl4ai import AsyncWebCrawler
import asyncio
import logging
from datetime import datetime

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

# Configuration
FORCE_RESCRAPE = False  # Set to True to re-crawl all URLs, even if already crawled

# File paths
OUTPUT_DIR = "data"
ENHANCED_DB_PATH = os.path.join(OUTPUT_DIR, "foundations_Bayern_enhanced.duckdb")
CRAWLED_CSV_PATH = os.path.join(OUTPUT_DIR, "foundations_Bayern_crawled.csv")


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
    """Crawl all Bavarian foundation URLs from foundations_Bayern_enhanced.duckdb in batches."""
    # Connect to enhanced Bayern database
    if not os.path.exists(ENHANCED_DB_PATH):
        logger.error(f"❌ Enhanced Bayern database not found at {ENHANCED_DB_PATH}")
        return
    
    con = duckdb.connect(ENHANCED_DB_PATH)
    
    # Get all foundations with URLs (all are Bayern since this is the Bayern database)
    query = """
        SELECT id, name, url
        FROM foundations
        WHERE url IS NOT NULL AND url != ''
        ORDER BY id
    """
    df = con.execute(query).fetchdf()
    con.close()
    
    total_urls = len(df)
    skipped_count = 0  # Track how many URLs were skipped
    logger.info(f"Found {total_urls} Bavarian foundations with URLs to crawl")
    
    if total_urls == 0:
        logger.warning("No URLs found to crawl")
        return
    
    # Create output directory
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
    
    # Check which URLs have already been crawled from CSV
    original_count = len(df)
    already_crawled_urls = set()
    
    if not FORCE_RESCRAPE and os.path.exists(CRAWLED_CSV_PATH):
        try:
            existing_df = pd.read_csv(CRAWLED_CSV_PATH)
            if 'normalized_url' in existing_df.columns:
                already_crawled_urls = set(existing_df['normalized_url'].dropna().tolist())
                logger.info(f"📖 Found {len(already_crawled_urls)} already crawled URLs in CSV")
        except Exception as e:
            logger.warning(f"Could not read existing CSV: {e}")
    
    # Normalize URLs and filter out already crawled ones
    df['normalized_url'] = df['url'].apply(normalize_url)
    
    if not FORCE_RESCRAPE:
        df = df[~df['normalized_url'].isin(already_crawled_urls)]
        skipped_count = original_count - len(df)
        if skipped_count > 0:
            logger.info(f"⏭️  Skipping {skipped_count} URLs that have already been crawled")
    else:
        logger.info("🔄 FORCE_RESCRAPE is enabled - will re-crawl all URLs")
    
    # Update total_urls after filtering
    total_urls = len(df)
    
    if total_urls == 0:
        logger.info("✅ All URLs have already been crawled (or no URLs found)")
        if skipped_count > 0:
            logger.info(f"   Skipped: {skipped_count} already crawled URLs")
        return
    
    logger.info(f"Found {total_urls} URLs to crawl (after filtering)")
    
    # Crawl URLs in batches
    async with AsyncWebCrawler() as crawler:
        all_results = []
        
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
            all_results.extend(batch_results)
            
            # Convert to DataFrame and add timestamp
            batch_df = pd.DataFrame(batch_results)
            batch_df['crawled_at'] = datetime.now().isoformat()
            
            # Reorder columns for CSV
            batch_df = batch_df[['foundation_id', 'url', 'normalized_url', 'markdown', 'success', 'error', 'crawled_at']]
            
            # Handle None values and ensure all text fields are strings
            batch_df['markdown'] = batch_df['markdown'].fillna('').astype(str)
            batch_df['error'] = batch_df['error'].fillna('').astype(str)
            batch_df['url'] = batch_df['url'].fillna('').astype(str)
            batch_df['normalized_url'] = batch_df['normalized_url'].fillna('').astype(str)
            
            # Append to CSV with proper escaping to handle commas, quotes, newlines, etc.
            # QUOTE_MINIMAL quotes fields only when necessary (contains delimiter, quote, or newline)
            # This is the standard CSV format and handles all special characters properly
            file_exists = os.path.exists(CRAWLED_CSV_PATH)
            batch_df.to_csv(
                CRAWLED_CSV_PATH,
                mode='a',
                header=not file_exists,
                index=False,
                encoding='utf-8',
                quoting=csv.QUOTE_NONNUMERIC,  # Quote only when necessary (standard CSV)
                escapechar=None,  # Use double quotes for escaping (default)
                doublequote=True,  # Double quotes when escaping quotes (e.g., " becomes "")
                lineterminator='\n'  # Explicit line terminator
            )
            
            logger.info(f"✅ Saved batch {i//batch_size + 1} to CSV")
    
    # Final summary
    if os.path.exists(CRAWLED_CSV_PATH):
        summary_df = pd.read_csv(CRAWLED_CSV_PATH)
        total_in_csv = len(summary_df)
        success_count = len(summary_df[summary_df['success'] == True]) if 'success' in summary_df.columns else 0
        fail_count = len(summary_df[summary_df['success'] == False]) if 'success' in summary_df.columns else 0
    else:
        total_in_csv = 0
        success_count = 0
        fail_count = 0
    
    logger.info(f"🎉 Crawling complete!")
    logger.info(f"   URLs processed this run: {total_urls}")
    if skipped_count > 0:
        logger.info(f"   URLs skipped (already crawled): {skipped_count}")
    logger.info(f"   Total in CSV: {total_in_csv}")
    logger.info(f"   Successful: {success_count}")
    logger.info(f"   Failed: {fail_count}")
    logger.info(f"   CSV saved to: {CRAWLED_CSV_PATH}")


def main():
    """Main entry point."""
    # Ensure logs directory exists
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    logger.info("Starting Bavarian foundation URL crawler from foundations_Bayern_enhanced.duckdb...")
    asyncio.run(crawl_all_bavarian_urls(batch_size=10))


if __name__ == "__main__":
    main()


# %%

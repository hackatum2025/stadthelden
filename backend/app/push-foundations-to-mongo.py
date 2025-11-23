"""
SETUP:
add google ai studio output files as txt files to crawling-data directory
run this script to push the data to the database

# SET ENV VARS
cd backend
uv sync

uv run -- python -m app.push-foundations-to-mongo
"""
import asyncio
import json
import re
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

# Path to crawling-data directory
data_dir = Path("/Users/larsheimann/coding-projects/stadthelden/backend/crawling-data")

# Regex pattern to match source citations like [[6](https://...)]
source_pattern = re.compile(r'\[\[.*?\]\(.*?\)\]')


async def push_foundations_to_mongo():
    """Load foundation data from txt files and push to MongoDB."""
    print("Connecting to MongoDB...")
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DB_NAME]
    foundations_collection = db.foundations_test
    
    try:
        print(f"Connected to MongoDB: {settings.MONGODB_DB_NAME}")
        print(f"Foundations collection: {foundations_collection.name}\n")
        
        # Get all txt files
        txt_files = sorted(data_dir.glob("*.txt"))
        
        print(f"Found {len(txt_files)} txt files to process\n")
        
        inserted_count = 0
        updated_count = 0
        error_count = 0
        
        for txt_file in txt_files:
            print(f"Processing {txt_file.name}...")
            
            # Read the file content
            with open(txt_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Remove all source citations using regex
            cleaned_content = source_pattern.sub('', content)
            
            # Parse the cleaned JSON
            try:
                data = json.loads(cleaned_content)
                
                # Generate _id from filename if not present
                if '_id' not in data:
                    # Use filename without extension as _id, or generate from name
                    foundation_id = txt_file.stem.replace('_', '-').replace(' ', '-').lower()
                    data['_id'] = foundation_id
                
                # Add source file name for reference
                data['source_file'] = txt_file.stem
                
                # Check if document already exists
                existing = await foundations_collection.find_one({'_id': data['_id']})
                
                if existing:
                    # Update existing document
                    await foundations_collection.replace_one({'_id': data['_id']}, data)
                    updated_count += 1
                    print(f"  ✓ Updated existing foundation: {data.get('name', data['_id'])}")
                else:
                    # Insert new document
                    await foundations_collection.insert_one(data)
                    inserted_count += 1
                    print(f"  ✓ Inserted new foundation: {data.get('name', data['_id'])}")
                
            except json.JSONDecodeError as e:
                error_count += 1
                print(f"  ✗ Error parsing JSON from {txt_file.name}: {e}")
                continue
            except Exception as e:
                error_count += 1
                print(f"  ✗ Error processing {txt_file.name}: {e}")
                continue
        
        # Verify
        count = await foundations_collection.count_documents({})
        
        print(f"\n{'='*50}")
        print(f"Summary:")
        print(f"  Inserted: {inserted_count}")
        print(f"  Updated: {updated_count}")
        print(f"  Errors: {error_count}")
        print(f"  Total processed: {inserted_count + updated_count}")
        print(f"  Total foundations in database: {count}")
        print(f"{'='*50}")
        
    finally:
        client.close()
        print("\n✅ Database update completed!")


if __name__ == "__main__":
    asyncio.run(push_foundations_to_mongo())

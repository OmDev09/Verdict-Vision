import os
import re
import psycopg2
from psycopg2.extras import execute_values
import fitz  # PyMuPDF
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '../apps/api/.env')
load_dotenv(env_path)

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL not found in apps/api/.env")
    exit(1)

def extract_metadata_from_filename(filename, year):
    # Example: A_M_Mohan_vs_The_State_Rep_By_Sho_on_20_March_2024_1.PDF
    name_without_ext = os.path.splitext(filename)[0]
    
    title = name_without_ext
    
    # Try to split by '_on_' to clean up the title
    if '_on_' in name_without_ext:
        parts = name_without_ext.split('_on_')
        title = parts[0]
        
    # Clean up underscores
    title = title.replace('_', ' ').strip()
    
    # Capitalize words for better display
    title = ' '.join(word.capitalize() for word in title.split())
    
    return title

def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        doc = fitz.open(pdf_path)
        for page in doc:
            text += page.get_text()
        doc.close()
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
        return None
        
    cleaned_text = text.strip().replace('\x00', '')  # Remove null bytes which pg hates
    return cleaned_text if cleaned_text else None

def process_and_ingest(root_dir):
    print(f"Connecting to database...")
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    batch_size = 500
    batch_data = []
    total_processed = 0
    total_inserted = 0
    
    print(f"Scanning directory: {root_dir}")
    
    for year_folder in sorted(os.listdir(root_dir)):
        year_path = os.path.join(root_dir, year_folder)
        
        if not os.path.isdir(year_path) or not year_folder.isdigit():
            continue
            
        year = int(year_folder)
        print(f"\nProcessing Year: {year}")
        
        for filename in os.listdir(year_path):
            if not filename.lower().endswith(".pdf"):
                continue
                
            file_path = os.path.join(year_path, filename)
            total_processed += 1
            
            title = extract_metadata_from_filename(filename, year)
            text = extract_text_from_pdf(file_path)
            
            if not text or len(text) < 100:
                # Skip broken or empty PDFs
                continue
                
            batch_data.append((
                title[:500], 
                'Supreme Court of India', 
                year, 
                None, # citation
                text, 
                None # pdf_url
            ))
            
            if len(batch_data) >= batch_size:
                _insert_batch(cursor, conn, batch_data)
                total_inserted += len(batch_data)
                print(f"  Inserted {total_inserted} total cases so far...")
                batch_data = []
                
    # Insert remaining
    if batch_data:
        _insert_batch(cursor, conn, batch_data)
        total_inserted += len(batch_data)
        
    print(f"\nDone! Processed {total_processed} files, successfully inserted {total_inserted} cases.")
    cursor.close()
    conn.close()

def _insert_batch(cursor, conn, data):
    query = """
        INSERT INTO "cases" ("id", "title", "court", "year", "citation", "judgment_text", "pdf_url", "created_at", "updated_at")
        VALUES %s
    """
    
    # We need to map our simple tuple to the full Prisma model
    import uuid
    from datetime import datetime, timezone
    
    now = datetime.now(timezone.utc)
    # Mapped Data: id, title, court, year, citation, judgmentText, pdfUrl, createdAt, updatedAt
    formatted_data = [
        (str(uuid.uuid4()), row[0], row[1], row[2], row[3], row[4], row[5], now, now)
        for row in data
    ]
    
    try:
        execute_values(cursor, query, formatted_data)
        conn.commit()
    except Exception as e:
        print(f"Batch Insert Error: {e}")
        conn.rollback()

if __name__ == "__main__":
    dataset_dir = os.path.join(os.path.dirname(__file__), 'data/extracted/supreme_court_judgments')
    
    if not os.path.exists(dataset_dir):
        print(f"Error: Could not find extracted dataset at {dataset_dir}")
        exit(1)
        
    process_and_ingest(dataset_dir)

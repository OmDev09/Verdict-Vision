import psycopg2
import os
import sys
from urllib.parse import urlparse

db_url = "postgresql://postgres:pn7RT9NZa8epWaae@db.cggyuyasrajmdeuqghqe.supabase.co:5432/postgres"

print("Connecting to Supabase PostgreSQL...")
try:
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cursor = conn.cursor()
    
    # Supabase has strict connection timeouts for safety. Since we are building an index 
    # over thousands of huge text strings, we need to disable the timeout for this session.
    cursor.execute("SET statement_timeout = 0;")
    
    print("Executing GIN Index creation. This might take a minute on 26k rows...")
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS cases_judgment_text_idx 
        ON cases USING GIN (
            (setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(citation, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(judgment_text, '')), 'B'))
        );
    """)
    print("GIN Index created successfully!")
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)

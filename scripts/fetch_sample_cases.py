import requests
import json
import os

API_URL = "https://datasets-server.huggingface.co/rows?dataset=vihaannnn%2FIndian-Supreme-Court-Judgements-Chunked&config=default&split=train&offset=0&length=100"

def fetch_cases():
    print(f"Fetching 100 sample cases from vihaannnn/Indian-Supreme-Court-Judgements-Chunked...")
    try:
        response = requests.get(API_URL)
        response.raise_for_status()
        data = response.json()
        
        cases = []
        for row in data.get('rows', []):
            row_data = row.get('row', {})
            cases.append({
                "title": row_data.get("case_title", "Supreme Court Judgment"),
                "court": "Supreme Court of India",
                "year": 2023, # Defaulting year, update parser logic if year exists in dataset
                "judgmentText": row_data.get("judgment_text", str(row_data.get("chunk_content", "")))[:50000],
            })
            
        output_path = os.path.join(os.path.dirname(__file__), "sample_cases.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(cases, f, indent=2, ensure_ascii=False)
            
        print(f"Successfully downloaded {len(cases)} cases into {output_path}")
        
    except Exception as e:
        print(f"Failed to fetch cases: {e}")

if __name__ == "__main__":
    fetch_cases()

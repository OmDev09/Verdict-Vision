import requests
import json
import sys

# 0. Register the test user first
print("Registering test user...")
try:
    requests.post(
        'http://localhost:4000/auth/register/lawyer',
        json={
            "name": "Test Lawyer",
            "email": "testlawyer@example.com",
            "password": "Password123",
            "enrollmentNo": "BR/20/123456"
        }
    )
    print("Registration step complete (user might already exist, which is fine)")
except Exception as e:
    print(f"Registration request error (ignoring): {e}")

# 1. Login to get JWT Token
print("Logging in to get JWT token...")
login_response = requests.post(
    'http://localhost:4000/auth/login',
    json={
        "email": "testlawyer@example.com",
        "password": "Password123"
    }
)

if login_response.status_code >= 300:
    print(f"Login Failed: {login_response.text}")
    sys.exit(1)

token = login_response.json().get('accessToken')
print("Successfully obtained access token!")

# 2. Perform the Search
print("\nExecuting Vectorless RAG Search...")
search_query = "What is the Supreme Court stance on anticipatory bail in money laundering cases under PMLA?"
print(f"Query: \"{search_query}\"\n")

search_response = requests.post(
    'http://localhost:4000/search',
    headers={
        "Authorization": f"Bearer {token}"
    },
    json={
        "query": search_query
    }
)

if search_response.status_code != 201 and search_response.status_code != 200:
    print(f"Search Failed: {search_response.status_code} - {search_response.text}")
    sys.exit(1)

result = search_response.json()

print("================ RAG AI RESPONSE ================\n")
print(result.get('response', 'No response parsed.'))
print("\n================ RETRIEVED CASES ================")
cases = result.get('similarCases', [])
print(f"Found {len(cases)} Lexical Matches.\n")
for idx, c in enumerate(cases):
    print(f"[{idx+1}] {c.get('title')} ({c.get('year')})")
    print(f"    Court: {c.get('court')}\n")

print("=================================================")
print(f"Credits Remaining: {result.get('creditsRemaining', 'Unknown')}")

import requests
import time
import json
import os

BASE_URL = "http://localhost:8000/api/v1"

# 1. Authenticate (Get Token)
def get_auth_headers():
    # Use the mock token if in dev mode, or a real one if possible. 
    # Since we enabled clock skew fix, let's try to simulate a login or use a known user.
    # For now, we'll try the mock token approach if ENABLE_MOCK_AUTH is on,
    # OR we can assume the user has a valid token.
    # Actually, let's try to register a new user to get a token.
    # WAIT: We can't generate a Firebase token without the client SDK or a service account.
    
    # HACK for testing: Use the same technique as the frontend in mock mode OR
    # Just rely on the fact that we might have MOCK_AUTH enabled? 
    # No, MOCK_AUTH is likely false.
    
    # Alternative: We can use the Backend's "test_user" if available, or just skip auth if endpoints allow?
    # No, endpoints are protected.
    
    # REALISTIC PATH: We can use the Firebase Emulator if running? No.
    # We can use a script that just hits the "analyze" endpoint directly if we import app?
    # No, better to test via HTTP.
    
    # Let's use a placeholder token and hope MOCK_AUTH is enabled, OR
    # ask the user to provide a token? No, that's bad DX.
    
    # Best bet: The user is running locally. We can probably toggle MOCK_AUTH for this test?
    # Or, we can use a "magic" token if we implement a backdoor?
    # Let's check security.py... it has a MOCK_AUTH check!
    # "if os.getenv("ENABLE_MOCK_AUTH") == "true": ..."
    
    # Let's try to use the verify_token logic.
    return {"Authorization": "Bearer mock-token"}

import uuid

# 2. Test Data
unique_id = str(uuid.uuid4())
GOOD_ESSAY = f"""The Integration of Artificial Intelligence in Modern Healthcare

Artificial Intelligence (AI) is transforming the landscape of modern healthcare, offering unprecedented opportunities for improving patient outcomes and operational efficiency. By leveraging machine learning algorithms and big data analytics, AI systems can diagnose diseases with higher accuracy than human practitioners in some fields, such as radiology and dermatology.

Furthermore, AI-driven predictive analytics allow for early intervention by identifying at-risk patients before conditions deteriorate. For instance, sepsis prediction models have significantly reduced mortality rates in intensive care units. Additionally, AI streamlines administrative tasks, reducing the burden on healthcare professionals and allowing them to focus more on patient care.

However, the integration of AI is not without challenges. Data privacy concerns, algorithmic bias, and the potential displacement of jobs are significant ethical issues that must be addressed. To ensure the responsible deployment of AI, robust regulatory frameworks and continuous human oversight are essential.

In conclusion, while challenges remain, the potential benefits of AI in healthcare are immense. With careful management, AI can usher in a new era of precision medicine and equitable care.

[Ref: {unique_id}]"""

BAD_ESSAY = f"""ai is good for helthcare. it helps doctors to find sick people.
computers are smart and they can see xrays better than humans. also they can tell if you will get sick soon.
this is cool because less people die.
but sometimes ai makes mistakes. and it steals jobs. that is bad.
we need to be careful with ai.
end of essay.

[Ref: {unique_id}]"""

# 3. Execution
from pymongo import MongoClient

def reset_plagiarism_db():
    print("🧹 Clearing Plagiarism Database for clean benchmark...")
    try:
        client = MongoClient("mongodb://admin:changeme@localhost:27017/")
        db = client["ai_evaluation"]
        db["plagiarism_hashes"].delete_many({})
        print("   ✅ Plagiarism hashes cleared.")
    except Exception as e:
        print(f"   ⚠️ Failed to clear DB (ensure MongoDB is reachable at localhost:27017): {e}")

def run_benchmark():
    reset_plagiarism_db()
    print("🚀 Starting Authenticity Benchmark...")
    
    # We need to make sure we can talk to the API
    try:
        requests.get(f"{BASE_URL}/docs", timeout=5)
    except Exception:
        print("❌ Backend is not running at localhost:8000")
        return

    # Create dummy files
    with open("good_essay.txt", "w") as f:
        f.write(GOOD_ESSAY)
    with open("bad_essay.txt", "w") as f:
        f.write(BAD_ESSAY)

    headers = get_auth_headers()
    
    # Verify Auth
    print("\n🔐 Verifying Authentication...")
    try:
        r = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        if r.status_code == 401:
            print("⚠️  Auth Failed (401).")
            print(f"    Response: {r.text}")
            print("    Make sure backend has ENABLE_MOCK_AUTH=true and was restarted.")
            return
        elif r.status_code != 200:
             print(f"❌ Auth Error ({r.status_code}): {r.text}")
             return
        else:
             user = r.json()
             print(f"✅ Authenticated as: {user.get('email')} (UID: {user.get('uid')})")

    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return

    # Upload Good Essay
    print("\n📄 Uploading 'Good Essay'...")
    files = {'file': ('good_essay.txt', open('good_essay.txt', 'rb'), 'text/plain')}
    r = requests.post(f"{BASE_URL}/documents/upload", headers=headers, files=files)
    if r.status_code not in [200, 201]:
        print(f"❌ Upload Failed: {r.text}")
        return
    good_doc_id = r.json()['_id']
    print(f"   ID: {good_doc_id}")

    # Upload Bad Essay
    print("\n📄 Uploading 'Bad Essay'...")
    files = {'file': ('bad_essay.txt', open('bad_essay.txt', 'rb'), 'text/plain')}
    r = requests.post(f"{BASE_URL}/documents/upload", headers=headers, files=files)
    if r.status_code not in [200, 201]:
        print(f"❌ Upload Failed: {r.text}")
        return
    bad_doc_id = r.json()['_id']
    print(f"   ID: {bad_doc_id}")

    # Poll for results
    print("\n⏳ Waiting for evaluation...")
    for _ in range(60): # Wait up to 60s
        time.sleep(1)
        
        # Check Good
        r_good = requests.get(f"{BASE_URL}/evaluation/results/{good_doc_id}", headers=headers)
        # Check Bad
        r_bad = requests.get(f"{BASE_URL}/evaluation/results/{bad_doc_id}", headers=headers)
        
        if r_good.status_code == 200 and r_bad.status_code == 200:
            res_good = r_good.json()
            res_bad = r_bad.json()
            
            # Use 'final_score' from the response if available, or check doc status
            # Actually, results endpoint usually returns the score object
            
            print(f"\n📊 Results Analysis:")
            print(f"   Good Essay Score: {res_good.get('final_score', 'N/A')}")
            print(f"     - Grammar: {res_good.get('components', {}).get('grammar', {}).get('score', 'N/A')}")
            print(f"     - Plagiarism: {res_good.get('components', {}).get('plagiarism', {}).get('percentage', 'N/A')}% (Score: {100 - res_good.get('components', {}).get('plagiarism', {}).get('percentage', 0)})")
            print(f"     - Relevance: {res_good.get('components', {}).get('topic_relevance', {}).get('score', 'N/A')}")
            
            print(f"   Bad Essay Score:  {res_bad.get('final_score', 'N/A')}")
            print(f"     - Grammar: {res_bad.get('components', {}).get('grammar', {}).get('score', 'N/A')}")
            print(f"     - Plagiarism: {res_bad.get('components', {}).get('plagiarism', {}).get('percentage', 'N/A')}%")
            print(f"     - Relevance: {res_bad.get('components', {}).get('topic_relevance', {}).get('score', 'N/A')}")
            
            if res_good.get('final_score') is None or res_bad.get('final_score') is None:
                 print("⚠️  Scores are missing. Full Response:")
                 print(f"Good: {res_good}")
                 print(f"Bad: {res_bad}")
                 continue # Wait more?

            # Assertions
            if res_good.get('final_score', 0) > res_bad.get('final_score', 0):
                 print("\n✅ PASSED: System correctly scored the high-quality essay higher.")
            else:
                 print("\n❌ FAILED: Scoring logic inconsistency detected.")
                 
            if res_good.get('final_score', 0) > 80:
                 print("✅ PASSED: Good essay recognized as high quality (>80).")
            else:
                 print(f"⚠️  WARNING: Good essay score ({res_good.get('final_score')}) is lower than expected.")

            if res_bad.get('final_score', 0) < 60:
                 print("✅ PASSED: Bad essay recognized as low quality (<60).")
            else:
                 print(f"⚠️  WARNING: Bad essay score ({res_bad.get('final_score')}) is higher than expected.")
                 
            break
            
    # Cleanup
    os.remove("good_essay.txt")
    os.remove("bad_essay.txt")

if __name__ == "__main__":
    run_benchmark()

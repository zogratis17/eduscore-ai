"""
EduScore AI — Comprehensive Test Suite
Tests: Health, Auth, Upload, Evaluation Pipeline, Analytics, Rubrics
Requires: ENABLE_MOCK_AUTH=true on the backend container
"""

import requests
import time
import json
import uuid
import sys
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"
HEADERS = {"Authorization": "Bearer mock-token"}
RESULTS = {"passed": 0, "failed": 0, "warnings": 0, "tests": []}


def record(name, status, detail=""):
    icon = {"PASS": "✅", "FAIL": "❌", "WARN": "⚠️"}[status]
    RESULTS["tests"].append({"name": name, "status": status, "detail": detail})
    if status == "PASS":
        RESULTS["passed"] += 1
    elif status == "FAIL":
        RESULTS["failed"] += 1
    else:
        RESULTS["warnings"] += 1
    print(f"  {icon} {name}: {detail}" if detail else f"  {icon} {name}")


# ═══════════════════════════════════════════════════════════════════
# PHASE 1: SERVICE HEALTH
# ═══════════════════════════════════════════════════════════════════
def test_health():
    print("\n" + "=" * 60)
    print("PHASE 1: SERVICE HEALTH")
    print("=" * 60)

    try:
        r = requests.get(f"{BASE_URL}/health/status", timeout=10)
        data = r.json()

        for svc in data.get("services", []):
            name = svc["name"]
            status = svc["status"]
            if status == "online":
                record(f"{name} Health", "PASS")
            elif status == "rate_limited":
                record(f"{name} Health", "WARN", "Rate limited but reachable")
            else:
                record(f"{name} Health", "FAIL", f"Status: {status}")

        overall = data.get("overall")
        if overall == "healthy":
            record("Overall System Health", "PASS", "All services online")
        else:
            record("Overall System Health", "WARN", f"Overall: {overall}")
    except Exception as e:
        record("Health Endpoint", "FAIL", str(e))


# ═══════════════════════════════════════════════════════════════════
# PHASE 2: AUTHENTICATION
# ═══════════════════════════════════════════════════════════════════
def test_auth():
    print("\n" + "=" * 60)
    print("PHASE 2: AUTHENTICATION")
    print("=" * 60)

    # Register mock user
    r = requests.post(f"{BASE_URL}/auth/register", headers=HEADERS)
    if r.status_code in [200, 201]:
        record("Mock User Registration", "PASS", f"User: {r.json().get('email')}")
    else:
        record("Mock User Registration", "FAIL", f"Status {r.status_code}: {r.text[:100]}")
        return False

    # Get current user
    r = requests.get(f"{BASE_URL}/auth/me", headers=HEADERS)
    if r.status_code == 200:
        user = r.json()
        record("Get Current User (GET /auth/me)", "PASS", f"UID: {user.get('firebase_uid')}")
    else:
        record("Get Current User (GET /auth/me)", "FAIL", f"Status {r.status_code}")
        return False

    # Test invalid token
    r = requests.get(f"{BASE_URL}/auth/me", headers={"Authorization": "Bearer bad-token"})
    if r.status_code == 401:
        record("Invalid Token Rejected", "PASS", "401 returned as expected")
    else:
        record("Invalid Token Rejected", "FAIL", f"Expected 401, got {r.status_code}")

    return True


# ═══════════════════════════════════════════════════════════════════
# PHASE 3: RUBRIC MANAGEMENT
# ═══════════════════════════════════════════════════════════════════
def test_rubrics():
    print("\n" + "=" * 60)
    print("PHASE 3: RUBRIC MANAGEMENT")
    print("=" * 60)

    # Seed default rubric
    r = requests.post(f"{BASE_URL}/rubrics/seed", headers=HEADERS)
    if r.status_code in [200, 201]:
        record("Seed Default Rubric", "PASS", r.json().get("message"))
    else:
        record("Seed Default Rubric", "FAIL", f"Status {r.status_code}: {r.text[:100]}")

    # List rubrics
    r = requests.get(f"{BASE_URL}/rubrics/", headers=HEADERS)
    if r.status_code == 200:
        rubrics = r.json()
        record("List Rubrics", "PASS", f"Found {len(rubrics)} rubric(s)")

        # Validate default rubric weights sum to 100
        for rub in rubrics:
            if rub.get("is_default"):
                total_weight = sum(c["weight"] for c in rub.get("criteria", []))
                if abs(total_weight - 100) < 0.1:
                    record("Default Rubric Weights", "PASS", f"Total: {total_weight}")
                else:
                    record("Default Rubric Weights", "FAIL", f"Weights sum to {total_weight}, expected 100")
    else:
        record("List Rubrics", "FAIL", f"Status {r.status_code}")

    # Test creating a rubric with bad weights (should fail)
    bad_rubric = {
        "name": "Bad Rubric",
        "description": "Test",
        "criteria": [
            {"name": "Grammar", "description": "Test", "weight": 50},
            {"name": "Vocab", "description": "Test", "weight": 30},
        ]
    }
    r = requests.post(f"{BASE_URL}/rubrics/", headers=HEADERS, json=bad_rubric)
    if r.status_code == 400:
        record("Reject Invalid Rubric Weights (80≠100)", "PASS", "400 returned as expected")
    else:
        record("Reject Invalid Rubric Weights (80≠100)", "FAIL", f"Expected 400, got {r.status_code}")


# ═══════════════════════════════════════════════════════════════════
# PHASE 4: DOCUMENT UPLOAD & EVALUATION PIPELINE
# ═══════════════════════════════════════════════════════════════════

GOOD_ESSAY = """The Integration of Artificial Intelligence in Modern Healthcare

Artificial Intelligence (AI) is transforming the landscape of modern healthcare, offering unprecedented opportunities for improving patient outcomes and operational efficiency. By leveraging machine learning algorithms and big data analytics, AI systems can diagnose diseases with higher accuracy than human practitioners in some fields, such as radiology and dermatology.

Furthermore, AI-driven predictive analytics allow for early intervention by identifying at-risk patients before conditions deteriorate. For instance, sepsis prediction models have significantly reduced mortality rates in intensive care units. Additionally, AI streamlines administrative tasks, reducing the burden on healthcare professionals and allowing them to focus more on patient care.

However, the integration of AI is not without challenges. Data privacy concerns, algorithmic bias, and the potential displacement of jobs are significant ethical issues that must be addressed. To ensure the responsible deployment of AI, robust regulatory frameworks and continuous human oversight are essential.

In conclusion, while challenges remain, the potential benefits of AI in healthcare are immense. With careful management, AI can usher in a new era of precision medicine and equitable care."""

BAD_ESSAY = """ai is good for helthcare. it helps doctors to find sick people.
computers are smart and they can see xrays better than humans. also they can tell if you will get sick soon.
this is cool because less people die.
but sometimes ai makes mistakes. and it steals jobs. that is bad.
we need to be careful with ai.
end of essay."""

OFF_TOPIC_ESSAY = """My Favorite Recipe for Chocolate Cake

To make a chocolate cake, you need flour, sugar, cocoa powder, eggs, and butter. 
First, preheat the oven to 350 degrees. Mix the dry ingredients in a large bowl. 
Add the eggs and melted butter, and stir until smooth. Pour the batter into a greased pan 
and bake for 30 minutes. Let it cool before frosting with your favorite chocolate icing.
This recipe has been in my family for generations and everyone loves it."""


def upload_essay(name, content, prompt=None):
    """Upload an essay and return the document ID."""
    files = {"file": (f"{name}.txt", content.encode(), "text/plain")}
    data = {}
    if prompt:
        data["prompt"] = prompt

    r = requests.post(f"{BASE_URL}/documents/upload", headers=HEADERS, files=files, data=data)
    if r.status_code in [200, 201]:
        doc_id = r.json().get("_id")
        record(f"Upload '{name}'", "PASS", f"ID: {doc_id}")
        return doc_id
    else:
        record(f"Upload '{name}'", "FAIL", f"Status {r.status_code}: {r.text[:100]}")
        return None


def wait_for_evaluation(doc_id, label, timeout=120):
    """Poll for evaluation results, return them when ready."""
    print(f"  ⏳ Waiting for '{label}' evaluation (up to {timeout}s)...")
    for i in range(timeout):
        time.sleep(1)
        r = requests.get(f"{BASE_URL}/evaluation/results/{doc_id}", headers=HEADERS)
        if r.status_code == 200:
            data = r.json()
            score = data.get("final_score")
            if score is not None:
                return data
        if (i + 1) % 15 == 0:
            # Check document status for progress
            dr = requests.get(f"{BASE_URL}/documents/{doc_id}", headers=HEADERS)
            if dr.status_code == 200:
                status = dr.json().get("status", "unknown")
                print(f"    ... {label} status: {status} ({i+1}s elapsed)")
    return None


def test_evaluation_pipeline():
    print("\n" + "=" * 60)
    print("PHASE 4: EVALUATION PIPELINE (ACCURACY)")
    print("=" * 60)

    prompt = "Discuss the impact of Artificial Intelligence on modern healthcare, including benefits and challenges."

    # Upload all three essays
    good_id = upload_essay("good_essay", GOOD_ESSAY, prompt=prompt)
    bad_id = upload_essay("bad_essay", BAD_ESSAY, prompt=prompt)
    off_topic_id = upload_essay("off_topic_essay", OFF_TOPIC_ESSAY, prompt=prompt)

    if not all([good_id, bad_id, off_topic_id]):
        record("Pipeline Test", "FAIL", "Could not upload all essays")
        return

    # Wait for all evaluations
    good_result = wait_for_evaluation(good_id, "Good Essay")
    bad_result = wait_for_evaluation(bad_id, "Bad Essay")
    off_topic_result = wait_for_evaluation(off_topic_id, "Off-Topic Essay")

    # ── Analyze Good Essay ──
    if good_result:
        gs = good_result["final_score"]
        gc = good_result.get("components", {})
        print(f"\n  📊 Good Essay: {gs}/100 (Grade: {good_result.get('grade')})")
        print(f"     Grammar:    {gc.get('grammar', {}).get('score', 'N/A')}")
        print(f"     Vocabulary: {gc.get('vocabulary', {}).get('score', 'N/A')}")
        print(f"     Coherence:  {gc.get('coherence', {}).get('score', 'N/A')}")
        print(f"     Relevance:  {gc.get('topic_relevance', {}).get('score', 'N/A')}")
        print(f"     Plagiarism: {gc.get('plagiarism', {}).get('percentage', 'N/A')}%")
        print(f"     AI Detect:  {gc.get('ai_detection', {}).get('score', 'N/A')} ({gc.get('ai_detection', {}).get('label', 'N/A')})")

        if gs >= 70:
            record("Good Essay Score ≥ 70", "PASS", f"Score: {gs}")
        elif gs >= 55:
            record("Good Essay Score ≥ 70", "WARN", f"Score: {gs} (lower than expected)")
        else:
            record("Good Essay Score ≥ 70", "FAIL", f"Score: {gs}")

        # Grammar should be high for a well-written essay
        gram_score = gc.get("grammar", {}).get("score")
        if gram_score and gram_score >= 80:
            record("Good Essay Grammar ≥ 80", "PASS", f"Score: {gram_score}")
        elif gram_score:
            record("Good Essay Grammar ≥ 80", "WARN", f"Score: {gram_score}")

        # Check that feedback exists
        fb = good_result.get("overall_feedback")
        if fb and len(fb) > 50:
            record("Good Essay Feedback Generated", "PASS", f"{len(fb)} chars")
        elif fb:
            record("Good Essay Feedback Generated", "WARN", f"Short feedback: {len(fb)} chars")
        else:
            record("Good Essay Feedback Generated", "FAIL", "No feedback")

        # Score breakdown should exist
        sb = good_result.get("score_breakdown")
        if sb and sb.get("weighted_components"):
            record("Score Breakdown Present", "PASS", f"{len(sb['weighted_components'])} components")
        else:
            record("Score Breakdown Present", "FAIL", "Missing")
    else:
        record("Good Essay Evaluation", "FAIL", "Timed out waiting for results")

    # ── Analyze Bad Essay ──
    if bad_result:
        bs = bad_result["final_score"]
        bc = bad_result.get("components", {})
        print(f"\n  📊 Bad Essay: {bs}/100 (Grade: {bad_result.get('grade')})")
        print(f"     Grammar:    {bc.get('grammar', {}).get('score', 'N/A')}")
        print(f"     Vocabulary: {bc.get('vocabulary', {}).get('score', 'N/A')}")
        print(f"     Coherence:  {bc.get('coherence', {}).get('score', 'N/A')}")
        print(f"     Relevance:  {bc.get('topic_relevance', {}).get('score', 'N/A')}")

        if bs < gs:
            record("Bad Essay Score < Good Essay Score", "PASS", f"{bs} < {gs}")
        else:
            record("Bad Essay Score < Good Essay Score", "FAIL", f"{bs} >= {gs}")

        if bs < 65:
            record("Bad Essay Score < 65", "PASS", f"Score: {bs}")
        else:
            record("Bad Essay Score < 65", "WARN", f"Score: {bs} (higher than expected for poor writing)")

        # Grammar should be low (Gemini holistic score, not LanguageTool)
        bg = bc.get("grammar", {}).get("score")
        if bg is not None and bg < 70:
            record("Bad Essay Grammar < 70", "PASS", f"Score: {bg}")
        elif bg is not None:
            record("Bad Essay Grammar < 70", "WARN", f"Score: {bg} (expected lower for spelling errors)")
    else:
        record("Bad Essay Evaluation", "FAIL", "Timed out")

    # ── Analyze Off-Topic Essay ──
    if off_topic_result:
        os_ = off_topic_result["final_score"]
        oc = off_topic_result.get("components", {})
        print(f"\n  📊 Off-Topic Essay: {os_}/100 (Grade: {off_topic_result.get('grade')})")
        print(f"     Relevance:  {oc.get('topic_relevance', {}).get('score', 'N/A')}")

        rel_score = oc.get("topic_relevance", {}).get("score")
        if rel_score is not None and rel_score < 30:
            record("Off-Topic Relevance < 30", "PASS", f"Score: {rel_score}")
        elif rel_score is not None and rel_score < 50:
            record("Off-Topic Relevance < 30", "WARN", f"Score: {rel_score} (should be lower)")
        elif rel_score is not None:
            record("Off-Topic Relevance < 30", "FAIL", f"Score: {rel_score} (cake recipe vs AI healthcare!)")

        # Off-topic floor: score should be capped at 25
        if os_ <= 25:
            record("Off-Topic Score Capped ≤ 25", "PASS", f"Score: {os_}")
        elif os_ <= 35:
            record("Off-Topic Score Capped ≤ 25", "WARN", f"Score: {os_} (should be ≤ 25)")
        else:
            record("Off-Topic Score Capped ≤ 25", "FAIL", f"Score: {os_} (off-topic should cap at 25)")
    else:
        record("Off-Topic Essay Evaluation", "FAIL", "Timed out")

    # ── Cross-essay comparisons ──
    if good_result and bad_result and off_topic_result:
        gs = good_result["final_score"]
        bs = bad_result["final_score"]
        os_ = off_topic_result["final_score"]
        if gs > bs > os_:
            record("Score Ordering (Good > Bad > Off-Topic)", "PASS", f"{gs} > {bs} > {os_}")
        elif gs > bs:
            record("Score Ordering (Good > Bad > Off-Topic)", "WARN", f"{gs} > {bs}, but off-topic={os_}")
        else:
            record("Score Ordering (Good > Bad > Off-Topic)", "FAIL", f"Unexpected: {gs}, {bs}, {os_}")

    # ── Plagiarism self-detection ──
    print("\n  🔍 Testing Plagiarism: Uploading duplicate of Good Essay...")
    dup_id = upload_essay("duplicate_essay", GOOD_ESSAY, prompt=prompt)
    if dup_id:
        dup_result = wait_for_evaluation(dup_id, "Duplicate Essay")
        if dup_result:
            plag_pct = dup_result.get("components", {}).get("plagiarism", {}).get("percentage", 0)
            print(f"     Plagiarism Detected: {plag_pct}%")
            if plag_pct >= 50:
                record("Plagiarism Detection (Duplicate)", "PASS", f"{plag_pct}% similarity")
            elif plag_pct >= 20:
                record("Plagiarism Detection (Duplicate)", "WARN", f"{plag_pct}% (expected higher for exact copy)")
            else:
                record("Plagiarism Detection (Duplicate)", "FAIL", f"Only {plag_pct}% for an exact copy!")
        else:
            record("Plagiarism Detection", "FAIL", "Timed out")

    return good_id  # Return for later delete test


# ═══════════════════════════════════════════════════════════════════
# PHASE 5: ANALYTICS
# ═══════════════════════════════════════════════════════════════════
def test_analytics():
    print("\n" + "=" * 60)
    print("PHASE 5: ANALYTICS")
    print("=" * 60)

    r = requests.get(f"{BASE_URL}/analytics/dashboard-stats", headers=HEADERS)
    if r.status_code == 200:
        stats = r.json()
        record("Dashboard Stats Endpoint", "PASS")

        total = stats.get("total_documents", {}).get("value", 0)
        avg = stats.get("average_score", {}).get("value", 0)
        record(f"  Total Documents: {total}", "PASS" if total > 0 else "WARN", f"Value: {total}")
        record(f"  Average Score: {avg}", "PASS" if avg > 0 else "WARN", f"Value: {avg}")
    else:
        record("Dashboard Stats Endpoint", "FAIL", f"Status {r.status_code}: {r.text[:100]}")

    r = requests.get(f"{BASE_URL}/analytics/grade-distribution", headers=HEADERS)
    if r.status_code == 200:
        dist = r.json()
        record("Grade Distribution Endpoint", "PASS", f"{len(dist)} buckets")
    else:
        record("Grade Distribution Endpoint", "FAIL", f"Status {r.status_code}: {r.text[:100]}")


# ═══════════════════════════════════════════════════════════════════
# PHASE 6: DOCUMENT MANAGEMENT
# ═══════════════════════════════════════════════════════════════════
def test_document_management(doc_id=None):
    print("\n" + "=" * 60)
    print("PHASE 6: DOCUMENT MANAGEMENT")
    print("=" * 60)

    # List
    r = requests.get(f"{BASE_URL}/documents/", headers=HEADERS)
    if r.status_code == 200:
        docs = r.json()
        record("List Documents", "PASS", f"Found {len(docs)} docs")
    else:
        record("List Documents", "FAIL", f"Status {r.status_code}")

    # Get specific doc
    if doc_id:
        r = requests.get(f"{BASE_URL}/documents/{doc_id}", headers=HEADERS)
        if r.status_code == 200:
            doc = r.json()
            has_text = bool(doc.get("extracted_text"))
            record("Get Document Detail", "PASS", f"Has text: {has_text}, Status: {doc.get('status')}")
        else:
            record("Get Document Detail", "FAIL", f"Status {r.status_code}")

    # Test invalid upload
    r = requests.post(
        f"{BASE_URL}/documents/upload",
        headers=HEADERS,
        files={"file": ("test.exe", b"fake content", "application/octet-stream")},
    )
    if r.status_code == 400:
        record("Reject Invalid File Type (.exe)", "PASS", "400 returned")
    else:
        record("Reject Invalid File Type (.exe)", "FAIL", f"Expected 400, got {r.status_code}")


# ═══════════════════════════════════════════════════════════════════
# REPORT
# ═══════════════════════════════════════════════════════════════════
def print_report():
    print("\n" + "=" * 60)
    print("FINAL REPORT")
    print("=" * 60)
    passed = RESULTS["passed"]
    failed = RESULTS["failed"]
    warns = RESULTS["warnings"]
    total = passed + failed + warns

    print(f"\n  Total Tests: {total}")
    print(f"  ✅ Passed:   {passed}")
    print(f"  ❌ Failed:   {failed}")
    print(f"  ⚠️  Warnings: {warns}")
    print(f"\n  Score: {passed}/{total} ({round(passed/total*100) if total else 0}%)")

    if failed > 0:
        print(f"\n  ❌ FAILURES:")
        for t in RESULTS["tests"]:
            if t["status"] == "FAIL":
                print(f"     - {t['name']}: {t['detail']}")

    if warns > 0:
        print(f"\n  ⚠️  WARNINGS:")
        for t in RESULTS["tests"]:
            if t["status"] == "WARN":
                print(f"     - {t['name']}: {t['detail']}")


if __name__ == "__main__":
    print("🚀 EduScore AI — Comprehensive Test Suite")
    print(f"   Time: {datetime.now().isoformat()}")
    print(f"   Target: {BASE_URL}")

    test_health()

    if not test_auth():
        print("\n❌ Auth failed — cannot proceed with remaining tests.")
        print("   Make sure ENABLE_MOCK_AUTH=true on the backend container.")
        print_report()
        sys.exit(1)

    test_rubrics()
    doc_id = test_evaluation_pipeline()
    test_analytics()
    test_document_management(doc_id)
    print_report()

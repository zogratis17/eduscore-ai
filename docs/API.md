# API Endpoints Documentation

## Base URL
```
http://localhost:8000/api/v1
```

---

## 🔐 Authentication Endpoints

### Register/Sync User
```http
POST /auth/register
Authorization: Bearer {firebase_token}

Response: {
  "id": "507f1f77bcf86cd799439011",
  "email": "educator@college.edu",
  "name": "John Doe",
  "role": "educator",
  "created_at": "2024-01-06T10:00:00Z"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer {firebase_token}

Response: {
  "id": "507f1f77bcf86cd799439011",
  "email": "educator@college.edu",
  "name": "John Doe",
  "role": "educator",
  "institution_id": "inst_123",
  "total_evaluations": 45,
  "last_login": "2024-01-06T10:00:00Z"
}
```

### Update Profile
```http
PUT /auth/me
Authorization: Bearer {firebase_token}
Content-Type: application/json

{
  "name": "John Smith",
  "department": "Computer Science",
  "phone": "+91-9876543210"
}
```

---

## 📄 Document Management Endpoints

### Upload Single Document
```http
POST /documents/upload
Authorization: Bearer {firebase_token}
Content-Type: multipart/form-data

Form Data:
  - file: (binary)
  - student_name: "Alice Johnson"
  - roll_number: "CS2021001"
  - assignment_type: "essay"
  - topic: "Impact of AI on Education"
  - prompt: "Discuss how AI is transforming..."

Response: {
  "id": "doc_abc123",
  "filename": "alice_essay.pdf",
  "status": "pending",
  "created_at": "2024-01-06T10:00:00Z"
}
```

### Batch Upload
```http
POST /documents/batch-upload
Authorization: Bearer {firebase_token}
Content-Type: multipart/form-data

Form Data:
  - files: [file1, file2, file3, ...]
  - batch_name: "Midterm Essays 2024"
  - rubric_id: "rubric_xyz"

Response: {
  "batch_id": "batch_789",
  "total_documents": 50,
  "status": "queued",
  "created_at": "2024-01-06T10:00:00Z"
}
```

### Get Document Details
```http
GET /documents/{document_id}
Authorization: Bearer {firebase_token}

Response: {
  "id": "doc_abc123",
  "filename": "alice_essay.pdf",
  "status": "completed",
  "extracted_text": "...",
  "word_count": 1500,
  "page_count": 5,
  "student_info": {
    "name": "Alice Johnson",
    "roll_number": "CS2021001"
  }
}
```

### List User Documents
```http
GET /documents?page=1&limit=20&status=completed&sort=-created_at
Authorization: Bearer {firebase_token}

Response: {
  "total": 100,
  "page": 1,
  "limit": 20,
  "documents": [...]
}
```

### Delete Document
```http
DELETE /documents/{document_id}
Authorization: Bearer {firebase_token}

Response: {
  "message": "Document deleted successfully"
}
```

---

## 🤖 Evaluation Endpoints

### Trigger Evaluation
```http
POST /evaluation/evaluate/{document_id}
Authorization: Bearer {firebase_token}
Content-Type: application/json

{
  "rubric_id": "rubric_xyz",
  "settings": {
    "check_plagiarism": true,
    "check_ai_text": true,
    "check_citations": true
  }
}

Response: {
  "task_id": "task_abc123",
  "status": "queued",
  "estimated_time_sec": 30
}
```

### Get Evaluation Results
```http
GET /evaluation/results/{document_id}
Authorization: Bearer {firebase_token}

Response: {
  "id": "eval_xyz789",
  "document_id": "doc_abc123",
  "final_score": 85.5,
  "grade": "A",
  "scores": {
    "grammar": {
      "score": 88.0,
      "errors_count": 5,
      "suggestions": [...]
    },
    "vocabulary": {
      "score": 82.0,
      "richness_score": 0.75
    },
    "coherence": {
      "score": 87.0
    },
    "topic_relevance": {
      "score": 90.0
    },
    "plagiarism": {
      "similarity_percentage": 5.2,
      "suspicion_level": "low"
    }
  },
  "overall_feedback": "Well-structured essay with clear arguments...",
  "strengths": ["Clear thesis", "Good evidence"],
  "improvements": ["Work on transitions", "Cite more sources"]
}
```

### Download Evaluation Report
```http
GET /evaluation/report/{document_id}?format=pdf
Authorization: Bearer {firebase_token}

Response: (PDF file download)
```

### Batch Evaluation Status
```http
GET /evaluation/batch/{batch_id}/status
Authorization: Bearer {firebase_token}

Response: {
  "batch_id": "batch_789",
  "status": "processing",
  "total_documents": 50,
  "processed_count": 35,
  "succeeded_count": 33,
  "failed_count": 2,
  "progress_percentage": 70
}
```

---

## 📊 Rubrics Management

### Create Rubric
```http
POST /rubrics
Authorization: Bearer {firebase_token}
Content-Type: application/json

{
  "name": "Essay Evaluation Rubric",
  "assignment_type": "essay",
  "criteria": [
    {
      "name": "Introduction",
      "weight": 15,
      "max_score": 100,
      "description": "Quality of introduction and thesis"
    },
    {
      "name": "Body & Arguments",
      "weight": 40,
      "max_score": 100
    },
    {
      "name": "Conclusion",
      "weight": 15,
      "max_score": 100
    },
    {
      "name": "Grammar & Style",
      "weight": 20,
      "max_score": 100
    },
    {
      "name": "Citations",
      "weight": 10,
      "max_score": 100
    }
  ]
}
```

### List Rubrics
```http
GET /rubrics?assignment_type=essay
Authorization: Bearer {firebase_token}

Response: {
  "rubrics": [...]
}
```

### Get Rubric Details
```http
GET /rubrics/{rubric_id}
Authorization: Bearer {firebase_token}
```

### Update Rubric
```http
PUT /rubrics/{rubric_id}
Authorization: Bearer {firebase_token}
```

### Delete Rubric
```http
DELETE /rubrics/{rubric_id}
Authorization: Bearer {firebase_token}
```

---

## 📈 Analytics Endpoints

### Dashboard Statistics
```http
GET /analytics/dashboard
Authorization: Bearer {firebase_token}

Response: {
  "total_evaluations": 500,
  "total_documents": 520,
  "avg_score": 78.5,
  "evaluations_this_month": 120,
  "pending_documents": 15,
  "high_plagiarism_cases": 8,
  "score_distribution": {
    "A": 45,
    "B": 120,
    "C": 80,
    "D": 25,
    "F": 10
  },
  "recent_submissions": [...]
}
```

### Detailed Analytics
```http
GET /analytics/detailed?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer {firebase_token}

Response: {
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "metrics": {
    "total_evaluations": 200,
    "avg_score": 76.8,
    "avg_processing_time_sec": 25,
    "common_issues": [
      {"issue": "Grammar errors", "count": 150},
      {"issue": "Weak conclusions", "count": 80}
    ]
  },
  "trends": {
    "scores_over_time": [...],
    "submissions_per_day": [...]
  }
}
```

### Export Analytics Report
```http
GET /analytics/export?format=csv&start_date=2024-01-01
Authorization: Bearer {firebase_token}

Response: (CSV file download)
```

### Department Analytics (Admin)
```http
GET /analytics/department/{department_name}
Authorization: Bearer {firebase_token}

Response: {
  "department": "Computer Science",
  "total_evaluations": 800,
  "avg_score": 82.3,
  "top_performers": [...],
  "common_weaknesses": [...]
}
```

---

## 🔍 Search & Filter

### Search Documents
```http
GET /documents/search?q=artificial+intelligence&assignment_type=essay
Authorization: Bearer {firebase_token}

Response: {
  "results": [...],
  "total": 25
}
```

### Advanced Filters
```http
GET /documents?
  status=completed&
  assignment_type=essay&
  min_score=70&
  max_score=90&
  date_from=2024-01-01&
  date_to=2024-01-31&
  plagiarism_risk=low
Authorization: Bearer {firebase_token}
```

---

## 🔔 Notifications (Optional)

### Get Notifications
```http
GET /notifications?unread=true
Authorization: Bearer {firebase_token}

Response: {
  "notifications": [
    {
      "id": "notif_123",
      "type": "evaluation_complete",
      "message": "Evaluation completed for document: alice_essay.pdf",
      "read": false,
      "created_at": "2024-01-06T10:30:00Z"
    }
  ]
}
```

### Mark as Read
```http
PUT /notifications/{notification_id}/read
Authorization: Bearer {firebase_token}
```

---

## 🛠️ Admin Endpoints

### Create User Account
```http
POST /admin/users
Authorization: Bearer {firebase_token}
Content-Type: application/json

{
  "email": "newteacher@college.edu",
  "name": "Jane Smith",
  "role": "educator",
  "department": "Physics"
}
```

### List All Users
```http
GET /admin/users?role=educator&institution_id=inst_123
Authorization: Bearer {firebase_token}
```

### System Statistics
```http
GET /admin/stats
Authorization: Bearer {firebase_token}

Response: {
  "total_users": 50,
  "total_documents": 5000,
  "total_evaluations": 4800,
  "storage_used_gb": 12.5,
  "avg_processing_time_sec": 28
}
```

---

## ⚙️ Health & Status

### Health Check
```http
GET /health

Response: {
  "status": "healthy",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "minio": "healthy",
    "languagetool": "healthy"
  }
}
```

### System Status
```http
GET /status
Authorization: Bearer {firebase_token}

Response: {
  "version": "1.0.0",
  "uptime_sec": 86400,
  "workers_active": 4,
  "queue_size": 12
}
```

---

## 📝 Error Responses

All errors follow this format:

```json
{
  "detail": "Error message",
  "error_code": "SPECIFIC_ERROR_CODE",
  "timestamp": "2024-01-06T10:00:00Z"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable
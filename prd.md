Product Requirements Document (PRD)
AI-Powered Academic Document Evaluation Platform
Document Version: 2.0 (Complete)
Last Updated: January 7, 2026
Status: In Development


Executive Summary
Product Vision
Build an AI-powered platform that automates academic document evaluation for educational institutions, reducing faculty workload by 70% while ensuring consistent, unbiased assessment across all submissions.
Problem Statement
Educators spend 10-15 minutes manually evaluating each student submission. With class sizes of 60-100 students and multiple assignments per semester, this creates:

Faculty burnout during peak evaluation periods
Inconsistent scoring across different evaluators
High operational costs ($500-2000/year per institution for plagiarism tools)
Delayed feedback to students (2-3 weeks turnaround)
Poor documentation for accreditation audits (NAAC/NBA)
Solution Overview
A comprehensive platform using free, open-source AI/ML tools to provide:

Automated evaluation in <30 seconds per document
Consistent rubric-based scoring with explainable AI
Integrated plagiarism detection and AI-text identification
Detailed feedback generation for student improvement
Analytics dashboard for institutional insights
Zero recurring costs using only free technologies
Target Market
Primary: Colleges and universities in India (Coimbatore region focus)
Secondary: Higher secondary schools, professional training institutes
Initial Users: 50+ educators across 5+ institutions
Scale Potential: 500+ institutions, 10,000+ educators


Product Strategy
Business Model
Initial Phase: Free platform to gain adoption and feedback
Future Phases:

Freemium (basic free, advanced features paid)
Institution licensing ($50-200/month per institution)
SaaS model with tiered pricing
Success Metrics (12 months post-launch)
Adoption: 50+ active educators, 5+ institutions
Usage: 10,000+ documents evaluated
Efficiency: 70% reduction in evaluation time
Satisfaction: 85%+ user satisfaction score
Accuracy: 80%+ alignment with manual grading
Cost Savings: $10,000+ saved per institution annually
Competitive Advantage
Feature
Our Platform
Turnitin
Grammarly Premium
Traditional Manual
Cost
$0
$3-5/student
$144/year
Faculty time
Plagiarism
✅ Local corpus
✅ Web-wide
❌
❌
AI Detection
✅
✅
❌
❌
Rubric-based
✅ Custom
❌
❌
✅ Manual
Batch Processing
✅ 200 files
Limited
❌
❌
Analytics
✅ Deep insights
Basic
❌
❌
Privacy
✅ On-premise
❌ Cloud
❌ Cloud
✅
Setup Time
1 hour
Days
Minutes
N/A



User Personas
Primary Persona: Professor Rajesh
Role: Associate Professor, Computer Science
Age: 42 | Tech Savvy: Medium | Institution: Engineering College

Goals:

Reduce time spent grading assignments (currently 20 hours/week)
Provide consistent feedback to 80 students
Detect plagiarism effectively
Focus on teaching, not administrative tasks

Pain Points:

Manual grading is exhausting during exam season
Inconsistent scoring when tired
Can't afford expensive plagiarism tools
No time for detailed feedback

How We Help:

Evaluate 80 essays in 2 hours (vs 13 hours manually)
Consistent rubric-based scoring every time
Free plagiarism detection
Auto-generated detailed feedback
Secondary Persona: Dr. Meena (Department Head)
Role: Head of Department, English Literature
Age: 48 | Tech Savvy: Low | Institution: Arts College

Goals:

Monitor quality of assessments across department
Ensure compliance with NAAC standards
Support faculty during peak workload
Data-driven insights for curriculum improvement

Pain Points:

No visibility into evaluation patterns
Difficult to generate audit reports
Faculty complaints about workload
Inconsistent standards across professors

How We Help:

Department-wide analytics dashboard
One-click NAAC/NBA compliance reports
Reduced faculty workload = happier team
Standardized evaluation framework
Tertiary Persona: Admin Kumar (IT Administrator)
Role: System Administrator
Age: 35 | Tech Savvy: High | Institution: Multi-campus university

Goals:

Deploy reliable, low-maintenance systems
Ensure data security and privacy
Minimize operational costs
Easy scalability

Pain Points:

Limited budget for new software
Data privacy concerns with cloud solutions
Complex integrations
High maintenance overhead

How We Help:

One-command Docker deployment
On-premise data storage
Zero licensing costs
Comprehensive documentation


Product Scope
In Scope (100% Complete Product)
Phase 1: MVP (50% - Weeks 1-4)
User Authentication (Firebase)

Email/password login
User profile management
Session management

Single Document Upload

PDF/DOCX support
Drag-and-drop interface
File validation (type, size)
Progress tracking

Document Processing

Text extraction (PDF/DOCX)
Word count, page count
Text cleaning and normalization

Core Evaluation Engine

Grammar analysis (LanguageTool)
Vocabulary assessment
Topic relevance scoring
Coherence analysis
Plagiarism detection (local corpus)

Results Display

Overall score with grade
Component breakdown
Grammar errors with suggestions
Plagiarism report
Basic feedback

Simple Dashboard

Document list
Status tracking
Basic search/filter
Quick statistics

Background Processing

Celery task queue
Async evaluation
Status updates

PDF Report Export

Downloadable evaluation report
Phase 2: Scale & Intelligence (30% - Weeks 5-8)
Batch Processing

Multi-file upload (up to 200)
ZIP file support
Batch progress tracking
Parallel processing

OCR Integration

Scanned document support
Image preprocessing
Quality validation

AI Text Detection

GPT-2 perplexity analysis
Stylometric features
Suspicion scoring

Custom Rubric Builder

Drag-and-drop interface
Template library
Rubric sharing
Version control

Citation Checker

DOI validation (CrossRef API)
Format detection (APA/MLA)
Bibliography validation

RAG-Based Feedback

Context-aware suggestions
Academic knowledge base
Example-based recommendations

Advanced Analytics

Score distribution charts
Trend analysis
Common issues heatmap
Cohort comparisons

Detailed Reporting

Multi-format export (PDF/CSV/Excel)
NAAC/NBA audit reports
Custom report templates

Real-time Updates

WebSocket notifications
Email alerts (optional)
In-app notification center

Document Comparison

Side-by-side view
Difference highlighting
Progress tracking

Enhanced Search

Full-text search
Advanced filters
Saved searches

Student Feedback Portal

Read-only access
Score viewing
Report download
Phase 3: Enterprise & Production (20% - Weeks 9-12)
Multi-Institution Support

Institution management
Branding customization
Data isolation
Usage quotas

Admin Panel

User management
System configuration
Audit logs
Health monitoring

Role-Based Access Control

Permission matrix
Department-scoped access
Resource-level permissions

Performance Optimization

Caching strategy
Query optimization
API compression
Code splitting

Scalability Enhancements

Horizontal scaling
Load balancing
Database sharding

Comprehensive Testing

80%+ code coverage
E2E tests
Load testing
Security testing

Monitoring & Observability

Prometheus metrics
Grafana dashboards
Error tracking
Log aggregation

Production Deployment

CI/CD pipeline
SSL/TLS setup
Backup automation
Disaster recovery

Documentation

User guides
API documentation
Admin manuals
Video tutorials

Security Hardening

Security audit
OWASP compliance
Penetration testing
Vulnerability scanning
Out of Scope (Future Versions)
Mobile apps (iOS/Android)
Video/audio submission evaluation
Live proctoring
LMS integration (Moodle, Canvas)
Multi-language support (beyond English)
Blockchain-based certificate verification
Machine learning model training interface
Automated essay generation detection (advanced)


Detailed Functional Requirements
FR-1: User Authentication & Authorization
FR-1.1: User Registration
Description: Educators can create accounts via Firebase Authentication
Priority: P0 (Critical)
User Story: As an educator, I want to create an account so that I can access the platform

Acceptance Criteria:

User registers with email and password
Email verification sent automatically
User profile created in MongoDB
Default role assigned (educator)
Firebase UID stored for authentication

Technical Specs:

Firebase Authentication SDK
Backend validates Firebase JWT tokens
MongoDB stores user profile
Bcrypt for additional password hashing (if needed)
FR-1.2: User Login
Description: Secure login using Firebase
Priority: P0 (Critical)

Acceptance Criteria:

Email/password authentication
JWT token generation
Session management (30-day expiry)
Remember me functionality
Last login timestamp updated
FR-1.3: Role-Based Access Control
Description: Different permissions for different roles
Priority: P1 (High)

Roles:

Super Admin: Full system access
Admin: Institution management
Department Head: Department-level analytics
Educator: Own documents only


FR-2: Document Upload & Processing
FR-2.1: Single File Upload
Description: Upload one document at a time
Priority: P0 (Critical)
User Story: As an educator, I want to upload a student's essay so that it can be evaluated

Acceptance Criteria:

Supports PDF, DOCX, TXT formats
Maximum file size: 25MB
Drag-and-drop interface
Upload progress indicator
File validation (type, size, virus scan)
Auto-extracted metadata (filename, size, type)

Technical Specs:

Backend: FastAPI multipart/form-data
Storage: GridFS (MongoDB) or MinIO
Validation: python-magic for MIME type
Virus scan: ClamAV (optional)
FR-2.2: Batch Upload
Description: Upload multiple files simultaneously
Priority: P1 (High)
User Story: As an educator, I want to upload all midterm essays at once to save time

Acceptance Criteria:

Upload up to 200 files
Support ZIP file extraction
Batch job creation
Individual file status tracking
Overall batch progress
Pause/resume capability
Error handling per file

Technical Specs:

Celery chord for parallel processing
Redis for batch state management
Streaming ZIP extraction
Chunked uploads
FR-2.3: Document Parsing
Description: Extract text from uploaded documents
Priority: P0 (Critical)

Acceptance Criteria:

PDF text extraction (PyMuPDF)
DOCX text extraction (python-docx)
OCR for scanned PDFs (Tesseract)
Text cleaning and normalization
Word count calculation
Page count detection
Paragraph segmentation

Error Handling:

Corrupted file detection
Unsupported format warning
OCR failure notification
Partial extraction recovery


FR-3: Evaluation Engine
FR-3.1: Grammar Analysis
Description: Detect and score grammar errors
Priority: P0 (Critical)
User Story: As an educator, I want to see grammar errors so I can help students improve

Acceptance Criteria:

Integration with LanguageTool server
Error categorization (spelling, grammar, style)
Suggestion generation
Error count
Grammar score (0-100)
Confidence level per error

Scoring Algorithm:

grammar_score = 100 - (error_count / word_count * 1000) * 2

Capped between 0 and 100
FR-3.2: Vocabulary Assessment
Description: Evaluate vocabulary richness
Priority: P0 (Critical)

Acceptance Criteria:

Lexical diversity (unique words / total words)
Average word length
Rare word usage
Academic vocabulary percentage
Vocabulary score (0-100)

Technical Specs:

spaCy for POS tagging
Academic word list comparison
Statistical analysis
FR-3.3: Topic Relevance
Description: Measure alignment with assignment prompt
Priority: P0 (Critical)
User Story: As an educator, I want to know if the student stayed on topic

Acceptance Criteria:

Cosine similarity with prompt
Key concept coverage
Topic drift detection
Relevance score (0-100)
Explanation of score

Technical Specs:

sentence-transformers (all-MiniLM-L6-v2)
FAISS for similarity search
Embedding caching
FR-3.4: Coherence & Structure
Description: Assess logical flow and organization
Priority: P0 (Critical)

Acceptance Criteria:

Paragraph count and balance
Sentence transition analysis
Introduction/body/conclusion detection
Logical progression scoring
Coherence score (0-100)

Metrics:

Sentences per paragraph (variance)
Transition word usage
Paragraph length consistency
Topic sentence detection
FR-3.5: Plagiarism Detection
Description: Identify copied content
Priority: P0 (Critical)
User Story: As an educator, I want to detect plagiarism to ensure academic integrity

Acceptance Criteria:

MinHash LSH similarity
Comparison against local corpus
Segment-level matching
Similarity percentage (0-100%)
Source document identification
Highlighted matched segments
Suspicion level (low/medium/high)

Technical Specs:

datasketch library
3-gram hashing
128-bit MinHash signatures
Jaccard similarity threshold: 70%

False Positive Mitigation:

Common phrase filtering
Citation exclusion
Proper noun exclusion
FR-3.6: AI Text Detection
Description: Identify AI-generated content
Priority: P1 (High)
User Story: As an educator, I want to know if content was written by ChatGPT

Acceptance Criteria:

GPT-2 perplexity calculation
Stylometric analysis
Burstiness detection
AI suspicion score (0-100)
Confidence level
Explanation provided

Technical Specs:

transformers library (GPT-2 small)
Perplexity threshold: < 50 (suspicious)
Additional features:
Sentence length variance
Vocabulary diversity
Syntactic complexity

Limitations:

Not 100% accurate
Disclaimer: "Indicator only, not definitive proof"
FR-3.7: Citation Quality
Description: Validate references and citations
Priority: P1 (High)

Acceptance Criteria:

Citation extraction (APA, MLA, Chicago)
DOI validation (CrossRef API)
URL accessibility check
In-text vs bibliography matching
Missing citation detection
Citation quality score (0-100)

Technical Specs:

Regex patterns for formats
CrossRef REST API
HTTP HEAD requests for URLs
NLP matching for in-text citations


FR-4: Results & Feedback
FR-4.1: Results Display
Description: Present evaluation results clearly
Priority: P0 (Critical)
User Story: As an educator, I want to see comprehensive results so I can grade fairly

Acceptance Criteria:

Overall score (0-100) with letter grade
Component score breakdown
Visual charts (pie, bar, radar)
Grammar errors list with suggestions
Plagiarism report with sources
AI detection results
Coherence analysis
Detailed feedback text

UI Components:

Score cards with icons
Interactive charts (Recharts)
Expandable sections
Highlight overlays on text
Print-friendly layout
FR-4.2: Feedback Generation
Description: Auto-generate constructive feedback
Priority: P1 (High)

Acceptance Criteria:

Overall feedback paragraph
3-5 strengths identified
3-5 improvement areas
Specific, actionable suggestions
Tone: constructive and encouraging

Generation Methods:

Template-based (MVP)
RAG-enhanced (Phase 2)
LLM-generated (Future)
FR-4.3: Report Export
Description: Download evaluation reports
Priority: P0 (Critical)
User Story: As an educator, I want to download reports for my records

Formats:

PDF (detailed report)
CSV (raw scores)
Excel (batch analysis)

PDF Report Includes:

Student information
All scores and grades
Grammar errors
Plagiarism details
Feedback
Charts/graphs
Timestamp and evaluator


FR-5: Dashboard & Analytics
FR-5.1: Educator Dashboard
Description: Overview of documents and activity
Priority: P0 (Critical)

Widgets:

Total documents evaluated
Average score
Pending evaluations
Recent submissions (table)
Score distribution chart
Quick actions (upload, view reports)
FR-5.2: Advanced Analytics
Description: Deep insights into evaluation patterns
Priority: P1 (High)
User Story: As a department head, I want to see trends to improve curriculum

Charts & Metrics:

Score distribution histogram
Trend lines (scores over time)
Common issues heatmap
Plagiarism rate trends
AI detection insights
Cohort comparisons
Assignment type breakdown

Filters:

Date range
Assignment type
Student/class
Score range
Custom tags
FR-5.3: Reports Dashboard
Description: Generate and export reports
Priority: P1 (High)

Report Types:

Individual student progress
Class/cohort summary
Department overview
NAAC/NBA audit report
Comparative analysis


FR-6: Administration
FR-6.1: User Management
Description: Manage user accounts
Priority: P2 (Medium)
Actor: Admin

Capabilities:

Create/edit/delete users
Assign roles
Deactivate accounts
Bulk import (CSV)
Password reset
Activity logs
FR-6.2: Institution Management
Description: Configure institution settings
Priority: P2 (Medium)

Features:

Add/edit institutions
Branding (logo, colors)
Configure limits (storage, users)
Enable/disable features
Usage monitoring
FR-6.3: System Configuration
Description: Platform-wide settings
Priority: P2 (Medium)

Settings:

Default rubric
Evaluation thresholds
Plagiarism sensitivity
File size limits
Email templates
Maintenance mode


Non-Functional Requirements
NFR-1: Performance
Metric
Target
Measurement
Document upload
< 5 seconds
95th percentile
Evaluation time
< 30 seconds
Average
Dashboard load
< 2 seconds
95th percentile
API response
< 200ms
95th percentile
Batch processing
200 docs in < 2 hours
Average
Concurrent users
100+
Load test

NFR-2: Scalability
Targets:

Users: Support 500+ concurrent educators
Documents: Process 10,000+ documents/day
Storage: Scale to 1TB+ document storage
Institutions: Support 100+ institutions

Strategy:

Horizontal scaling of workers
Database sharding
CDN for static assets
Load balancing
NFR-3: Reliability
Metric
Target
Uptime
99.9%
Data durability
99.999%
Backup frequency
Daily
Recovery time
< 4 hours
Mean time between failures
> 30 days

NFR-4: Security
Requirements:

HTTPS enforcement (TLS 1.3)
Data encryption at rest (AES-256)
Secure authentication (Firebase + JWT)
Input validation and sanitization
SQL/NoSQL injection prevention
XSS protection
CSRF protection
Rate limiting (100 req/min per user)
Virus scanning on uploads
Regular security audits
OWASP Top 10 compliance
NFR-5: Usability
Targets:

User onboarding: < 10 minutes
Task completion rate: > 90%
System Usability Scale (SUS): > 80
Mobile responsive (tablets, phones)
Accessibility: WCAG 2.1 AA compliance
Multi-browser support (Chrome, Firefox, Safari, Edge)
NFR-6: Maintainability
Requirements:

Modular architecture
Comprehensive documentation
Code coverage: > 80%
Automated testing
CI/CD pipeline
Version control (Git)
Logging and monitoring
Error tracking
Self-healing capabilities
NFR-7: Data Privacy
Compliance:

Data stored on-premise (optional)
GDPR-inspired principles (even if not in EU)
Student data anonymization
Right to delete
Data access logs
Export capability
Minimal data collection
Clear privacy policy


Technical Architecture
System Architecture
┌─────────────────────────────────────────────────────────┐

│                    PRESENTATION LAYER                    │

│   React + Vite + TailwindCSS + Firebase Auth (Client)  │

└────────────────────┬────────────────────────────────────┘

                     │ HTTPS/REST API

┌────────────────────▼────────────────────────────────────┐

│                   APPLICATION LAYER                      │

│              FastAPI + Uvicorn (Backend)                │

│  ┌──────────────────────────────────────────────────┐  │

│  │  API Gateway │ Auth Middleware │ Rate Limiter    │  │

│  └──────────────────────────────────────────────────┘  │

└────────┬─────────────────────────┬────────────────────┘

         │                         │

┌────────▼─────────┐    ┌──────────▼──────────────────────┐

│  BUSINESS LOGIC  │    │   BACKGROUND WORKERS            │

│  - Document Mgmt │    │   Celery + Redis Queue          │

│  - Evaluation    │    │   - Document processing         │

│  - Analytics     │    │   - Evaluation tasks            │

│  - Reporting     │    │   - Batch processing            │

└────────┬─────────┘    └─────────────────────────────────┘

         │

┌────────▼───────────────────────────────────────────────┐

│                   DATA LAYER                            │

│  ┌──────────┐  ┌────────┐  ┌────────┐  ┌───────────┐ │

│  │ MongoDB  │  │ Redis  │  │ MinIO  │  │  FAISS    │ │

│  │ Primary  │  │ Cache  │  │ Files  │  │  Vectors  │ │

│  │   DB     │  │ Queue  │  │ S3     │  │  Search   │ │

│  └──────────┘  └────────┘  └────────┘  └───────────┘ │

└─────────────────────────────────────────────────────────┘

         │

┌────────▼───────────────────────────────────────────────┐

│                   AI/ML LAYER                           │

│  - LanguageTool (Grammar)                              │

│  - Sentence-Transformers (Embeddings)                  │

│  - Tesseract (OCR)                                     │

│  - GPT-2 (AI Detection)                                │

│  - DataSketch (Plagiarism)                             │

└─────────────────────────────────────────────────────────┘
Technology Stack
Frontend
Framework: React 18 with Vite
Styling: TailwindCSS + Headless UI
State: Zustand / Redux Toolkit
Data Fetching: React Query (TanStack Query)
Forms: React Hook Form + Zod
Charts: Recharts
Auth: Firebase SDK
Backend
Framework: FastAPI (Python 3.11+)
Server: Uvicorn (ASGI)
Authentication: Firebase Admin SDK
Database ORM: Motor (async MongoDB)
Task Queue: Celery + Redis
Validation: Pydantic v2
Database & Storage
Primary DB: MongoDB 7.0
Cache: Redis 7
File Storage: GridFS / MinIO
Vector DB: FAISS
AI/ML Stack
NLP: spaCy, NLTK
Grammar: LanguageTool (self-hosted)
Embeddings: sentence-transformers
OCR: Tesseract 5.0
Plagiarism: datasketch (MinHash)
AI Detection: transformers (GPT-2)
Document Parsing: PyMuPDF, python-docx
DevOps
Containerization: Docker + Docker Compose
Reverse Proxy: Nginx
SSL: Let's Encrypt + Certbot
Monitoring: Prometheus + Grafana
CI/CD: GitHub Actions
Version Control: Git + GitHub
External Services (Free Tier)
Authentication: Firebase (50k MAU free)
Citations: CrossRef API (free)
Email: SendGrid (100/day free)


Data Model
Core Collections
1. users
{

  _id: ObjectId,

  firebase_uid: String (indexed, unique),

  email: String (indexed, unique),

  name: String,

  role: String, // educator, admin, super_admin

  institution_id: String,

  department: String,

  profile_picture: String,

  created_at: DateTime,

  last_login: DateTime,

  total_evaluations: Number,

  is_active: Boolean

}
2. documents
{

  _id: ObjectId,

  uploaded_by: String (indexed), // user_id

  institution_id: String (indexed),

  filename: String,

  file_type: String, // pdf, docx, txt

  storage_path: String, // GridFS ID or MinIO path

  extracted_text: String,

  word_count: Number,

  page_count: Number,

  student_info: {

    name: String,

    roll_number: String,

    class: String,

    subject: String

  },

  assignment_type: String,

  topic: String,

  prompt: String,

  status: String (indexed), // pending, processing, completed, failed

  batch_id: String (indexed),

  created_at: DateTime (indexed),

  processing_time_sec: Number

}
3. evaluations
{

  _id: ObjectId,

  document_id: String (indexed, unique),

  user_id: String (indexed),

  final_score: Number,

  grade: String,

  scores: {

    grammar: { score: Number, errors: Array },

    vocabulary: { score: Number, metrics: Object },

    coherence: { score: Number, analysis: Object },

    topic_relevance: { score: Number, similarity: Number },

    plagiarism: { percentage: Number, sources: Array },

    ai_detection: { score: Number, perplexity: Number }

  },

  rubric_scores: Array,

  overall_feedback: String,

  strengths: Array,

  improvements: Array,

  created_at: DateTime (indexed)

}
4. rubrics
{

  _id: ObjectId,

  created_by: String,

  name: String,

  assignment_type: String,

  criteria: [{

    name: String,

    weight: Number,

    description: String,

    scoring_guidelines: Object

  }],

  is_default: Boolean,

  usage_count: Number,

  created_at: DateTime

}
5. batch_jobs
{

  _id: ObjectId,

  created_by: String (indexed),

  total_documents: Number,

  processed_count: Number,

  status: String (indexed),

  created_at: DateTime (indexed),

  completed_at: DateTime,

  summary_stats: Object

}


API Endpoints (Summary)
Authentication
POST /api/v1/auth/register - Register user
GET /api/v1/auth/me - Get current user
PUT /api/v1/auth/me - Update profile
Documents
POST /api/v1/documents/upload - Upload single document
POST /api/v1/documents/batch-upload - Batch upload
GET /api/v1/documents - List documents
GET /api/v1/documents/{id} - Get document details
DELETE /api/v1/documents/{id} - Delete document
Evaluation
POST /api/v1/evaluation/evaluate/{document_id} - Trigger evaluation
GET /api/v1/evaluation/results/{document_id} - Get results
GET /api/v1/evaluation/report/{document_id} - Download report
Analytics
GET /api/v1/analytics/dashboard - Dashboard stats
GET /api/v1/analytics/detailed - Detailed analytics
GET /api/v1/analytics/export - Export reports
Admin
POST /api/v1/admin/users - Create user
GET /api/v1/admin/users - List users
GET /api/v1/admin/stats - System statistics


Development Roadmap
Phase 1: MVP (Weeks 1-4) - 50%
Goal: Working end-to-end evaluation flow

Week 1: Foundation (auth, upload, infrastructure)
Week 2: Processing (parsing, evaluation engine)
Week 3: Background tasks (Celery, results display)
Week 4: Dashboard (UI polish, testing, documentation)

Deliverable: Educators can upload, evaluate,

update industry_prd_v2_complete **Deliverable:** Educators can upload, evaluate, **Deliverable:** Educators can upload, evaluate, and download reports
Phase 2: Scale & Intelligence (Weeks 5-8) - 30%
Goal: Advanced features and insights

Week 5: Batch processing, OCR, AI text detection
Week 6: Custom rubrics, citation checker, RAG feedback
Week 7: Advanced analytics, reporting system
Week 8: Real-time updates, document comparison, enhanced UX

Deliverable: Production-ready platform with advanced capabilities
Phase 3: Enterprise & Production (Weeks 9-12) - 20%
Goal: Enterprise-grade reliability and scale

Week 9: Multi-institution support, admin panel, RBAC
Week 10: Performance optimization, scalability
Week 11: Comprehensive testing, monitoring
Week 12: Production deployment, documentation, security hardening

Deliverable: Enterprise-ready platform for multiple institutions


Risk Assessment & Mitigation
Technical Risks
Risk
Probability
Impact
Mitigation Strategy
AI model accuracy insufficient
Medium
High
Benchmark against manual grading; iterate on algorithms; combine multiple signals for better accuracy
OCR quality poor for scanned docs
High
Medium
Image preprocessing (deskew, denoise); quality warnings to users; manual review option
Plagiarism false positives
Medium
High
Threshold tuning; common phrase filtering; educator override capability
Performance degradation at scale
Medium
High
Load testing early; horizontal scaling; caching strategy; query optimization
Data loss or corruption
Low
Critical
Automated daily backups; MongoDB replica sets; disaster recovery plan with RTO < 4 hours
Firebase service disruption
Low
High
Fallback authentication mechanism; service status monitoring; communication plan
Model size and memory issues
Medium
Medium
Model quantization; lazy loading; GPU utilization (optional); efficient batching

Business Risks
Risk
Probability
Impact
Mitigation Strategy
Low user adoption
Medium
High
User research before build; beta testing with real educators; comprehensive training materials; change management strategy
Resistance from faculty
High
Medium
Demonstrate time savings with pilot; address concerns transparently; feedback loops; gradual rollout
Competition from paid tools
Medium
Medium
Emphasize zero cost; on-premise privacy advantages; customization flexibility; community support
Regulatory compliance issues
Low
High
Legal review before launch; privacy-by-design approach; NAAC/NBA alignment; data protection measures
Budget constraints for infrastructure
Medium
Medium
Leverage free tiers (Oracle Cloud, MongoDB Atlas); optimize resource usage; scalable architecture

Operational Risks
Risk
Probability
Impact
Mitigation Strategy
Insufficient server resources
Medium
Medium
Cloud scaling options; resource monitoring with alerts; capacity planning; performance optimization
Key person dependency
High
High
Comprehensive documentation; knowledge sharing sessions; code reviews; team cross-training
Security breach or data leak
Low
Critical
Regular security audits; penetration testing; incident response plan; security training; bug bounty program
Maintenance overhead
Medium
Medium
Automated deployment; self-healing systems; monitoring and alerting; clear documentation
Support ticket overload
Medium
Low
Comprehensive FAQ; video tutorials; community forum; ticketing system; chatbot (future)



Success Criteria
Launch Criteria (Go/No-Go Decision)
Before launching to production, the platform must meet ALL of the following:

Functional Completeness:

All P0 (critical) features implemented and tested
All P1 (high priority) features implemented or roadmap defined
Core user flows working end-to-end
Error handling and edge cases covered

Quality Assurance:

80%+ code coverage with passing tests
All critical and high severity bugs resolved
Performance benchmarks met (evaluation < 30s)
Load testing completed (100 concurrent users)
Cross-browser testing passed

Security & Compliance:

Security audit completed with no critical issues
OWASP Top 10 vulnerabilities addressed
Data privacy measures in place
Legal review completed (if applicable)

User Validation:

Beta testing with 5+ educators completed
User feedback incorporated
SUS score > 75 from beta testers
Critical user pain points addressed

Documentation & Support:

User documentation complete (getting started, how-to guides)
Admin documentation complete
API documentation published
Video tutorials created
Support email/system ready

Infrastructure & Operations:

Deployment runbook validated
Backup and recovery tested
Monitoring and alerts configured
Incident response plan documented
Rollback plan prepared
Success Metrics (3 Months Post-Launch)
Adoption Metrics:

50+ active educators (monthly active users)
5+ institutions actively using platform
5,000+ documents evaluated
70%+ weekly active user rate
40%+ month-over-month growth in users

Performance Metrics:

99.5%+ system uptime
<30 second average evaluation time
<5 second average upload time
80%+ alignment with manual grading (validation study)
<5% false positive rate in plagiarism detection

User Satisfaction:

85%+ user satisfaction score (NPS or CSAT)
70%+ reported reduction in evaluation time
90%+ task completion rate
<5% user-reported error rate
75%+ of users would recommend to colleagues

Business Impact:

$50,000+ saved across institutions (tool consolidation)
2,000+ hours saved for educators
100% cost efficiency compared to paid alternatives
3+ testimonials or case studies
1+ institution willing to provide reference

Technical Health:

<2% API error rate
<200ms average API response time (p95)
80%+ test coverage maintained
Zero critical security vulnerabilities
<1 hour mean time to recovery (MTTR)


Key Assumptions
Technical Assumptions
Infrastructure: Institutions have on-premise servers OR can use cloud free tiers (Oracle Cloud, MongoDB Atlas)
Network: Stable internet connectivity (minimum 10 Mbps) for cloud services and Firebase
Hardware: Server with minimum 16GB RAM, 4 CPU cores for AI model inference
Storage: 100GB+ available storage for document repository
Browser: Users have modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
Data Assumptions
Historical Data: Sufficient past submissions available for plagiarism corpus building (100+ documents minimum)
Document Quality: Majority of submissions are digital (not handwritten)
Language: All documents in English (primary focus)
Format: Standard academic formats (essays, reports, research papers)
User Assumptions
Digital Literacy: Educators have basic computer skills (file upload, form filling)
Training: Users willing to spend 30-60 minutes on onboarding
Feedback: Users willing to provide constructive feedback during beta
Trust: Educators open to AI-assisted evaluation (not replacing human judgment)
Business Assumptions
Free Services: Firebase, MongoDB Atlas, and other free services remain available
Compliance: Platform meets basic educational institution requirements
Accuracy Acceptable: 80% alignment with manual grading is acceptable for adoption
Scale: Initial load will be <500 concurrent users, growing gradually
Support: Community-driven support model is acceptable initially
External Assumptions
No Legal Barriers: No regulatory issues preventing deployment in target institutions
API Availability: External APIs (CrossRef, LanguageTool) remain accessible
Model Performance: Open-source AI models provide sufficient accuracy
Competition: No sudden emergence of free competing platforms


Dependencies
External Dependencies
Critical (Must Have):

Firebase Authentication: User authentication and management (mitigation: implement custom JWT auth)
MongoDB: Primary database (mitigation: PostgreSQL alternative)
CrossRef API: DOI validation for citations (mitigation: skip validation or use local database)

Important (Should Have):

SendGrid: Email notifications (mitigation: use free SMTP or skip emails initially)
Let's Encrypt: SSL certificates (mitigation: use self-signed certificates)
GitHub: Version control and CI/CD (mitigation: GitLab or Bitbucket)

Nice to Have:

CloudFlare: CDN for static assets (mitigation: serve directly from server)
Sentry: Error tracking (mitigation: use custom logging)
Internal Dependencies
Team Dependencies:

Educator availability for beta testing (5+ educators, 2 weeks commitment)
IT admin support for server deployment and configuration
Legal team review for data privacy and compliance
Content team for documentation and training materials
Marketing/communications for user onboarding campaign

Resource Dependencies:

Time: 12 weeks full-time development (2 developers minimum)
Computing: Development machines with 16GB RAM for local testing
Server: Staging and production environments
Budget: $0-500 for optional cloud services, domain name, etc.
Technical Dependencies
Infrastructure:

Python 3.11+ runtime environment
Node.js 18+ for frontend build tools
Docker 20.10+ for containerization
16GB+ RAM server for AI model inference
100GB+ storage for documents and databases
PostgreSQL 14+ (if not using MongoDB)

Libraries & Frameworks:

All open-source dependencies listed in requirements.txt and package.json
Compatible versions of conflicting dependencies resolved
Security patches available for all dependencies


Open Questions
Technical Questions
Collaborative Evaluation: Should we support multiple educators evaluating the same document with consensus scoring?
Accuracy vs Speed: What's the optimal balance? Should we offer "quick scan" vs "deep analysis" modes?
Real-time Collaboration: Should we implement collaborative rubric editing or document annotation?
Versioning: How to handle resubmissions and version tracking for student documents?
GPU Acceleration: Is GPU support worth the infrastructure complexity for 2-3x speed improvement?
Offline Mode: Should we build offline capability for evaluation without internet connectivity?
Model Updates: How frequently should we update AI models? How to ensure backward compatibility?
Business Questions
Pricing Model: What pricing model for commercial launch? Per-user, per-institution, or feature-based?
White Label: Should we offer white-label option for institutions to brand as their own?
Certification: Should we create a certification/training program for educators?
Partnerships: Should we pursue partnerships with educational boards or accreditation bodies?
Open Source: Should the platform be fully open-source, partially open-source, or proprietary?
Revenue Sharing: If institutions customize and resell, should we have revenue sharing?
Support Model: Paid support tiers or community-driven only?
User Experience Questions
Student Access: Should students have direct access (view-only) or only through educators?
Mobile App: Is mobile app needed or is responsive web sufficient?
Integration: Should we prioritize LMS integration (Moodle, Canvas) or standalone is fine?
Multi-language: What's the priority for non-English language support?
Accessibility: What level of accessibility compliance is required (WCAG AA vs AAA)?
Gamification: Should we add gamification elements for student engagement?
Social Features: Should educators be able to share rubrics, templates in a marketplace?
Product Questions
Feature Prioritization: If we must cut features due to time/budget, what's the priority order?
AI Transparency: How much should we explain AI decisions? Full explainability vs black box?
Human Override: Should educators be able to override AI scores? How granular?
Quality Assurance: How to continuously validate and improve AI model accuracy?


Appendices
Appendix A: Glossary
Academic Terms:

NAAC: National Assessment and Accreditation Council (India) - accredits higher education institutions
NBA: National Board of Accreditation (India) - accredits professional and technical programs
Rubric: Structured scoring guide with criteria and performance levels
Formative Assessment: Ongoing assessment for learning improvement
Summative Assessment: End-of-term evaluation for grading

Technical Terms:

RAG: Retrieval-Augmented Generation - combines retrieval and generation for better AI responses
FAISS: Facebook AI Similarity Search - efficient vector similarity search library
OCR: Optical Character Recognition - converts images to text
LLM: Large Language Model - AI models trained on vast text data
MinHash: Locality-sensitive hashing algorithm for similarity detection
Perplexity: Measure of how well a probability model predicts a sample (lower = more confident)
Embedding: Dense vector representation of text for semantic similarity
Cosine Similarity: Measure of similarity between two non-zero vectors
JWT: JSON Web Token - standard for secure token-based authentication
ASGI: Asynchronous Server Gateway Interface - Python async web server standard

Business Terms:

NPS: Net Promoter Score - customer loyalty metric
CSAT: Customer Satisfaction Score
SUS: System Usability Scale - standardized usability questionnaire
MAU: Monthly Active Users
TCO: Total Cost of Ownership
ROI: Return on Investment
Appendix B: Evaluation Algorithm Details
Overall Score Calculation:

# Component weights (customizable in rubrics)

WEIGHTS = {

    'grammar': 0.20,

    'vocabulary': 0.15,

    'topic_relevance': 0.25,

    'coherence': 0.20,

    'plagiarism_penalty': 0.20

}

# Calculate overall score

overall_score = (

    grammar_score * WEIGHTS['grammar'] +

    vocabulary_score * WEIGHTS['vocabulary'] +

    topic_relevance_score * WEIGHTS['topic_relevance'] +

    coherence_score * WEIGHTS['coherence'] +

    (100 - plagiarism_percentage) * WEIGHTS['plagiarism_penalty']

)

# Apply AI text detection penalty if suspicion is high

if ai_suspicion_score > 70:

    overall_score *= 0.8  # 20% penalty

    add_flag("High AI text suspicion - manual review recommended")

# Apply plagiarism severe penalty

if plagiarism_percentage > 30:

    overall_score *= 0.5  # 50% penalty

    add_flag("High plagiarism detected - manual review required")

# Ensure score is within bounds

overall_score = max(0, min(100, overall_score))

# Assign letter grade

grade = assign_grade(overall_score)

Grading Scale:

def assign_grade(score):

    if score >= 90: return "A+"

    elif score >= 85: return "A"

    elif score >= 80: return "A-"

    elif score >= 75: return "B+"

    elif score >= 70: return "B"

    elif score >= 65: return "B-"

    elif score >= 60: return "C+"

    elif score >= 55: return "C"

    elif score >= 50: return "C-"

    else: return "F"

Grammar Score Algorithm:

def calculate_grammar_score(errors, word_count):

    if word_count == 0:

        return 0

    

    # Weight errors by severity

    weighted_errors = sum([

        error['weight'] for error in errors

        # Weights: spelling=1, grammar=2, style=0.5

    ])

    

    # Calculate error rate per 1000 words

    error_rate = (weighted_errors / word_count) * 1000

    

    # Convert to score (0-100)

    score = 100 - (error_rate * 2)

    

    # Cap at 0 and 100

    return max(0, min(100, score))

Vocabulary Richness Score:

def calculate_vocabulary_score(text):

    tokens = tokenize(text)

    unique_tokens = set(tokens)

    

    # Lexical diversity (Type-Token Ratio)

    lexical_diversity = len(unique_tokens) / len(tokens)

    

    # Average word length

    avg_word_length = sum(len(word) for word in tokens) / len(tokens)

    

    # Academic vocabulary percentage

    academic_words = [w for w in tokens if w in ACADEMIC_WORD_LIST]

    academic_percentage = len(academic_words) / len(tokens)

    

    # Combined score

    score = (

        lexical_diversity * 40 +

        min(avg_word_length / 6, 1) * 30 +

        academic_percentage * 30

    ) * 100

    

    return min(100, score)

Plagiarism Detection Algorithm:

def detect_plagiarism(document_text, corpus):

    # Generate MinHash signature

    minhash = MinHash(num_perm=128)

    for trigram in generate_trigrams(document_text):

        minhash.update(trigram.encode('utf8'))

    

    # Compare against corpus using LSH

    lsh = MinHashLSH(threshold=0.7, num_perm=128)

    for doc_id, doc_hash in corpus.items():

        lsh.insert(doc_id, doc_hash)

    

    # Find similar documents

    similar_docs = lsh.query(minhash)

    

    # Calculate detailed similarity for each match

    matches = []

    for doc_id in similar_docs:

        similarity = calculate_jaccard_similarity(

            minhash, 

            corpus[doc_id]

        )

        if similarity > 0.7:

            matched_segments = find_matching_segments(

                document_text,

                get_document(doc_id)

            )

            matches.append({

                'doc_id': doc_id,

                'similarity': similarity,

                'segments': matched_segments

            })

    

    # Calculate overall plagiarism percentage

    total_matched_words = sum(

        len(m['segments']) for m in matches

    )

    plagiarism_percentage = (

        total_matched_words / len(document_text.split())

    ) * 100

    

    return {

        'percentage': plagiarism_percentage,

        'suspicion_level': get_suspicion_level(plagiarism_percentage),

        'matches': matches

    }
Appendix C: Sample Test Cases
Test Case 1: High-Quality Essay

Expected Score: 85-95
Characteristics: Clear structure, strong vocabulary, minimal errors, original content
Test File: test_documents/excellent_essay.pdf

Test Case 2: Grammar-Heavy Errors

Expected Score: 50-60
Characteristics: Good ideas but many spelling/grammar errors
Test File: test_documents/grammar_errors.docx

Test Case 3: Off-Topic Submission

Expected Score: 40-50
Characteristics: Well-written but doesn't address the prompt
Test File: test_documents/off_topic.pdf

Test Case 4: Plagiarized Content

Expected: High plagiarism flag (>30%)
Characteristics: Significant copied content from sources
Test File: test_documents/plagiarized.pdf

Test Case 5: AI-Generated Essay

Expected: AI suspicion flag (score >70)
Characteristics: ChatGPT-generated content
Test File: test_documents/ai_generated.docx

Test Case 6: Scanned Handwritten Document

Expected: OCR extraction with reasonable accuracy
Characteristics: Handwritten essay scanned as PDF
Test File: test_documents/handwritten_scan.pdf

Test Case 7: Batch Processing (200 documents)

Expected: All processed within 2 hours
Characteristics: Mixed quality documents
Test File: test_documents/batch_200.zip

Test Case 8: Edge Cases

Very short document (<100 words)
Very long document (>10,000 words)
Non-standard formatting
Multiple languages mixed
Special characters and symbols
Appendix D: Competitive Analysis (Detailed)
Turnitin:

Strengths: Web-wide plagiarism database, established brand, LMS integration
Weaknesses: Expensive ($3-5/student), cloud-only, limited customization
Market Position: Industry leader in plagiarism detection
Our Advantage: Zero cost, on-premise option, custom rubrics

Grammarly Premium:

Strengths: Excellent grammar checking, user-friendly, real-time feedback
Weaknesses: No plagiarism, no rubric evaluation, $144/year per user
Market Position: Leading grammar tool for individuals
Our Advantage: Free, comprehensive evaluation, educator-focused

Quetext:

Strengths: Affordable plagiarism checking, good UI
Weaknesses: Limited features, no grammar checking, no rubrics
Market Position: Budget alternative to Turnitin
Our Advantage: More comprehensive, free, better analytics

Copyleaks:

Strengths: AI content detection, multi-language support
Weaknesses: Expensive for institutions, cloud-only
Market Position: Growing player with AI focus
Our Advantage: Free, customizable, on-premise option

Manual Evaluation:

Strengths: Human judgment, contextual understanding, flexible
Weaknesses: Time-consuming, inconsistent, expensive (faculty time)
Market Position: Traditional approach, still dominant
Our Advantage: 70% time savings, consistent, augments human judgment

Market Opportunity:

Total addressable market: 40,000+ colleges in India
Target market: 1,000+ engineering/professional colleges in South India
Initial focus: 100+ colleges in Tamil Nadu (Coimbatore region)
Estimated savings: $2M+ annually across target institutions
Appendix E: User Research Summary
Interviews Conducted:

12 educators (7 engineering, 3 arts, 2 science)
3 department heads
2 IT administrators

Key Findings:

Pain Points (Ranked):

Time spent on manual grading (92% mentioned)
Inconsistent scoring (75%)
Plagiarism detection costs (67%)
Delayed feedback to students (58%)
Documentation for accreditation (50%)

Feature Priorities (Ranked):

Grammar checking (100%)
Plagiarism detection (92%)
Batch processing (83%)
Custom rubrics (75%)
Analytics dashboard (67%)
AI text detection (58%)

Concerns:

AI accuracy and trustworthiness
Student data privacy
Learning curve for new system
Integration with existing workflows
Support and training availability

Willingness to Adopt:

83% would try if free
67% would recommend to colleagues
50% would pay if it saves significant time
42% concerned about replacing human judgment
Appendix F: Deployment Options
Option 1: On-Premise (Recommended for Privacy)

Pros: Complete data control, no recurring costs, customizable
Cons: Requires IT support, initial setup effort
Best For: Large institutions with IT team

Option 2: Oracle Cloud Always Free Tier

Specs: 4 OCPUs, 24GB RAM, 200GB storage (free forever)
Pros: Production-ready, scalable, managed services
Cons: Internet dependency, some vendor lock-in
Best For: Small/medium institutions without servers

Option 3: Hybrid (Database in Cloud, Compute On-Premise)

Pros: Balance of control and convenience
Cons: More complex setup, network dependency
Best For: Institutions with limited local storage

Option 4: Institutional Shared Hosting

Pros: Cost sharing across departments, easier maintenance
Cons: Resource contention, governance complexity
Best For: Multi-department or multi-campus deployments
Appendix G: References
Academic Research:

Shermis, M. D., & Burstein, J. (2013). Handbook of Automated Essay Evaluation
Condon, W., & Grayson, K. (2016). Reliability of Automated Essay Scoring
Perelman, L. (2014). When "The State of the Art" is Counting Words

Technical Documentation:

Firebase Authentication: https://firebase.google.com/docs/auth
MongoDB Manual: https://docs.mongodb.com/manual/
FastAPI Documentation: https://fastapi.tiangolo.com/
Sentence-Transformers: https://www.sbert.net/

Industry Reports:

EdTech Market Size 2024 (HolonIQ)
State of AI in Education (UNESCO)
Academic Integrity Report (International Center for Academic Integrity)


Revision Triggers:

Major technical architecture changes
Significant scope changes (>20% features)
Change in business model or target market
Post-MVP learnings requiring pivot
Quarterly review cycles



END OF DOCUMENT

This PRD is a living document that will evolve as we gather user feedback and technical insights. It should be reviewed and updated quarterly or when significant changes occur.


Quick Reference
TL;DR for Busy Stakeholders:

What: AI platform that automates academic document evaluation
Why: Saves educators 70% time, costs $0, ensures consistency
Who: 50+ educators across 5+ institutions initially
When: 12-week development, launch Q2 2026
How: Free open-source AI/ML tools on MongoDB + FastAPI + React
Cost: $0 recurring costs (vs $500-2000/year for alternatives)
ROI: $50k+ saved per year across institutions

Key Differentiators:

100% Free: Zero licensing or subscription costs
On-Premise: Data stays within institution
Customizable: Institution-specific rubrics and settings
Comprehensive: Grammar + plagiarism + AI detection + analytics
Fast: 30-second evaluation vs 10-15 minutes manual

Next Steps:

Review and approve this PRD
Secure development resources (2 devs × 12 weeks)
Identify beta testing educators (5+ volunteers)
Kick off development Week 1
Plan pilot deployment at 2 institutions


┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  React (Vite) + TailwindCSS + Zustand/Redux Toolkit        │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS/WSS
┌────────────────────▼────────────────────────────────────────┐
│                   API GATEWAY LAYER                          │
│              FastAPI + CORS + Rate Limiting                  │
└────────┬───────────────────────┬────────────────────────────┘
         │                       │
┌────────▼─────────┐   ┌────────▼──────────────────────────┐
│  Auth Service    │   │    Core API Services              │
│  (Firebase)      │   │  - Document Upload                │
└──────────────────┘   │  - Evaluation Engine              │
                       │  - Analytics                       │
                       │  - Report Generation               │
                       └────────┬──────────────────────────┘
                                │
                  ┌─────────────┼─────────────┐
                  │             │             │
         ┌────────▼────┐ ┌─────▼──────┐ ┌───▼──────────┐
         │  MongoDB    │ │   Redis    │ │  GridFS/     │
         │  Database   │ │   Cache    │ │  MinIO       │
         └─────────────┘ └────────────┘ └──────────────┘
                                │
                       ┌────────▼─────────────────┐
                       │  Background Workers      │
                       │  (Celery/ARQ)            │
                       │  - Document Processing   │
                       │  - AI Evaluation         │
                       │  - Batch Processing      │
                       └──────────────────────────┘
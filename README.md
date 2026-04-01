# EduScore AI - Automated Essay Scoring System

## 🚀 Getting Started

This guide will help you set up and run the EduScore AI platform locally on your machine.

### Prerequisites

Before you begin, ensure you have the following installed:

1.  **Docker Desktop** (with WSL 2 integration enabled if on Windows)
2.  **Git**

### 🛠️ Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/zogratis17/eduscore-ai.git
    cd eduscore-ai
    ```

2.  **Environment Configuration**
    
    The project comes with default configurations for development. For a quick start, the existing `docker-compose.yml` handles most settings.
    
    *   **Note:** The system currently uses mocked authentication for development simplicity. You do not need valid Firebase credentials to test the core features locally.

3.  **Start the Application**
    
    Run the following command to build and start all services:
    ```bash
    docker-compose up --build
    ```
    *   *If you are on a newer version of Docker, use `docker compose up --build`.*

4.  **Access the Services**

    Once the containers are running (this may take a few minutes the first time), access the following URLs:

    *   **Frontend (Dashboard):** [http://localhost:5173](http://localhost:5173)
    *   **Celery Monitoring (Flower):** [http://localhost:5555](http://localhost:5555)
    *   **MinIO Console (Storage):** [http://localhost:9001](http://localhost:9001)
        *   User: `minioadmin`
        *   Password: `changeme123`

### 🪟 Windows Support

You can run this application on Windows using **Docker Desktop** (Recommended).

1.  **Install Docker Desktop**: Ensure "Use WSL 2 based engine" is checked in Settings > General.
2.  **Run with Docker**:
    ```powershell
    docker-compose up --build
    ```

**Alternative: Local Script (Advanced)**
If you prefer running services locally (without Docker for code), we provide a helper script:
1.  Ensure you have Python 3.10+ and Node.js installed.
2.  Run `start_app.bat` (Double click or run in terminal).
    *   *Note: This requires MongoDB, Redis, and MinIO to be running separately (e.g., via Docker).*

### 📝 How to Use

1.  **Login:** Click "Login" (Mock login is enabled, any credentials work).
2.  **Upload:** Go to "New Evaluation", drag & drop a PDF/DOCX/TXT file (e.g., an essay).
3.  **Wait:** The file will be uploaded and processed.
    *   **Status: Completed** (Blue) -> File text extracted.
    *   **Status: Evaluated** (Green) -> AI analysis done.
4.  **View Results:** Click the "View" icon on the dashboard to see the score, grammar feedback, and other insights.

### 🛑 Troubleshooting

*   **"Upload Failed":** Ensure you are accessing the frontend via `localhost:5173`.
*   **"Pending" Status:** The dashboard does not auto-refresh. Refresh the page manually to see status updates.
*   **Ports Occupied:** Ensure ports 8000, 5173, 27017, 6379, and 9000 are free on your machine.

### 🏗️ Architecture

*   **Frontend:** React + Vite + TailwindCSS
*   **Backend:** FastAPI (Python)
*   **Database:** MongoDB
*   **Queue:** Redis + Celery
*   **AI Engine:** LanguageTool + Custom Logic

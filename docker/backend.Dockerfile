# 1. Base Image: Pin specific Python version (3.11-slim is small and stable)
FROM python:3.11-slim

# 2. Set environment variables
# PYTHONDONTWRITEBYTECODE: Prevents Python from writing .pyc files to disc
# PYTHONUNBUFFERED: Ensures logs are streamed directly to container logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# 3. Set work directory
WORKDIR /app

# 4. Install system dependencies
# gcc/python3-dev: Needed to compile some AI libraries if wheels aren't available
# libpq-dev: Often needed for DB drivers (if we used Postgres, but good to have)
# curl: For healthchecks
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 5. Install Python dependencies
# Copy only requirements first to leverage Docker cache
COPY requirements.txt .
# We use --no-cache-dir to keep the image small
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# 6. Copy project code
# In development, this is overridden by the volume mount, but critical for production
COPY app ./app

# 7. Expose the port FastAPI runs on
EXPOSE 8000

# 8. Command to run the application
# We use --reload for development (hot reloading)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
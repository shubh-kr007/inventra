FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Install python requirements from the backend folder
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend app codebase
COPY backend/app ./app

# Expose Uvicorn port
EXPOSE 8000

# Start Uvicorn running the app package
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

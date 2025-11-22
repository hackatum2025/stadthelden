FROM python:3.11-slim

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Install system dependencies and UV
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && pip install uv

# Copy UV configuration files first for better caching
COPY pyproject.toml uv.lock ./

# Install dependencies using UV
RUN uv sync --frozen --no-dev

# Copy the application code
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Run the application
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

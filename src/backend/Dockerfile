# -------------------------
# Stage 1: Builder
# -------------------------
FROM python:3.11-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python dependencies into a temporary folder
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt


# -------------------------
# Stage 2: Final image
# -------------------------
FROM python:3.11-slim

# Security best practices
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Create non-root user
RUN addgroup --system app && adduser --system --ingroup app app

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Copy application code
COPY . .

# Change ownership
RUN chown -R app:app /app
USER app

# Expose port
EXPOSE 5000

# Healthcheck (optional)
HEALTHCHECK CMD curl --fail http://localhost:5000/health || exit 1

# Run Gunicorn with Flask app
# Replace "app:app" with "<module_name>:<flask_app_variable>"
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app", "--workers=4", "--threads=2", "--timeout=60"]
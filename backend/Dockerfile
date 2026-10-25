# ==============================================================================
# Multi-Stage Production Dockerfile for Technea FastAPI Backend
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build & Dependency Resolution
# ------------------------------------------------------------------------------
FROM python:3.12-slim AS builder

WORKDIR /build

# Install system build dependencies for C-extensions (psycopg2, bcrypt, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create dedicated virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies without cache
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ------------------------------------------------------------------------------
# Stage 2: Minimal Runtime Environment
# ------------------------------------------------------------------------------
FROM python:3.12-slim AS runner

# Production runtime flags
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/opt/venv/bin:$PATH" \
    PORT=8000

WORKDIR /app

# Install minimal runtime dependencies (curl for healthchecks, libpq5 for PostgreSQL)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy isolated virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv

# Create unprivileged system user for container security
RUN addgroup --system --gid 10001 technea && \
    adduser --system --uid 10001 --ingroup technea --no-create-home technea

# Copy application source code and migrations into container
COPY --chown=technea:technea . /app

# Ensure uploads and static directories exist with proper write permissions
RUN mkdir -p /app/uploads/avatars /app/static/avatars && \
    chown -R technea:technea /app/uploads /app/static

# Switch to non-root user
USER technea

# Expose backend application port
EXPOSE 8000

# Container liveness health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Launch ASGI server with production flags
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2"]

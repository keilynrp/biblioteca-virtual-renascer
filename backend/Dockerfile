FROM python:3.13-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONHASHSEED=random \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    DEBIAN_FRONTEND=noninteractive

# Fix apt_pkg error - Deshabilitar command-not-found
RUN rm -f /etc/apt/apt.conf.d/50command-not-found \
    && echo 'APT::Update::Post-Invoke-Success "";' > /etc/apt/apt.conf.d/99no-command-not-found \
    && rm -f /var/lib/command-not-found/commands.db 2>/dev/null || true

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    python3-apt \
    gcc \
    libpq-dev \
    curl \
    libmagic1 \
    libmagic-dev \
    && rm -f /etc/apt/apt.conf.d/docker-clean \
    && rm -f /usr/lib/cnf-update-db \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir gunicorn gevent

# Copy project (this will be overridden by volume mount in development)
COPY . .

# Ensure entrypoint scripts are executable
RUN chmod +x /app/entrypoint.prod.sh 2>/dev/null || true

# Run as root in development to avoid permission issues with volume mounts
# In production, you should create a non-root user
# RUN addgroup --system django \
#     && adduser --system --ingroup django django \
#     && chown -R django:django /app
# USER django

# Run entrypoint
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2", "--threads", "4", "--timeout", "60"]

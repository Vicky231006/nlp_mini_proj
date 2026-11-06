# NCERT Adaptive Tutor — Deployment Guide

This guide details the complete production deployment procedures for the **NCERT Adaptive AI Tutor**. It covers system architecture, environment configuration, standard Linux VM deployment with `systemd` and Nginx, containerized deployment using Docker Compose, database persistence, and maintenance protocols.

---

## 1. System Architecture Overview

The system consists of three cooperating tiers:

```
                          ┌──────────────────────────┐
                          │   Client Web Browser     │
                          │ (React 19 / Vite SPA)    │
                          └─────────────┬────────────┘
                                        │ HTTPS (Port 443 / 80)
                                        ▼
                          ┌──────────────────────────┐
                          │    Nginx Reverse Proxy   │
                          │   (SSL, Gzip, Security)  │
                          └─────────────┬────────────┘
                                        │ Reverse Proxy
                                        ▼
                          ┌──────────────────────────┐
                          │   Node.js Express API    │
                          │ (Port 3001, Node 22+ ESM)│
                          │ - Native SQLite DB       │
                          │ - Cognitive Profiling    │
                          │ - Safety Guardrails      │
                          └──────┬────────────┬──────┘
                                 │            │
             NCERT RAG (HTTP)    │            │ Chat Completion
                                 ▼            ▼
   ┌──────────────────────────────┐          ┌───────────────────────────┐
   │ Python Retrieval Service     │          │ LLM Provider              │
   │ (FastAPI / Uvicorn on 8000)  │          │ - Groq / Ollama / vLLM    │
   │ - FAISS Dense Vector Index   │          │   (OpenAI-Compatible)     │
   │ - BM25 Lexical Index         │          │ - Google Gemini API       │
   │ - BGE Cross-Encoder Reranker │          └───────────────────────────┘
   └──────────────────────────────┘
```

1. **Frontend / Web Client**: Single Page Application built with React 19, Vite, and Tailwind CSS. In production, pre-compiled static assets in `dist/` are served directly by Express or Nginx.
2. **Core API Server**: Node.js 22+ Express application that handles user authentication, session security, onboarding assessment profiling, child safety guardrails, and conversation persistence via built-in `node:sqlite`.
3. **NCERT Retrieval Service**: Python FastAPI microservice that loads NCERT textbook chunks (`artifacts/english_only_v1/`) and executes hybrid retrieval (FAISS dense embeddings + BM25 lexical keyword matching + Reciprocal Rank Fusion + BGE Cross-Encoder reranking).
4. **LLM Inference Provider**: Cloud API (Groq `qwen/qwen3.8-27b`, Google Gemini `gemini-3.1-flash-lite`) or self-hosted local model (Ollama / vLLM).

---

## 2. Hardware & Software Prerequisites

### Minimum Server Specifications
- **CPU**: 2 vCPUs (4 vCPUs recommended for faster neural reranking).
- **RAM**: 4 GB minimum (8 GB recommended for caching FAISS indices and sentence-transformer models in RAM).
- **Disk**: 15 GB SSD (repository, artifacts, models, and OS).
- **OS**: Ubuntu 22.04 LTS / 24.04 LTS, Debian 12, or any modern Linux distribution.

### Software Requirements
- **Node.js**: Version **22.0.0 or higher** (Required for native `node:sqlite` support).
- **Python**: Version **3.10 to 3.13**.
- **Nginx**: For SSL termination and reverse proxying.
- **Git** & **curl**.

---

## 3. Environment Variables Reference (`.env`)

Create a production `.env` file in the project root:

```ini
# ==============================================================================
# Node.js Server & Application Settings
# ==============================================================================
PORT=3001
NODE_ENV=production
APP_DATABASE_PATH=./data/accounts.sqlite

# ==============================================================================
# LLM Provider Configuration
# Choose either 'gemini' or 'openai-compatible'
# ==============================================================================
CHAT_PROVIDER=openai-compatible

# --- Option A: OpenAI-Compatible / Groq / Ollama / vLLM ---
LOCAL_MODEL_BASE_URL=https://api.groq.com/openai/v1
LOCAL_MODEL_NAME=qwen/qwen3.8-27b
LOCAL_MODEL_API_KEY=gsk_your_groq_api_key_here

# For local Ollama:
# LOCAL_MODEL_BASE_URL=http://127.0.0.1:11434/v1
# LOCAL_MODEL_NAME=qwen2.5:1.5b
# LOCAL_MODEL_API_KEY=

# --- Option B: Google Gemini API ---
# CHAT_PROVIDER=gemini
# GEMINI_API_KEY=your_gemini_api_key
# GEMINI_MODEL=gemini-3.1-flash-lite
# Multi-key failover list (optional):
# GEMINI_API_KEYS=key1,key2,key3

# ==============================================================================
# NCERT RAG Retrieval Service Settings
# ==============================================================================
NCERT_RETRIEVAL_ENABLED=true
NCERT_RETRIEVAL_URL=http://127.0.0.1:8000
NCERT_RETRIEVAL_TOP_K=5
NCERT_RETRIEVAL_TIMEOUT_MS=15000
NCERT_RETRIEVAL_MIN_SCORE=-2
```

---

## 4. Production Deployment on a Linux VM (Recommended)

This is the standard, high-performance deployment setup using `systemd` process supervision and Nginx.

### Step 1: System Packages & Node.js 22 Installation

```bash
# Update package lists
sudo apt update && sudo apt upgrade -y

# Install build dependencies, python venv, and nginx
sudo apt install -y curl git build-essential python3 python3-venv python3-pip nginx certbot python3-certbot-nginx

# Install Node.js 22 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Verify versions
node -v    # Must output v22.x.x
python3 --version
```

### Step 2: Clone Codebase & Set Permissions

```bash
# Create application directory
sudo mkdir -p /var/www/ncert-tutor
sudo chown -R $USER:$USER /var/www/ncert-tutor

# Clone your repository
git clone https://github.com/your-username/nlp_mini_proj.git /var/www/ncert-tutor
cd /var/www/ncert-tutor

# Ensure data directory exists for SQLite
mkdir -p data
```

### Step 3: Configure Python Retrieval Microservice

```bash
# Create isolated python virtual environment
python3 -m venv .venv-retrieval

# Activate virtual environment
source .venv-retrieval/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install retrieval dependencies
pip install -r requirements-retrieval.txt

# Pre-download neural models to verify integrity
python3 -c "
from sentence_transformers import SentenceTransformer, CrossEncoder
print('Downloading bi-encoder...')
SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
print('Downloading cross-encoder...')
CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
print('Models cached successfully!')
"

deactivate
```

### Step 4: Build Node.js & React Frontend

```bash
# Install Node dependencies
npm ci

# Configure production environment variables
cp .env.example .env
nano .env  # Add your API keys and production settings

# Compile the Vite React frontend into /dist
npm run build

# Verify build output
ls -la dist/index.html
```

---

### Step 5: Configure `systemd` Services

Create two independent systemd unit files so both services start automatically on boot and restart if crashed.

#### 1. Python Retrieval Service (`/etc/systemd/system/ncert-retrieval.service`)

```bash
sudo nano /etc/systemd/system/ncert-retrieval.service
```

Paste the following:

```ini
[Unit]
Description=NCERT RAG Retrieval Service (FastAPI / FAISS)
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/var/www/ncert-tutor
Environment="PYTHONUNBUFFERED=1"
Environment="NCERT_ARTIFACT_ROOT=/var/www/ncert-tutor/artifacts/english_only_v1"
ExecStart=/var/www/ncert-tutor/.venv-retrieval/bin/python -m uvicorn retrieval_service:app --host 127.0.0.1 --port 8000 --workers 1
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```
*(Replace `User=ubuntu` with your Linux username if different).*

#### 2. Node.js Express Application (`/etc/systemd/system/ncert-tutor.service`)

```bash
sudo nano /etc/systemd/system/ncert-tutor.service
```

Paste the following:

```ini
[Unit]
Description=NCERT Adaptive Tutor Web & API Server
After=network.target ncert-retrieval.service
Wants=ncert-retrieval.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/var/www/ncert-tutor
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server/index.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

#### Enable and Start Services:

```bash
sudo systemctl daemon-reload

# Enable to launch on system boot
sudo systemctl enable ncert-retrieval
sudo systemctl enable ncert-tutor

# Start services
sudo systemctl start ncert-retrieval
sudo systemctl start ncert-tutor

# Verify statuses
sudo systemctl status ncert-retrieval --no-pager
sudo systemctl status ncert-tutor --no-pager
```

---

### Step 6: Configure Nginx Reverse Proxy with HTTPS

Create an Nginx server block:

```bash
sudo nano /etc/nginx/sites-available/ncert-tutor
```

Paste the configuration below (replace `tutor.yourdomain.com` with your domain or server IP):

```nginx
server {
    listen 80;
    server_name tutor.yourdomain.com;

    # Client body limit for audio speech transcription
    client_max_body_size 20M;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Reverse proxy all traffic to Node.js Express app
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
    }
}
```

Enable site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/ncert-tutor /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

#### Obtain Free SSL Certificate via Let's Encrypt:

```bash
sudo certbot --nginx -d tutor.yourdomain.com
```

Certbot will automatically install the certificate, configure HTTPS redirect, and set up automated renewal.

---

## 5. Containerized Deployment (Docker & Docker Compose)

If you prefer deploying via Docker, a multi-container compose architecture is provided below.

### 1. `docker-compose.yml`

Create `docker-compose.yml` in the project root:

```yaml
version: '3.8'

services:
  retrieval:
    build:
      context: .
      dockerfile: Dockerfile.retrieval
    restart: always
    environment:
      - PYTHONUNBUFFERED=1
    ports:
      - "127.0.0.1:8000:8000"
    volumes:
      - ./artifacts:/app/artifacts:ro

  app:
    build:
      context: .
      dockerfile: Dockerfile.app
    restart: always
    depends_on:
      - retrieval
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - NCERT_RETRIEVAL_URL=http://retrieval:8000
      - APP_DATABASE_PATH=/app/data/accounts.sqlite
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
```

### 2. `Dockerfile.retrieval`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-retrieval.txt .
RUN pip install --no-cache-dir -r requirements-retrieval.txt

COPY retrieval_service.py .
COPY artifacts /app/artifacts

EXPOSE 8000

CMD ["uvicorn", "retrieval_service:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 3. `Dockerfile.app`

```dockerfile
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY server ./server
COPY shared ./shared

EXPOSE 3001

CMD ["node", "server/index.js"]
```

### Deploying with Docker Compose:

```bash
docker compose up -d --build
```

---

## 6. Database Persistence & Backup Protocol

The application uses native SQLite stored at `data/accounts.sqlite` for user accounts, password hashes, onboarding assessment scores, and conversation logs.

### Safe Online Backup
SQLite supports online live backups without taking the application offline:

```bash
# Create safe backup directory
mkdir -p /var/backups/ncert-tutor

# Create consistent atomic snapshot
sqlite3 /var/www/ncert-tutor/data/accounts.sqlite ".backup '/var/backups/ncert-tutor/backup-$(date +%F_%H%M%S).sqlite'"
```

### Automated Nightly Backup Cron Job
Add to root crontab (`sudo crontab -e`):

```bash
0 2 * * * sqlite3 /var/www/ncert-tutor/data/accounts.sqlite ".backup '/var/backups/ncert-tutor/backup-$(date +\%F).sqlite'" && find /var/backups/ncert-tutor -name "*.sqlite" -mtime +14 -delete
```
This performs a nightly backup at 2:00 AM and rotates backups older than 14 days.

---

## 7. Health Checks & Verification

After deployment, test all health and API endpoints:

### 1. Test Retrieval Health
```bash
curl -s http://127.0.0.1:8000/health | jq .
```
Expected output:
```json
{
  "status": "ok",
  "chunks": 2033,
  "device": "cpu"
}
```

### 2. Test Retrieval Query
```bash
curl -X POST http://127.0.0.1:8000/retrieve \
  -H "Content-Type: application/json" \
  -d '{"query": "Class 2 Joyful-Mathematics Chapter 6 Decoration for Festival", "top_k": 3}' | jq .
```

### 3. Test Web App / API Status
```bash
curl -I https://tutor.yourdomain.com
```
Expected output: `HTTP/2 200` or `HTTP/1.1 200 OK`.

---

## 8. Log Management & Troubleshooting

### Viewing Live Logs

```bash
# Node.js Express logs
sudo journalctl -u ncert-tutor -f

# Python Retrieval Service logs
sudo journalctl -u ncert-retrieval -f

# Nginx access & error logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Common Issues & Remedies

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **`node:sqlite not found`** | Node.js version is `< 22.0.0` | Install Node.js 22 LTS via NodeSource (`setup_22.x`). |
| **`502 Bad Gateway` on Nginx** | Node server is down or crashed | Check `sudo systemctl status ncert-tutor` and journalctl logs. |
| **`Retriever timeout / fallback`** | Python microservice not running on port 8000 | Ensure `ncert-retrieval.service` is active. RAG is fail-open so the tutor still responds using parametric knowledge. |
| **`429 Rate Limit` on Chat** | Exceeded Groq or Gemini free tier requests per minute | The backend has exponential backoff retries built-in. Consider upgrading API tier or switching model endpoints in `.env`. |
| **`Out of Memory (OOM)`** | VPS has less than 2 GB RAM during model download | Enable a 4 GB Linux swap file (`sudo fallocate -l 4G /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`). |

---

## 9. Zero-Downtime Update Procedure

To update the application with new code or bugfixes:

```bash
cd /var/www/ncert-tutor

# Pull latest code
git pull origin main

# Install any updated dependencies
npm ci
source .venv-retrieval/bin/activate
pip install -r requirements-retrieval.txt
deactivate

# Recompile frontend
npm run build

# Gracefully restart services
sudo systemctl restart ncert-retrieval
sudo systemctl restart ncert-tutor

# Verify both are running
sudo systemctl status ncert-tutor --no-pager
```


# Technea Production Deployment & Infrastructure Guide

This runbook provides complete, production-grade deployment instructions for **Technea** — covering the **Vite/React Frontend (Vercel)**, **FastAPI Backend (Render, Railway, or Docker)**, and **Cloud PostgreSQL (Neon, Supabase, or Railway)**.

---

## Architecture Overview

```mermaid
flowchart LR
    Client([User Browser])
    subgraph Vercel ["Frontend Platform (Vercel)"]
        SPA["Vite + React SPA\n(Custom Domain / CDN)"]
        VercelConfig["vercel.json\n(SPA Rewrites & Caching)"]
    end
    subgraph CloudBackend ["Backend Platform (Render / Railway / Docker)"]
        Uvicorn["Uvicorn Workers (ASGI)\nport: $PORT, workers: 2"]
        FastAPI["FastAPI App (/api/v1)"]
        HealthRouter["Health & Readiness\n(/health, /ready)"]
    end
    subgraph CloudDB ["Managed Database"]
        PG[(PostgreSQL 16\nNeon / Supabase / Render)]
    end
    subgraph External ["External AI"]
        Gemini["Google Gemini API\n(gemini-1.5-flash)"]
    end

    Client -->|HTTPS: HTML / JS / CSS| SPA
    Client -->|HTTPS API Requests| FastAPI
    FastAPI -->|Async Connection Pool| PG
    FastAPI -->|AI Guidance & Recommendations| Gemini
    HealthRouter -->|SELECT 1 Ping| PG
```

---

## 1. Quick Launch Summary (Pre-Deployment Checklist)

| Component | Target Platform | Build Command | Output / Start Command | Required Env Vars |
|---|---|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) | `npm run build` | `dist` | `VITE_API_URL`, `VITE_BACKEND_URL` |
| **Backend** | [Render](https://render.com) | `pip install -r requirements.txt` | `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2` | `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`, `GEMINI_API_KEY`, `RESEND_API_KEY`, `FRONTEND_URL`, `EMAIL_FROM` |
| **Backend (Alt)** | [Railway](https://railway.app) | Dockerfile / Nixpacks | Managed via `backend/railway.json` | Same as above |
| **Database** | Neon / Supabase / Render | Managed | PostgreSQL 15+ / 16 | Connection string with SSL |

---

## 2. PostgreSQL Provisioning & Schema Migrations

FastAPI connects asynchronously via **`asyncpg`** for runtime API queries, and uses **`psycopg2`** for synchronous **Alembic** migrations. The application automatically normalizes `postgres://` and `postgresql://` connection strings into the required driver format.

### Option A: Neon Serverless PostgreSQL (Recommended)
1. Navigate to [Neon Console](https://console.neon.tech/) and create a project named `technea-prod`.
2. Select your closest AWS Region (e.g. `us-east-1` or `eu-central-1`).
3. Under **Dashboard > Connection Details**, copy the connection string. Select **Pooled connection** or direct connection:
   ```text
   postgresql://technea_owner:password123@ep-cool-flower-123456.us-east-2.aws.neon.tech/technea_db?sslmode=require
   ```
4. Set this string as `DATABASE_URL` in your backend environment.

### Option B: Supabase Managed PostgreSQL
1. Create a project at [Supabase](https://supabase.com/).
2. Navigate to **Project Settings > Database > Connection Strings**.
3. Copy the **URI** (Session Pooler mode on port `5432` or direct connection):
   ```text
   postgresql://postgres:password123@db.yourproject.supabase.co:5432/postgres?sslmode=require
   ```

### Option C: Railway or Render PostgreSQL
- **Render**: Automatically created and linked via `render.yaml`.
- **Railway**: Click **New > Database > PostgreSQL**. Railway automatically exposes the `DATABASE_URL` variable to linked services.

### Running Alembic Migrations
Run the schema migrations against your production database before directing live traffic:

```bash
cd /home/harsh/Technea/backend

# Export your production sync connection URL:
export DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<dbname>?sslmode=require"

# Apply all migrations to the latest revision
alembic upgrade head
```

Verify your current migration head:
```bash
alembic current
```

---

## 3. Backend Deployment

### Option 1: Render (1-Click Blueprint or Manual Web Service)

#### A. 1-Click Blueprint (Automated)
The repository includes a ready-to-use Render Blueprint (`render.yaml`) that spins up both the FastAPI web service and a managed PostgreSQL database.

1. Push your repository to GitHub or GitLab.
2. Sign in to [Render Dashboard](https://dashboard.render.com/).
3. Click **Blueprints > New Blueprint Instance**.
4. Connect the `Technea` repository. Render detects `/render.yaml`.
5. Enter required secrets when prompted:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `CORS_ORIGINS`: `["https://technea.vercel.app"]` (or your domain).
   - `RESEND_API_KEY`: Your Resend API key (e.g. `re_123456...`).
6. Click **Apply**.
   - Render provisions `technea-postgres`.
   - Runs `alembic upgrade head && python -m app.db.init_db` automatically before booting `uvicorn`.
   - Deploys the web service with healthchecks enabled at `/health`.

#### B. Manual Web Service Configuration (Render Free Tier or Existing Service)
If configuring a Web Service manually in Render Dashboard:
- **Root Directory**: `backend`
- **Environment**: `Python 3`
- **Build Command**:
  ```bash
  pip install --upgrade pip && pip install -r requirements.txt
  ```
- **Start Command**:
  ```bash
  alembic upgrade head && python -m app.db.init_db && exec uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2
  ```
- **Environment Variables**:
  - `DATABASE_URL`: Your PostgreSQL connection string (from Render PostgreSQL, Neon, or Supabase).
  - `ENVIRONMENT`: `production`
  - `DEBUG`: `false`
  - `SECRET_KEY`: A secure random secret key (min 32 characters).
  - `CORS_ORIGINS`: `["https://technea.vercel.app"]`
  - `FRONTEND_URL`: `https://technea.vercel.app`
  - `GEMINI_API_KEY`: Your Google Gemini API key.
  - `RESEND_API_KEY`: Your Resend API key (`re_...`).
  - `EMAIL_FROM`: `Technea <onboarding@resend.dev>`

#### C. Configuring Email & Resend in Render Dashboard
Technea provides production transactional emails for email verification, password reset, and passwordless 6-digit OTP codes via **Resend**:

1. **Obtain API Key**:
   - Register or sign in at [Resend](https://resend.com).
   - In the sidebar, navigate to **API Keys** and click **Create API Key**.
   - Assign the key full sending access and copy the generated token (starts with `re_`).

2. **Configure in Render**:
   - Open your backend service on [Render Dashboard](https://dashboard.render.com).
   - Select **Environment** from the left navigation panel.
   - Under **Environment Variables**, locate or click **Add Environment Variable**:
     - Key: `RESEND_API_KEY`
     - Value: `re_your_api_key_here`
   - Also confirm or add:
     - `EMAIL_FROM`: `Technea <onboarding@resend.dev>`
     - `FRONTEND_URL`: `https://technea.vercel.app`
   - Click **Save Changes**. Render will automatically trigger a rolling redeployment.

3. **Why `onboarding@resend.dev` Works Instantly**:
   - Resend provisions a shared, pre-authenticated test domain (`resend.dev`).
   - Using `Technea <onboarding@resend.dev>` requires **no DNS configuration**, so emails deliver instantly without waiting for DNS propagation.
   - *Limitation during testing*: Resend allows sending to the email address registered with your Resend account.
   - *Production Custom Domain Transition*: When ready for public users, navigate to **Domains > Add Domain** in Resend, add the SPF/DKIM TXT DNS records to your domain registrar, and then update `EMAIL_FROM` to `Technea <noreply@yourdomain.com>`.

4. **Optional SMTP Fallback**:
   - Technea also supports standard SMTP (e.g. Gmail SMTP, AWS SES, Mailgun).
   - Set `SMTP_HOST` (e.g. `smtp.gmail.com`), `SMTP_PORT` (`587`), `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_TLS` (`true`) in Render Environment if utilizing an SMTP relay.

### Option 2: Railway

1. Sign in to [Railway](https://railway.app/).
2. Click **New Project > Deploy from GitHub repo**.
3. Select the `Technea` repository.
4. Set the **Root Directory** to `backend`.
5. Add a **PostgreSQL** service to the project canvas.
6. Under your backend service settings:
   - **Variables**: Reference `${{Postgres.DATABASE_URL}}` as `DATABASE_URL`.
   - Add `SECRET_KEY`, `CORS_ORIGINS`, and `GEMINI_API_KEY`.
7. Railway utilizes `backend/railway.json` and `backend/Dockerfile` to build and deploy.

### Option 3: Standalone Docker / Cloud Run / VPS

The multi-stage `backend/Dockerfile` runs on Python 3.12-slim with a hardened non-root user (`technea`).

#### Build the image:
```bash
cd /home/harsh/Technea/backend
docker build -t technea-backend:latest .
```

#### Run with Docker:
```bash
docker run -d \
  --name technea-backend \
  --restart unless-stopped \
  -p 8000:8000 \
  -e PORT=8000 \
  -e ENVIRONMENT=production \
  -e DEBUG=False \
  -e SECRET_KEY="your-64-char-random-secret" \
  -e CORS_ORIGINS='["https://technea.vercel.app"]' \
  -e DATABASE_URL="postgresql+asyncpg://user:pass@host:5432/db?sslmode=require" \
  -e GEMINI_API_KEY="your-gemini-key" \
  technea-backend:latest
```

#### Test container healthcheck:
```bash
docker inspect --format='{{json .State.Health}}' technea-backend
```

---

## 4. Frontend Deployment (Vercel)

The frontend is a modern React/Vite single-page application configured with `frontend/vercel.json` to handle SPA routing rewrites and aggressive caching for immutable production chunks.

### Step 1: Connect Repository to Vercel
1. Log in to [Vercel](https://vercel.com) and click **Add New... > Project**.
2. Select your repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` *(Click Edit and choose `frontend`)*
   - **Build Command**: `vite build` (or `npm run build`)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --include=dev` (configured automatically via `vercel.json`)
   *(Note: The repository also includes a root `vercel.json` fallback, so builds will succeed even if Root Directory was left as root `./`)*

### Step 2: Configure Production Environment Variables
In Vercel **Settings > Environment Variables**, add:

| Variable Name | Example Value | Description |
|---|---|---|
| `VITE_API_URL` | `https://technea-backend.onrender.com/api/v1` | Full API endpoint prefix for backend |
| `VITE_API_BASE_URL` | `https://technea-backend.onrender.com/api/v1` | Redundant base URL fallback |
| `VITE_BACKEND_URL` | `https://technea-backend.onrender.com` | Root backend origin for avatar images |

> [!IMPORTANT]
> Ensure there are **no trailing slashes** at the end of `VITE_BACKEND_URL` or `VITE_API_URL`.

### Step 3: Deploy & Verify
Click **Deploy**. Once built, Vercel provides a domain like `https://technea-frontend.vercel.app`.

---

## 5. Domain Configuration & CORS Alignment

CORS (Cross-Origin Resource Sharing) protects your API from unauthorized cross-domain calls. For smooth operation, your frontend URL must match the backend's allowed list.

### 1. Custom Domain DNS Setup
If using a custom domain (e.g. `technea.com` and `api.technea.com`):

| Type | Host | Points To / Value | TTL |
|---|---|---|---|
| **CNAME** | `@` (or `www`) | `cname.vercel-dns.com.` | Auto |
| **CNAME** | `api` | `technea-backend.onrender.com.` (or Railway CNAME) | Auto |

### 2. Backend CORS Settings
In your Backend environment configuration (Render/Railway dashboard or `.env`), update `CORS_ORIGINS`:

```bash
# JSON array format:
CORS_ORIGINS='["https://technea.com","https://www.technea.com","https://technea.vercel.app"]'

# Or comma-separated string:
CORS_ORIGINS="https://technea.com,https://www.technea.com,https://technea.vercel.app"
```

> [!WARNING]
> Do NOT use `*` (wildcard) with credentials (`allow_credentials=True`), as modern browsers will reject cookies and authorization headers with wildcard origins. Always provide exact origins.

---

## 6. Smoke Tests & Verification Runbook

Run these commands against your live deployment to verify all subsystems:

### 1. Backend Liveness Check
```bash
curl -i https://<your-backend-domain>/health
```
**Expected Response:** `HTTP/1.1 200 OK`
```json
{"status":"ok","app_name":"Technea API","version":"0.1.0","environment":"production","database_connected":true}
```

### 2. Backend Database Readiness Check
```bash
curl -i https://<your-backend-domain>/ready
```
**Expected Response:** `HTTP/1.1 200 OK`
```json
{"status":"ok","app_name":"Technea API","version":"0.1.0","environment":"production","database_connected":true}
```

### 3. Frontend SPA Routing Test
In a browser, navigate directly to a sub-route such as:
`https://<your-frontend-domain>/roadmap` or `https://<your-frontend-domain>/login`
Refresh the page. Thanks to `vercel.json` rewrite rule `/(.*) -> /index.html`, the page will load seamlessly without a 404 error.

### 4. CORS Preflight Verification
Verify that OPTIONS preflight requests return the proper headers:
```bash
curl -i -X OPTIONS https://<your-backend-domain>/api/v1/auth/login \
  -H "Origin: https://technea.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"
```
**Expected Response:**
```http
HTTP/1.1 200 OK
access-control-allow-origin: https://technea.vercel.app
access-control-allow-credentials: true
access-control-allow-methods: *
access-control-allow-headers: *
```

---

## 7. Operational Maintenance & Troubleshooting

### Generating a Secure Production Secret Key
Use `openssl` to produce a 256-bit random hex string:
```bash
openssl rand -hex 32
```

### Handling Cold Starts on Free Tiers
If deploying on free platform tiers (Render Free or Railway Hobby), services sleep after 15 minutes of inactivity:
- Set up a free uptime monitor (e.g., [UptimeRobot](https://uptimerobot.com) or [Better Stack](https://betterstack.com)) pinging `https://<backend-url>/health` every 10 minutes to prevent sleep cycles.

### Inspecting Production Logs
- **Render**: Go to Service > **Logs**.
- **Railway**: Click the backend card > **Deployments > View Logs**.
- **Docker**:
  ```bash
  docker logs --tail 100 -f technea-backend
  ```

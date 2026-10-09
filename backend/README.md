# Technea Backend

A scalable, production-ready backend foundation for the **Technea** learning platform. Built with Python 3.14, FastAPI, PostgreSQL, SQLAlchemy 2.0 (asyncio), and Alembic.

---

## 🛠️ Tech Stack

- **Runtime**: Python 3.14
- **Web Framework**: [FastAPI](https://fastapi.tiangolo.com/) (modern ASGI framework)
- **ASGI Server**: [Uvicorn](https://www.uvicorn.org/) (standard high-performance server)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [SQLAlchemy 2.0](https://docs.sqlalchemy.org/en/20/) (Full AsyncIO support via `asyncpg`)
- **Database Migrations**: [Alembic](https://alembic.sqlalchemy.org/en/latest/) (configured for AsyncIO)
- **Data Validation & Settings**: [Pydantic v2](https://docs.pydantic.dev/latest/) & [pydantic-settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
- **Environment Management**: [python-dotenv](https://github.com/theskumar/python-dotenv)

---

## 📁 Project Architecture

```
backend/
├── app/
│   ├── api/                 # API routing and shared dependencies
│   │   ├── v1/              # Version 1 API router aggregator
│   │   │   ├── __init__.py
│   │   │   └── api.py
│   │   ├── __init__.py
│   │   └── deps.py          # Dependency injection (DB session, pagination, etc.)
│   │
│   ├── core/                # Core configurations and infrastructure
│   │   ├── __init__.py
│   │   ├── config.py        # Pydantic v2 BaseSettings configuration
│   │   └── logger.py        # Centralized structured logging setup
│   │
│   ├── db/                  # Database connectivity and ORM setup
│   │   ├── __init__.py
│   │   ├── base.py          # SQLAlchemy DeclarativeBase
│   │   └── session.py       # Async engine & sessionmaker (get_db dependency)
│   │
│   ├── models/              # SQLAlchemy 2.0 declarative database models
│   │   ├── __init__.py      # Model registry for Alembic detection
│   │   └── base.py          # Reusable model mixins (UUID, Timestamps, Table naming)
│   │
│   ├── routers/             # Domain endpoints and route handlers
│   │   ├── __init__.py
│   │   └── health.py        # Liveness & database readiness checks
│   │
│   ├── schemas/             # Pydantic v2 request/response schemas
│   │   ├── __init__.py
│   │   └── common.py        # Shared response wrappers, pagination, health models
│   │
│   ├── services/            # Business logic and database operations layer
│   │   ├── __init__.py
│   │   └── base.py          # Generic Async CRUD BaseService
│   │
│   ├── utils/               # Shared helpers, exceptions, and handlers
│   │   ├── __init__.py
│   │   └── exceptions.py    # Custom HTTP exceptions & global error handlers
│   │
│   ├── __init__.py
│   └── main.py              # Application factory, lifespan, CORS, middleware
│
├── alembic/                 # Database migration scripts
│   ├── versions/            # Migration revisions
│   ├── env.py               # Async Alembic execution environment
│   ├── script.py.mako       # Migration template
│   └── README
│
├── alembic.ini              # Alembic configuration
├── requirements.txt         # Production and development dependencies
├── .env.example             # Example environment variables
├── .gitignore               # Python and environment ignore rules
└── README.md                # Backend documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites

- Python `3.14+`
- PostgreSQL `14+`
- `pip` or modern Python package manager

### 2. Environment Setup

Create and activate a virtual environment:

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
# On Linux / macOS:
source .venv/bin/activate
# On Windows:
# .venv\Scripts\activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configuration

Copy the example environment configuration:

```bash
cp .env.example .env
```

Adjust the database credentials in `.env` to match your local PostgreSQL configuration:

```env
POSTGRES_SERVER="localhost"
POSTGRES_PORT=5432
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="your_password"
POSTGRES_DB="technea_db"
DATABASE_URL="postgresql+asyncpg://postgres:your_password@localhost:5432/technea_db"
```

---

## 🗄️ Database Migrations

Alembic is pre-configured to automatically load models from `app/models/` and connect asynchronously using your `.env` configuration.

### Initialize / Apply Migrations

```bash
# Generate a new migration revision based on models
alembic revision --autogenerate -m "initial migration"

# Apply migrations to database
alembic upgrade head

# Roll back by one migration
alembic downgrade -1
```

---

## 🏃 Running the Application

### Development Server

Start the ASGI server with auto-reload:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Interactive API Documentation

Once the server is running, visit:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)
- **Readiness Check**: [http://localhost:8000/ready](http://localhost:8000/ready)

---

## 🧱 Architectural Patterns & Guidelines

### 1. Asynchronous Database Access (`app/db`)
- Uses SQLAlchemy 2.0 `create_async_engine` with `asyncpg`.
- The `get_db` generator dependency yields an `AsyncSession` with automatic transaction commit on success and rollback on exceptions.

### 2. Service Layer Pattern (`app/services`)
- Routers should avoid querying the database directly.
- Business logic and DB queries belong in `app/services/`.
- `BaseService` provides standard asynchronous CRUD helpers (`get`, `get_multi`, `create`, `update`, `remove`).

### 3. Modular Routers (`app/routers` & `app/api`)
- Domain-specific routes are created in `app/routers/<domain>.py`.
- Routers are registered in `app/api/v1/api.py`, keeping `app/main.py` decoupled and clean.

### 4. Schema Validation (`app/schemas`)
- All incoming request payloads and outgoing responses are validated using Pydantic v2 schemas.
- Common reusable structures (pagination, standard message responses) reside in `app/schemas/common.py`.

### 5. Dependency Injection (`app/api/deps.py`)
- FastAPI dependencies (`DatabaseDep`, `PaginationDep`) ensure type-safe, reusable logic across all endpoints.

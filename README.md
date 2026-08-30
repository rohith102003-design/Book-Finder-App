# 📚 BiblioTrack / Book Finder App

A full-stack, production-ready web application for discovering books, managing personal reading bookshelves, publishing community reviews with verified reader badges, tracking annual reading challenges, following other readers, and generating deterministic personalized book recommendations.

---

## 📑 Table of Contents

1. [About the Project](#-about-the-project)
2. [Tech Stack](#-tech-stack)
3. [Architecture & Features Overview](#-architecture--features-overview)
4. [Prerequisites](#-prerequisites)
5. [Quick Start Guide (Step-by-Step)](#-quick-start-guide-step-by-step)
   - [Step 1: Clone Repository](#step-1-clone-repository)
   - [Step 2: PostgreSQL Database Setup](#step-2-postgresql-database-setup)
   - [Step 3: Backend Setup & Environment Variables](#step-3-backend-setup--environment-variables)
   - [Step 4: Install Dependencies & Drivers](#step-4-install-dependencies--drivers)
   - [Step 5: Run Alembic Database Migrations](#step-5-run-alembic-database-migrations)
   - [Step 6: Start Backend Server](#step-6-start-backend-server)
   - [Step 7: Start Frontend Application](#step-7-start-frontend-application)
6. [API Documentation](#-api-documentation)
7. [Running Tests & Build](#-running-tests--build)
8. [🛠️ Comprehensive Troubleshooting Runbook](#️-comprehensive-troubleshooting-runbook)

---

## 🌟 About the Project

**BiblioTrack (Book Finder App)** connects readers with the OpenLibrary catalog and provides rich reading management and social community interaction:
* **Book Discovery:** Instant search by title, author, and subject with cover image caching and previews.
* **Personal Bookshelf:** Reading status management (`WANT_TO_READ`, `READING`, `COMPLETED`) with page-by-page progress tracking.
* **Community Reviews & Ratings:** 1–5 star ratings, spoiler warnings, helpful upvotes, and server-validated **Verified Reader** badges.
* **Social Connections:** Follow other reviewers, inspect follower statistics, and view a live chronological activity feed.
* **Notifications:** Live unread count badge and notifications when readers follow you or upvote your reviews.
* **Personalized Recommendations:** Deterministic multi-factor recommendation engine combining genre preferences, author tastes, completed reading history, and community rating statistics.

---

## 💻 Tech Stack

### Backend
* **Language:** Python 3.12+
* **Framework:** FastAPI
* **Database Engine:** Async SQLAlchemy 2.0
* **Database Drivers:** `asyncpg` (PostgreSQL) / `aiosqlite` (SQLite)
* **Migrations:** Alembic
* **Validation & Settings:** Pydantic v2 & `pydantic-settings`
* **Authentication & Hashing:** Dual-token JWT (`pyjwt`), `pwdlib[argon2,bcrypt]`
* **Testing:** `pytest`, `pytest-asyncio`

### Frontend
* **Core:** React 19 + TypeScript
* **Styling:** Tailwind CSS + Lucide Icons
* **Networking:** Axios with automatic token refresh queue & memory token storage
* **Testing:** Jest + React Testing Library

---

## 🚀 Quick Start Guide (Step-by-Step)

Follow these steps in order to set up and run the entire application smoothly.

### Step 1: Clone Repository

```bash
git clone https://github.com/your-username/Book-Finder-App.git
cd Book-Finder-App
```

---

### Step 2: PostgreSQL Database Setup

Ensure your PostgreSQL service is running and create the `bookfinder_db` database:

#### Windows (PowerShell):
```powershell
# 1. Verify PostgreSQL service is running
Get-Service postgresql*

# 2. If stopped, start it
Start-Service postgresql-x64-18   # (replace 18 with your PostgreSQL version if different)

# 3. Create the database using psql
$env:PGPASSWORD="postgres"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h 127.0.0.1 -p 5432 -d postgres -c "CREATE DATABASE bookfinder_db;"
```

#### macOS / Linux:
```bash
# Start PostgreSQL service if needed
sudo systemctl start postgresql  # Linux
brew services start postgresql@16 # macOS

# Create the database
psql -U postgres -h localhost -c "CREATE DATABASE bookfinder_db;"
```

---

### Step 3: Backend Setup & Environment Variables

Navigate to the `backend` directory:

```bash
cd backend
```

Create your `.env` file from `.env.example`:

#### Windows (PowerShell):
```powershell
Copy-Item .env.example .env
```

#### macOS / Linux:
```bash
cp .env.example .env
```

#### Verify & Configure `.env`:
Ensure your `.env` contains valid configuration:

```env
# Application Settings
PROJECT_NAME="BiblioTrack API"
VERSION="0.1.0"
ENVIRONMENT="development"
API_V1_STR="/api/v1"

# Database Configuration (PostgreSQL Async connection)
DATABASE_URL="postgresql+asyncpg://postgres:postgres@127.0.0.1:5432/bookfinder_db"

# JWT Authentication
JWT_SECRET_KEY="generate-a-secure-random-256-bit-key-for-production-min-32-chars"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# OpenLibrary Configuration
OPENLIBRARY_BASE_URL="https://openlibrary.org"
OPENLIBRARY_COVERS_BASE_URL="https://covers.openlibrary.org"
OPENLIBRARY_TIMEOUT_SECONDS=10.0

# CORS Allowed Origins (Must be a JSON array list for pydantic-settings)
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

> ⚠️ **IMPORTANT NOTE ON CORS_ORIGINS:**
> `pydantic-settings` requires `CORS_ORIGINS` to be formatted as a valid JSON list (e.g. `["http://localhost:3000","http://127.0.0.1:3000"]`). Do not use comma-separated plain strings without brackets.

---

### Step 4: Install Dependencies & Drivers

Create and activate a Python virtual environment:

#### Windows (PowerShell):
```powershell
# Create virtual environment
python -m venv venv
# Note: If 'python' is not found, use: py -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Upgrade pip and install all required packages
py -m pip install --upgrade pip
py -m pip install -r requirements.txt
```

#### macOS / Linux:
```bash
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

---

### Step 5: Run Alembic Database Migrations

Apply all schema migrations up to `head`:

```bash
# 1. Check current migration state (should show nothing initially or current revision)
alembic current

# 2. Upgrade to the latest migration head
alembic upgrade head

# 3. Verify migration reached head (005)
alembic current
```

Expected output:
```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> 001, Create books table
INFO  [alembic.runtime.migration] Running upgrade 001 -> 002, Create users table
INFO  [alembic.runtime.migration] Running upgrade 002 -> 003, Create bookshelf_items table
INFO  [alembic.runtime.migration] Running upgrade 003 -> 004, Create reviews and reading_goals tables
INFO  [alembic.runtime.migration] Running upgrade 004 -> 005, Create social and recommendation tables
005 (head)
```

---

### Step 6: Start Backend Server

With your virtual environment activated, run:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

You will see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process using WatchFiles
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

---

### Step 7: Start Frontend Application

Open a new terminal window, navigate to the `book-finder` frontend directory, install dependencies, and launch:

```bash
cd book-finder
npm install
npm start
```

The browser will open automatically at: **`http://localhost:3000`**

---

## 📖 API Documentation

Once the backend server is running, explore the interactive documentation:
* **Interactive Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc Documentation:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
* **OpenAPI Schema (JSON):** [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json)

---

## 🧪 Running Tests & Build

### Backend Tests (Pytest)
```bash
# From the backend/ directory with venv activated:
pytest
```
*Result: 178 passing tests across all models, services, repositories, and REST APIs.*

### Frontend Tests (Jest)
```bash
# From the book-finder/ directory:
npm test -- --watchAll=false
```
*Result: 72 passing tests across all components and contexts.*

### TypeScript Compilation Check
```bash
# From the book-finder/ directory:
npx tsc --noEmit
```
*Result: 0 errors.*

### Frontend Production Build
```bash
# From the book-finder/ directory:
npm run build
```
*Result: Optimized, zero-warning production bundle in `book-finder/build/`.*

---

## 🛠️ Comprehensive Troubleshooting Runbook

Below is the complete troubleshooting guide for any errors encountered during setup.

---

### 1. `Cannot find path ... .env because it does not exist`
* **Symptom:**
  ```powershell
  Get-Content : Cannot find path 'D:\...\backend\.env' because it does not exist.
  ```
* **Cause:** The `.env` file has not been copied from `.env.example`.
* **Fix:**
  ```powershell
  Copy-Item .env.example .env
  ```

---

### 2. `pydantic_settings.exceptions.SettingsError: error parsing value for field "CORS_ORIGINS"`
* **Symptom:**
  ```
  json.decoder.JSONDecodeError: Expecting value: line 1 column 1 (char 0)
  pydantic_settings.exceptions.SettingsError: error parsing value for field "CORS_ORIGINS" from source "DotEnvSettingsSource"
  ```
* **Cause:** `CORS_ORIGINS` in `.env` is formatted as a comma-separated string (`"http://localhost:3000,http://127.0.0.1:3000"`) instead of a JSON list.
* **Fix:** In `backend/.env`, format `CORS_ORIGINS` as a JSON array:
  ```env
  CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
  ```

---

### 3. `ModuleNotFoundError: No module named 'asyncpg'`
* **Symptom:**
  ```
  ModuleNotFoundError: No module named 'asyncpg'
  ```
* **Cause:** The asynchronous PostgreSQL driver `asyncpg` is not installed in your Python environment.
* **Fix:**
  ```powershell
  py -m pip install asyncpg
  ```

---

### 4. `ModuleNotFoundError: No module named 'pwdlib'`
* **Symptom:**
  ```
  ModuleNotFoundError: No module named 'pwdlib'
  ```
* **Cause:** Cryptographic hashing library `pwdlib` with Argon2/Bcrypt support is missing.
* **Fix:**
  ```powershell
  py -m pip install "pwdlib[argon2,bcrypt]"
  ```

---

### 5. `The term 'python' is not recognized as the name of a cmdlet`
* **Symptom:**
  ```
  python : The term 'python' is not recognized as the name of a cmdlet...
  ```
* **Cause:** Python executable is not in Windows PATH or is registered as the Windows Python launcher `py`.
* **Fix:** Use the `py` launcher:
  ```powershell
  py -m venv venv
  py -m pip install -r requirements.txt
  ```

---

### 6. `asyncpg.exceptions.StringDataRightTruncationError: value too long for type character varying(32)`
* **Symptom:**
  ```
  sqlalchemy.exc.DBAPIError: (sqlalchemy.dialects.postgresql.asyncpg.Error) <class 'asyncpg.exceptions.StringDataRightTruncationError'>: value too long for type character varying(32)
  [SQL: UPDATE alembic_version SET version_num='004_create_reviews_and_goals_tables' WHERE alembic_version.version_num = '003_create_bookshelf_items_table']
  ```
* **Cause:** PostgreSQL's `alembic_version.version_num` column defaults to `VARCHAR(32)`. Revision strings longer than 32 characters exceed the column length.
* **Fix:**
  The migration revisions in `backend/alembic/versions/` use short revision identifiers:
  * `001` (Create books table)
  * `002` (Create users table)
  * `003` (Create bookshelf_items table)
  * `004` (Create reviews and reading_goals tables)
  * `005` (Create social and recommendation tables)

  Then run:
  ```powershell
  alembic upgrade head
  ```

---

### 7. `relation "alembic_version" does not exist`
* **Symptom:**
  ```
  ERROR: relation "alembic_version" does not exist
  ```
* **Cause:** No migrations have been run yet on the clean database.
* **Fix:** This is normal on a brand new database. Simply run:
  ```powershell
  alembic upgrade head
  ```
  Alembic will create the table and execute all 5 migrations automatically.

---

### 8. `CORS Error` in Browser Console when Frontend calls Backend
* **Symptom:**
  ```
  Access to XMLHttpRequest at 'http://127.0.0.1:8000/api/v1/...' from origin 'http://localhost:3000' has been blocked by CORS policy.
  ```
* **Cause:** Frontend port/domain mismatch with `CORS_ORIGINS`.
* **Fix:** Confirm `backend/.env` contains:
  ```env
  CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
  ```
  And restart the backend server.

---

### 9. Port Already in Use (`8000` or `3000`)
* **Fix on Windows:**
  ```powershell
  # Free port 8000
  Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force
  # Free port 3000
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
  ```
* **Fix on macOS / Linux:**
  ```bash
  lsof -ti:8000 | xargs kill -9
  lsof -ti:3000 | xargs kill -9
  ```

---

## 📜 License

This project is licensed under the MIT License.

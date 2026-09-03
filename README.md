# 📚 Book Finder App

> **A production-deployed full-stack book discovery and personal reading-management platform built with React, FastAPI, PostgreSQL, Docker, and AWS.**

Book Finder App is a full-stack web application for discovering books, viewing detailed book information, maintaining a personal bookshelf, tracking reading progress, and securely managing authenticated sessions.

The project goes beyond a simple book-search interface by implementing:

* Secure Google Identity Services authentication
* Backend Google ID-token verification
* JWT-based access and refresh-token architecture
* Rotating refresh tokens
* HttpOnly refresh-token cookies
* Memory-only access-token storage
* Persistent PostgreSQL storage
* Bookshelf synchronization
* Duplicate/conflict recovery
* Independent reading-progress management
* Responsive frontend behavior
* Automated backend and frontend testing
* TypeScript validation
* Dockerized backend deployment
* Amazon ECR and ECS/Fargate deployment
* Amazon RDS PostgreSQL
* AWS Secrets Manager
* Amazon S3 frontend hosting
* CloudWatch production monitoring

---

# ✨ Project Highlights

* 🔎 Book discovery and search
* 📖 Detailed book information
* 📚 Persistent personal bookshelf
* 📈 Reading-progress tracking
* 🔐 Google Identity Services authentication
* 🔑 JWT access-token and refresh-token architecture
* 🔄 Automatic access-token refresh
* 🍪 HttpOnly refresh-token cookies
* 🧠 Memory-only access-token storage
* 🔒 Gmail-domain authentication restriction
* 🗄️ PostgreSQL persistent database
* 🐳 Dockerized FastAPI backend
* ☁️ AWS ECS/Fargate production deployment
* 🛢️ AWS RDS PostgreSQL
* 🔐 AWS Secrets Manager
* 📦 Amazon ECR container registry
* 🌐 Amazon S3 static frontend hosting
* 📊 CloudWatch monitoring and logs
* 🧪 181 backend tests
* 🧪 93 frontend tests
* 📐 TypeScript validation with 0 errors
* 🔄 Bookshelf conflict/recovery handling
* 📊 Bookshelf state synchronization
* 📈 Independent reading-progress state
* 📱 Responsive/mobile sidebar behavior

---

# 🎯 Problem Statement

Many book-search applications stop after displaying search results.

Book Finder App is designed around a different idea:

> **Book discovery should naturally lead into personal reading management.**

Instead of treating a book as only a search result, the application allows a user to:

1. Discover a book.
2. Inspect its details.
3. Save the book to a personal bookshelf.
4. Track reading progress.
5. Return later and continue from the saved state.
6. Maintain persistent data through backend storage.
7. Restore authenticated sessions without storing long-lived access tokens in browser storage.

The application therefore combines:

```text
Book Discovery
      +
Book Details
      +
Personal Bookshelf
      +
Reading Progress
      +
Secure Authentication
      +
Persistent Database
```

---

# 🏗️ Architecture

```text
                         ┌───────────────────────┐
                         │         User          │
                         │      Web Browser      │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │    React Frontend     │
                         │                       │
                         │ • Search              │
                         │ • Book Details        │
                         │ • Bookshelf           │
                         │ • Reading Progress    │
                         │ • Authentication      │
                         │ • Session Handling    │
                         └───────────┬───────────┘
                                     │
                                     │ HTTPS / REST API
                                     ▼
                    ┌─────────────────────────────────┐
                    │        FastAPI Backend          │
                    │                                 │
                    │ • Authentication                │
                    │ • User Management               │
                    │ • Bookshelf APIs                │
                    │ • Reading Progress              │
                    │ • Book APIs                     │
                    │ • Token Management              │
                    │ • Validation                     │
                    └───────────────┬─────────────────┘
                                    │
                  ┌─────────────────┼─────────────────┐
                  │                 │                 │
                  ▼                 ▼                 ▼
          ┌───────────────┐ ┌──────────────┐ ┌────────────────┐
          │ PostgreSQL    │ │ Google       │ │ Open Library   │
          │ / AWS RDS     │ │ Identity     │ │ Book Data      │
          │               │ │ Services     │ │                │
          └───────────────┘ └──────────────┘ └────────────────┘

                    Production Infrastructure

          ┌──────────────┐     ┌──────────────┐
          │ Amazon ECS   │     │ Amazon S3    │
          │ / Fargate    │     │ Frontend     │
          │ Backend      │     │ Hosting      │
          └──────┬───────┘     └──────────────┘
                 │
                 ▼
          ┌──────────────┐
          │ Amazon RDS   │
          │ PostgreSQL   │
          └──────────────┘

                 │
                 ▼
       ┌──────────────────────┐
       │ AWS Secrets Manager  │
       │                      │
       │ • Database URL       │
       │ • JWT secret         │
       │ • SMTP credentials   │
       └──────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

| Technology                               | Purpose                          |
| ---------------------------------------- | -------------------------------- |
| React                                    | UI framework                     |
| TypeScript                               | Type safety                      |
| JavaScript                               | Application logic                |
| Tailwind CSS                             | Styling                          |
| Lucide Icons                             | UI icons                         |
| React Scripts / Create React App tooling | Development and production build |
| Axios                                    | Backend communication            |
| Google Identity Services                 | Google authentication            |
| Jest                                     | Frontend testing                 |
| React Testing Library                    | Component and behavior testing   |

---

## Backend

| Technology         | Purpose                                |
| ------------------ | -------------------------------------- |
| Python 3.12+       | Backend language                       |
| FastAPI            | REST API framework                     |
| SQLAlchemy 2.x     | ORM and database access                |
| PostgreSQL         | Primary persistent database            |
| asyncpg            | Asynchronous PostgreSQL driver         |
| SQLite / aiosqlite | Local or test support where configured |
| Pydantic v2        | Data validation                        |
| pydantic-settings  | Environment configuration              |
| Alembic            | Database migrations                    |
| Uvicorn            | ASGI server                            |
| PyJWT              | JWT creation and validation            |
| pwdlib             | Password hashing support               |
| google-auth        | Google ID-token verification           |
| Requests           | HTTP transport where required          |
| pytest             | Backend testing                        |
| pytest-asyncio     | Async test support                     |

---

## Infrastructure

| Technology          | Purpose                        |
| ------------------- | ------------------------------ |
| Docker              | Backend containerization       |
| Amazon ECR          | Docker image registry          |
| Amazon ECS          | Backend deployment             |
| AWS Fargate         | Container runtime              |
| Amazon RDS          | PostgreSQL database            |
| AWS Secrets Manager | Production secret storage      |
| Amazon S3           | Frontend static hosting        |
| CloudWatch          | Production logs and monitoring |
| Git                 | Source control                 |
| GitHub              | Repository and collaboration   |

---

# 📁 Project Structure

```text
Book-Finder-App/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       └── endpoints/
│   │   │           └── auth.py
│   │   │
│   │   ├── core/
│   │   │   └── config.py
│   │   │
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   └── auth_service.py
│   │   ├── repositories/
│   │   └── main.py
│   │
│   ├── alembic/
│   │   ├── versions/
│   │   └── ...
│   │
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env.example
│
├── book-finder/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── bookshelf/
│   │   │   ├── layout/
│   │   │   ├── BookCard.tsx
│   │   │   └── BookDetailModal.tsx
│   │   │
│   │   ├── context/
│   │   │   ├── BookshelfContext.tsx
│   │   │   └── ReadingProgressContext.tsx
│   │   │
│   │   ├── services/
│   │   ├── api/
│   │   └── App.tsx
│   │
│   ├── public/
│   ├── package.json
│   └── .env.example
│
├── pytest.ini
├── README.md
└── ...
```

---

# 🔐 Authentication Architecture

Authentication is one of the major engineering components of the application.

The application uses **Google Identity Services (GSI)** for Google authentication.

The backend does not treat a Google OAuth access token as the application's login credential.

Instead, the frontend receives a Google ID token and sends it to the backend for verification.

---

## Google Login Flow

```text
User
 │
 │ Click "Continue with Google"
 ▼
Google Identity Services
 │
 │ Google ID Token
 ▼
React Frontend
 │
 │ response.credential
 ▼
FastAPI Backend
 │
 │ Verify ID Token
 ▼
Google Token Verification
 │
 ├── Signature
 ├── Issuer
 ├── Audience
 ├── Expiration
 ├── Subject
 └── Gmail-domain validation
 │
 ▼
Application User
 │
 ▼
Application Access Token
+
Application Refresh Token
```

---

## Important Authentication Design Decision

During development, the frontend previously contained an OAuth access-token fallback.

That flow could return:

```text
access_token
```

and incorrectly pass it as:

```text
credential
```

to the backend.

The fallback was removed.

The final implementation uses:

```text
Google Identity Services
        ↓
Google ID Token
        ↓
Backend verification
        ↓
Application session
```

The backend therefore verifies the Google ID token before creating or authenticating the application user.

---

# 🔎 Google ID-Token Verification

The backend validates important Google token properties including:

* Token signature
* Token issuer
* Token audience
* Token expiration
* Token subject
* Gmail-domain restriction
* Required identity information

Invalid authentication attempts are rejected rather than being accepted as application sessions.

---

# 🔑 Session Management

The application uses a two-token session architecture.

```text
                 User Session
                      │
             ┌────────┴────────┐
             │                 │
             ▼                 ▼
       Access Token      Refresh Token
             │                 │
             ▼                 ▼
       Memory only       HttpOnly Cookie
```

---

## Access Token

The access token is:

* Short-lived
* Configured for a 15-minute lifetime
* Stored only in frontend memory
* Not stored in `localStorage`
* Not stored in `sessionStorage`
* Used for authenticated API requests

---

## Refresh Token

The refresh token is:

* Configured for a 7-day lifetime
* Stored in an HttpOnly cookie
* Inaccessible to normal JavaScript
* Restricted to the authentication path
* Rotated during refresh
* Configured with secure production cookie settings

Production cookie behavior uses:

```text
SameSite=None
Secure=True
HttpOnly=True
```

where required by the deployed frontend/backend architecture.

---

# 🔄 Refresh Token Rotation

The refresh flow is designed around token rotation.

```text
Access Token Expires
        │
        ▼
Frontend detects expired session
        │
        ▼
POST /api/v1/auth/refresh
        │
        ▼
HttpOnly Refresh Cookie
        │
        ▼
Backend validates refresh token
        │
        ├── Signature
        ├── Token type
        ├── Expiration
        └── User token version
        │
        ▼
Refresh token rotated
        │
        ├── New access token
        └── New refresh token
        │
        ▼
Frontend continues session
```

---

## Frontend Refresh Behavior

The frontend supports:

* Mount-time session restoration
* Reactive refresh after a `401`
* Request retry after successful refresh
* Refresh coordination for concurrent requests
* Session clearing after logout

A refresh queue prevents multiple simultaneous failed requests from independently performing unnecessary refresh operations within the same browser tab.

---

# 🚪 Logout and Session Revocation

Logout is not limited to deleting the frontend access token.

The backend participates in session revocation.

```text
Logout
  │
  ▼
Backend
  │
  ├── Invalidate active session state
  ├── Increment user token version
  └── Clear refresh cookie
  │
  ▼
Frontend
  │
  └── Clear in-memory access token
```

Changing the user's token version prevents previously issued refresh tokens from continuing to establish valid sessions.

---

# 📚 Bookshelf System

The bookshelf is persistent backend data rather than temporary frontend-only state.

Users can:

* Add books
* Remove books
* View saved books
* Synchronize bookshelf state
* Continue using their bookshelf after authentication restoration
* Maintain bookshelf data across browser sessions

The frontend uses dedicated bookshelf state management so that components do not independently maintain conflicting copies of bookshelf data.

---

# ⚔️ Duplicate and Conflict Handling

The application explicitly handles backend conflict responses.

For example:

```text
HTTP 409 Conflict
```

can occur when a bookshelf operation attempts to add an item that already exists.

Instead of leaving the frontend in an inconsistent state, the application can synchronize bookshelf data with the backend.

```text
Frontend Action
      │
      ▼
Backend
      │
      ▼
409 Conflict
      │
      ▼
Frontend detects conflict
      │
      ▼
Synchronize bookshelf
      │
      ▼
UI reflects backend state
```

This provides better resilience when:

* A book already exists
* Duplicate actions occur
* Multiple requests target the same book
* Client state becomes stale
* Backend state changes independently

---

# 📈 Reading Progress

Reading progress is intentionally separated from bookshelf membership.

The two concepts have different responsibilities:

```text
Bookshelf
   │
   └── Is this book saved by the user?

Reading Progress
   │
   └── How far has the user progressed?
```

This prevents reading-progress operations from unintentionally creating bookshelf entries.

The separation also makes the application state model easier to reason about.

---

# 🔄 Bookshelf Synchronization

The bookshelf performs synchronization with the backend when appropriate.

This helps handle situations where:

* Backend data is newer than frontend state
* The user returns to the bookshelf
* Authentication has just been restored
* Another operation modified the bookshelf
* A conflict response indicates stale client state

The backend is treated as the persistent source of truth.

```text
Backend
   │
   │ Persistent State
   ▼
Frontend Synchronization
   │
   ▼
React State
   │
   ▼
UI
```

---

# 📖 Book Discovery

The primary user workflow is:

```text
Search
  ↓
Book Results
  ↓
Book Card
  ↓
Book Details
  ↓
Save to Bookshelf
  ↓
Track Reading Progress
```

The application integrates external book information through Open Library services.

Book discovery is therefore connected directly to the user's personal reading workflow.

---

# 📱 Responsive UI

The frontend includes responsive behavior for smaller screens.

The mobile sidebar includes:

* Mobile menu handling
* Backdrop handling
* Correct stacking/z-index behavior
* Close-button visibility
* Dedicated component tests

This prevents navigation elements and overlays from appearing behind other interface layers.

---

# 🧪 Testing

Automated testing is a major part of the project.

The final validation includes both backend and frontend test suites.

---

## Backend Tests

Current verified result:

```text
181 passed
0 failures
0 errors
```

The backend tests cover areas including:

* Authentication
* Google authentication
* Token behavior
* API behavior
* Security validation
* Database-related functionality
* Service logic
* Error handling
* Authentication edge cases

Run the backend tests from the repository root:

```powershell
.\backend\venv\Scripts\pytest.exe -q
```

---

## Frontend Tests

Current verified result:

```text
32 test suites
93 tests passed
0 failures
```

The frontend tests cover areas including:

* Authentication UI
* Bookshelf behavior
* Reading progress
* Sidebar behavior
* State synchronization
* Conflict recovery
* Component behavior
* Context behavior

Run:

```bash
cd book-finder
npm test -- --watchAll=false
```

---

# 📐 TypeScript Validation

The frontend is validated using TypeScript.

Run:

```bash
cd book-finder
npx tsc --noEmit
```

Current verified result:

```text
0 errors
```

TypeScript validation helps identify:

* Invalid component props
* Incorrect state types
* Context typing issues
* API typing issues
* Component integration problems

---

# 📦 Production Frontend Build

The frontend produces a production build successfully.

Run:

```bash
cd book-finder
npm run build
```

The production build generates optimized static assets under:

```text
book-finder/build/
```

The validated production build was successfully deployed to Amazon S3.

---

# 🐳 Docker

The FastAPI backend is containerized for production deployment.

The Docker image:

* Uses Python 3.12
* Installs backend dependencies
* Copies application source
* Exposes port `8080`
* Starts FastAPI through Uvicorn

Production runtime command:

```text
uvicorn app.main:app --host 0.0.0.0 --port 8080
```

---

# 🛡️ Docker Security

The project uses `.dockerignore` to prevent unnecessary and sensitive development files from entering the production container.

Important excluded content includes:

```text
.env
.env.*
venv/
.venv/
tests/
.pytest_cache/
.git/
```

The production image was verified to avoid including:

* `.env` secrets
* Local virtual environments
* Test suites
* Private keys
* Authentication diagnostic logging

This reduces the amount of unnecessary development content shipped into production.

---

# ☁️ AWS Production Architecture

The production backend is deployed using Amazon ECS/Fargate.

```text
                    Internet
                       │
                       ▼
              ┌─────────────────┐
              │   ECS Service   │
              │                 │
              │ book-finder-    │
              │ backend         │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ FastAPI Docker  │
              │ Container       │
              │ Port 8080       │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Amazon RDS      │
              │ PostgreSQL      │
              └─────────────────┘

                       ▲
                       │
              ┌─────────────────┐
              │ AWS Secrets     │
              │ Manager         │
              └─────────────────┘
```

---

# ☁️ Production Components

## Amazon ECR

Amazon ECR stores the production Docker image used by ECS.

```text
Source Code
    ↓
Docker Build
    ↓
Amazon ECR
    ↓
Amazon ECS
```

---

## Amazon ECS / Fargate

The backend runs as a containerized FastAPI application using ECS/Fargate.

This removes the need to manually manage a server operating system for the application container.

---

## Amazon RDS

PostgreSQL persistence is provided through Amazon RDS.

The production database stores persistent application data such as:

* Users
* Authentication/session state
* Bookshelf relationships
* Reading-related data
* Other backend application data

---

## Amazon S3

The React production build is deployed as static frontend assets to Amazon S3.

```text
React Source
     ↓
npm run build
     ↓
build/
     ↓
Amazon S3
     ↓
Browser
```

The current S3 website hosting configuration is separate from the HTTPS backend.

A future CloudFront/custom-domain setup can provide a more complete HTTPS frontend deployment.

---

## AWS Secrets Manager

Production secrets are stored outside the Git repository.

Examples include:

```text
DATABASE_URL
JWT_SECRET_KEY
SMTP_PASSWORD
```

The ECS task receives the required production secrets through AWS configuration rather than embedding them into the Docker image or Git repository.

---

## CloudWatch

CloudWatch is used for production log and operational monitoring.

Production verification included checking for:

* Startup errors
* HTTP 500 errors
* Authentication errors
* Unexpected authentication/token logging

---

# 🗄️ Database and Migrations

PostgreSQL is the primary production database.

Database schema changes are managed through Alembic.

To check the current migration:

```bash
alembic current
```

To upgrade the database:

```bash
alembic upgrade head
```

To verify the resulting revision:

```bash
alembic current
```

The README intentionally does not hardcode an old migration number as the permanent "head".

The correct migration head is always the revision returned by:

```bash
alembic upgrade head
```

This keeps the documentation valid as future migrations are added.

---

# 🔐 Production Secrets

Production secrets must never be committed to Git.

Development configuration uses:

```text
.env
```

Production configuration uses:

```text
AWS Secrets Manager
```

The frontend must never contain private backend credentials.

Browser-visible configuration should be limited to values that are intentionally public, such as:

* API endpoint configuration
* Google public client identifier
* Other non-sensitive frontend configuration

---

# 🔒 CORS and Cookie Configuration

Cross-origin behavior is configurable through backend settings.

Relevant configuration includes:

```text
CORS_ORIGINS
COOKIE_SAMESITE
COOKIE_SECURE
```

The production authentication architecture requires secure cookie behavior appropriate for the deployed frontend/backend origin relationship.

The refresh token remains:

```text
HttpOnly
Secure
SameSite=None
```

in the production configuration.

---

# ❤️ Health Check

The backend exposes:

```text
GET /api/v1/health
```

The health endpoint provides an operational check for:

* API availability
* Environment
* Application version
* Database connectivity

A healthy production response follows the structure:

```json
{
  "status": "ok",
  "environment": "production",
  "version": "0.1.0",
  "database": "connected"
}
```

---

# 📊 Production Deployment Verification

The final production backend was deployed using a clean, verified Docker image.

Verified production state:

```text
ECS Task Definition:     default-book-finder-backend:17
Desired Tasks:           1
Running Tasks:           1
Pending Tasks:            0
Rollout:                  COMPLETED

Health:                   HTTP 200
Database:                 Connected

Startup Errors:           0
HTTP 500 Errors:          0
Authentication Errors:    0
Token Logging:            None
```

The production container was verified after deployment.

---

# 🌐 API

The backend API is versioned under:

```text
/api/v1
```

The main health endpoint is:

```text
GET /api/v1/health
```

Authentication functionality includes endpoints for concepts such as:

```text
Google authentication
Login
Refresh
Logout
```

FastAPI provides interactive API documentation.

---

## Swagger UI

For local development:

```text
http://127.0.0.1:8080/docs
```

---

## ReDoc

```text
http://127.0.0.1:8080/redoc
```

---

## OpenAPI Schema

```text
http://127.0.0.1:8080/openapi.json
```

---

# ⚙️ Local Development

## Prerequisites

Install:

* Python 3.12+
* Node.js
* npm
* Git
* PostgreSQL for a local PostgreSQL environment
* Docker if testing the backend container locally

---

# 📥 Clone the Repository

Clone the repository and enter the project directory:

```bash
git clone <repository-url>
cd Book-Finder-App
```

---

# 🐘 PostgreSQL Setup

Create a local PostgreSQL database for development.

Example database:

```text
bookfinder_db
```

Example local connection format:

```text
postgresql+asyncpg://postgres:<password>@127.0.0.1:5432/bookfinder_db
```

Do not commit the actual password.

---

# 🐍 Backend Setup

Move into the backend directory:

```bash
cd backend
```

Create a virtual environment.

### Windows

```powershell
python -m venv venv
```

If `python` is not available:

```powershell
py -m venv venv
```

Activate:

```powershell
.\venv\Scripts\Activate.ps1
```

---

## Install Backend Dependencies

```powershell
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

If using the Python launcher:

```powershell
py -m pip install --upgrade pip
py -m pip install -r requirements.txt
```

---

# 🔧 Backend Environment Configuration

Create the local environment file:

```powershell
Copy-Item .env.example .env
```

Configure local development values in `.env`.

Example structure:

```env
PROJECT_NAME="BiblioTrack API"
VERSION="0.1.0"
ENVIRONMENT="development"
API_V1_STR="/api/v1"

DATABASE_URL="postgresql+asyncpg://postgres:<password>@127.0.0.1:5432/bookfinder_db"

JWT_SECRET_KEY="<local-development-secret>"
JWT_ALGORITHM="HS256"

ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

OPENLIBRARY_BASE_URL="https://openlibrary.org"
OPENLIBRARY_COVERS_BASE_URL="https://covers.openlibrary.org"
OPENLIBRARY_TIMEOUT_SECONDS=10.0

CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

For local Google authentication, configure the required public Google client configuration according to the project's environment setup.

Never commit `.env`.

---

# ⚠️ CORS Configuration

`CORS_ORIGINS` must be provided as a valid JSON list when using the Pydantic settings configuration.

Correct:

```env
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

Incorrect:

```env
CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
```

If CORS configuration changes, restart the backend.

---

# 🗃️ Run Database Migrations

From the backend directory:

```bash
alembic current
```

Then:

```bash
alembic upgrade head
```

Verify:

```bash
alembic current
```

The database should now be at the latest migration head.

---

# ▶️ Start the Backend

For local development:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

The backend will be available at:

```text
http://127.0.0.1:8080
```

Health endpoint:

```text
http://127.0.0.1:8080/api/v1/health
```

Swagger:

```text
http://127.0.0.1:8080/docs
```

---

# ⚛️ Frontend Setup

Open a new terminal.

From the repository root:

```bash
cd book-finder
```

Install dependencies:

```bash
npm install
```

Create the frontend environment file from the example configuration if required:

```text
.env.example → .env
```

Configure:

```text
API base URL
Google public client configuration
```

Do not place:

```text
JWT secrets
Database passwords
SMTP passwords
Private backend credentials
```

in the frontend environment.

---

# ▶️ Start the Frontend

Run:

```bash
npm start
```

The development frontend normally runs on:

```text
http://localhost:3000
```

The frontend communicates with the FastAPI backend through the configured API base URL.

---

# 🧪 Running the Complete Test Suite

## Backend

From the repository root:

```powershell
.\backend\venv\Scripts\pytest.exe -q
```

Expected current result:

```text
181 passed
```

---

## Frontend

```bash
cd book-finder
npm test -- --watchAll=false
```

Expected current result:

```text
32 test suites
93 tests passed
```

---

## TypeScript

```bash
cd book-finder
npx tsc --noEmit
```

Expected:

```text
0 errors
```

---

## Production Build

```bash
cd book-finder
npm run build
```

Expected:

```text
Compiled successfully
```

---

# 🔄 Development and Validation Workflow

The project follows a validation-first development workflow.

```text
Feature / Bug
      │
      ▼
Implementation
      │
      ▼
Unit Tests
      │
      ▼
TypeScript Check
      │
      ▼
Production Build
      │
      ▼
Security Review
      │
      ▼
Docker Verification
      │
      ▼
AWS Deployment
      │
      ▼
Production Smoke Test
      │
      ▼
Git Commit
      │
      ▼
GitHub
```

This workflow was particularly important during the authentication debugging and production deployment process.

---

# 🐛 Major Problems Solved

## 1. Google Access Token vs ID Token

### Problem

The frontend authentication fallback was sending a Google OAuth access token to the backend where a Google ID token was expected.

### Root Cause

The OAuth callback returned:

```text
access_token
```

and the value was incorrectly passed as:

```text
credential
```

### Solution

The OAuth access-token fallback was removed.

The application now uses the Google Identity Services credential response:

```text
response.credential
```

which contains the Google ID token.

### Result

* Correct token type
* Backend ID-token verification
* No OAuth access-token fallback
* Authentication tests passing
* Clear separation between Google authentication and application session tokens

---

# 🐛 2. Production Authentication Debugging

During production diagnosis, temporary diagnostic logging was introduced to identify the authentication failure.

The diagnostic logging was intentionally temporary.

The process was:

```text
Authentication failure
        ↓
Temporary diagnostic instrumentation
        ↓
Production log inspection
        ↓
Root cause identified
        ↓
Diagnostic logging removed
        ↓
Clean production image
        ↓
Deployment verification
```

The final production image contains no permanent authentication credential logging.

This demonstrates an important engineering principle:

> **Diagnostic code should not become permanent production behavior.**

---

# 🐛 3. Bookshelf Duplicate State

### Problem

A duplicate bookshelf operation could return:

```text
HTTP 409 Conflict
```

while the frontend state did not necessarily match backend state.

### Solution

The frontend handles duplicate conflicts by synchronizing bookshelf state with the backend.

### Result

The UI can recover instead of remaining in an inconsistent state.

---

# 🐛 4. Reading Progress Coupling

### Problem

Reading-progress behavior could unintentionally trigger bookshelf creation.

### Solution

Reading progress was decoupled from bookshelf creation.

### Result

The two concepts now have independent responsibilities.

---

# 🐛 5. Mobile Sidebar Layering

### Problem

The mobile sidebar/backdrop could have incorrect stacking behavior.

### Solution

The mobile menu layering, backdrop behavior, and close-button visibility were corrected.

Dedicated tests were added.

---

# 🐛 6. Session Restoration

### Problem

The application needs to restore a user's authenticated session after a page reload without storing long-lived access tokens in browser storage.

### Solution

The frontend performs session restoration using the HttpOnly refresh-token cookie.

```text
Browser Reload
      │
      ▼
Frontend Startup
      │
      ▼
Refresh Request
      │
      ▼
HttpOnly Cookie
      │
      ▼
Backend Validation
      │
      ▼
New Access Token
      │
      ▼
Authenticated Frontend
```

This preserves memory-only access-token storage while maintaining a usable session.

---

# 🔐 Security Principles

The application follows several security-conscious design principles.

---

## Authentication

* Google ID tokens are verified by the backend.
* Token issuer is validated.
* Token audience is validated.
* Token expiration is validated.
* Google subject identity is validated.
* Gmail-domain restrictions are enforced.
* Invalid authentication attempts are rejected.
* Google OAuth access tokens are not treated as application ID tokens.

---

## Token Storage

```text
Access Token
    ↓
Memory only

Refresh Token
    ↓
HttpOnly Cookie
```

The application intentionally avoids storing access tokens in:

```text
localStorage
sessionStorage
```

---

## Refresh Tokens

Refresh tokens:

* Are HttpOnly
* Are rotated
* Are short-lived relative to permanent credentials
* Use secure production cookie configuration
* Participate in session revocation

---

## Secrets

Development:

```text
.env
```

Production:

```text
AWS Secrets Manager
```

Secrets are not committed to Git.

---

## Docker

Sensitive development files are excluded from the production image using `.dockerignore`.

---

## Diagnostic Logging

Authentication credentials and sensitive tokens are not permanently logged.

Temporary diagnostic logging used during debugging was removed before final production deployment.

---

# 📊 Current Verification Status

| Validation                         |         Result |
| ---------------------------------- | -------------: |
| Backend tests                      |      ✅ 181/181 |
| Frontend tests                     |        ✅ 93/93 |
| Frontend test suites               |        ✅ 32/32 |
| TypeScript                         |     ✅ 0 errors |
| Production frontend build          |       ✅ Passed |
| Docker build                       |       ✅ Passed |
| Container import verification      |       ✅ Passed |
| Google authentication dependencies |       ✅ Passed |
| Diagnostic authentication logging  |      ✅ Removed |
| Production health                  |     ✅ HTTP 200 |
| Production database                |    ✅ Connected |
| ECS rollout                        |    ✅ Completed |
| Running ECS tasks                  |          ✅ 1/1 |
| Git working tree                   |        ✅ Clean |
| GitHub main branch                 | ✅ Synchronized |

---

# 🚀 Deployment Model

The application consists of separately deployable frontend and backend components.

---

## Frontend Deployment

```text
React Source
      ↓
Production Build
      ↓
build/
      ↓
Amazon S3
      ↓
Static Web Hosting
      ↓
Browser
```

---

## Backend Deployment

```text
FastAPI Source
      ↓
Docker Build
      ↓
Amazon ECR
      ↓
Amazon ECS / Fargate
      ↓
FastAPI Container
      ↓
Amazon RDS PostgreSQL
```

---

## Configuration and Secrets

```text
AWS Secrets Manager
        │
        ▼
ECS Task
        │
        ▼
FastAPI Application
```

This separation allows the frontend and backend to be deployed independently.

---

# 🧭 Production Request Flow

A typical authenticated request follows this architecture:

```text
Browser
   │
   │ Access Token
   ▼
FastAPI
   │
   │ Validate JWT
   ▼
Application Endpoint
   │
   ▼
Service Layer
   │
   ▼
SQLAlchemy
   │
   ▼
PostgreSQL / RDS
```

When the access token expires:

```text
API Request
   │
   ▼
401 Unauthorized
   │
   ▼
Refresh Endpoint
   │
   ▼
HttpOnly Refresh Cookie
   │
   ▼
Token Rotation
   │
   ▼
New Access Token
   │
   ▼
Retry Original Request
```

---

# 🧩 Application State Architecture

The frontend separates responsibilities between different state domains.

```text
React Application
       │
       ├── Authentication State
       │
       ├── Bookshelf State
       │
       ├── Reading Progress State
       │
       └── UI / Navigation State
```

This reduces unnecessary coupling between unrelated application features.

---

# 📚 Book Discovery Workflow

```text
User Search
     │
     ▼
Open Library Search
     │
     ▼
Search Results
     │
     ▼
Book Card
     │
     ▼
Book Details
     │
     ├───────────────┐
     ▼               ▼
Save Book       View Details
     │
     ▼
Bookshelf
     │
     ▼
Reading Progress
```

This creates a continuous workflow from discovery to personal reading management.

---

# 🧪 Authentication Verification

The authentication implementation was manually verified through several scenarios.

Verified scenarios included:

1. Google login
2. Existing Google user login
3. Session refresh while logged in
4. Browser/tab session restoration
5. Logout
6. Logged-out bookshelf action
7. Invalid password rejection
8. Non-existent email rejection
9. Google logout followed by Google login

These tests were performed in addition to automated authentication/security tests.

---

# 🔄 Session Lifecycle

```text
Google Login
     │
     ▼
Google ID Token Verification
     │
     ▼
Application Session Created
     │
     ├───────────────┐
     ▼               ▼
Access Token     Refresh Token
Memory            HttpOnly Cookie
     │               │
     │               │
     └───────┬───────┘
             ▼
       Authenticated
          Session
             │
             ▼
      Access Expiration
             │
             ▼
       Refresh Rotation
             │
             ▼
       New Access Token
             │
             ▼
      Continue Session
             │
             ▼
           Logout
             │
             ▼
       Session Revoked
```

---

# 🛠️ Troubleshooting Runbook

## 1. `.env` File Does Not Exist

### Symptom

```text
Cannot find path ... .env because it does not exist
```

### Cause

The local `.env` file has not been created.

### Fix

From the backend directory:

```powershell
Copy-Item .env.example .env
```

Then configure the local values.

---

# 2. CORS Configuration Error

### Symptom

```text
SettingsError: error parsing value for field "CORS_ORIGINS"
```

### Cause

`CORS_ORIGINS` is not formatted as a JSON array.

### Correct

```env
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

### Incorrect

```env
CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
```

After correcting the environment file, restart the backend.

---

# 3. `ModuleNotFoundError: No module named 'asyncpg'`

### Cause

The PostgreSQL asynchronous driver is missing.

### Fix

Prefer installing all project dependencies:

```powershell
python -m pip install -r requirements.txt
```

If necessary:

```powershell
python -m pip install asyncpg
```

---

# 4. `ModuleNotFoundError: No module named 'pwdlib'`

### Cause

The password hashing dependency is missing.

### Fix

Install project dependencies:

```powershell
python -m pip install -r requirements.txt
```

If necessary:

```powershell
python -m pip install "pwdlib[argon2,bcrypt]"
```

---

# 5. `python` Is Not Recognized

### Symptom

```text
python : The term 'python' is not recognized...
```

### Cause

Python may not be available through the `python` command.

### Fix

Use the Windows Python launcher:

```powershell
py -m venv venv
py -m pip install -r requirements.txt
```

---

# 6. Alembic Database Errors

### Symptom

The database schema is missing or migrations are incomplete.

### Fix

From the backend directory:

```powershell
alembic current
```

Then:

```powershell
alembic upgrade head
```

Finally:

```powershell
alembic current
```

The application should be running against the latest migration head.

---

# 7. `relation "alembic_version" does not exist`

### Cause

The database has not yet been initialized through Alembic.

### Fix

Run:

```powershell
alembic upgrade head
```

Alembic will create its migration tracking table and apply the required migrations.

---

# 8. CORS Error in Browser

### Symptom

The browser reports a CORS policy error when the frontend calls the backend.

### Check

Verify that the frontend origin is included in:

```env
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

Also verify that the frontend is calling the correct backend API URL.

Restart the backend after configuration changes.

---

# 9. Port Already in Use

## Windows

To identify a process using port `8080`:

```powershell
Get-NetTCPConnection -LocalPort 8080
```

To identify a process using port `3000`:

```powershell
Get-NetTCPConnection -LocalPort 3000
```

Then terminate the appropriate process if necessary.

Use caution when terminating processes and verify the process ID before stopping it.

---

# 10. Backend Starts but Frontend Cannot Connect

Check the following:

```text
1. Backend is running
2. Backend health endpoint returns HTTP 200
3. Frontend API base URL is correct
4. CORS_ORIGINS includes frontend origin
5. PostgreSQL is reachable
6. Database migrations are complete
```

Test the backend health endpoint:

```text
http://127.0.0.1:8080/api/v1/health
```

---

# 11. Google Authentication Fails

Check:

```text
1. Google Identity Services is loading
2. Correct Google client ID is configured
3. Frontend is using response.credential
4. Backend Google token verification is enabled
5. Backend audience matches the configured Google client ID
6. Token has not expired
7. Gmail-domain restriction is satisfied
8. Backend is reachable
9. CORS configuration is correct
```

The application must send the Google ID token rather than an OAuth access token.

---

# 12. Session Disappears After Refresh

Check:

```text
1. Refresh cookie is being set
2. Browser allows the configured cookie attributes
3. Frontend sends credentials
4. /api/v1/auth/refresh is reachable
5. Backend accepts the refresh token
6. Token version is valid
7. Refresh-token rotation succeeds
```

The frontend should not attempt to read the refresh token directly because it is intentionally HttpOnly.

---

# 13. Bookshelf Shows Stale Data

The application is designed to synchronize bookshelf state with the backend.

Check:

```text
1. User is authenticated
2. Bookshelf API request succeeds
3. Backend database contains the expected item
4. Frontend synchronization completed
5. No HTTP 409 conflict was left unresolved
```

Refreshing/synchronizing the bookshelf should restore backend state.

---

# 🏆 What Makes This Project Different

This project should not be described simply as:

> "A React book search application."

Its stronger engineering story is:

---

## 1. Full-Stack Architecture

```text
React
  +
FastAPI
  +
PostgreSQL
  +
Docker
  +
AWS
```

---

## 2. Real Authentication Architecture

The project implements:

```text
Google Identity Services
        +
Google ID-token verification
        +
JWT access tokens
        +
Rotating refresh tokens
        +
HttpOnly cookies
        +
Memory-only access tokens
        +
Session revocation
```

---

## 3. Persistent User Data

Bookshelf and reading-progress data are backed by persistent backend storage rather than relying exclusively on browser state.

---

## 4. State Consistency

The frontend does not simply assume that every API request succeeds.

It handles:

```text
409 Conflict
     ↓
State Synchronization
     ↓
Backend Source of Truth
```

This demonstrates consideration for real-world distributed application state.

---

## 5. Separation of Responsibilities

Bookshelf membership and reading progress are separate concepts.

```text
Bookshelf
    ↓
Saved or not saved

Reading Progress
    ↓
Current reading position
```

This prevents unrelated operations from unintentionally modifying each other.

---

## 6. Production Deployment

The project is deployed beyond localhost using:

```text
Docker
   +
Amazon ECR
   +
Amazon ECS / Fargate
   +
Amazon RDS PostgreSQL
   +
AWS Secrets Manager
   +
Amazon S3
   +
CloudWatch
```

---

## 7. Automated Testing

The project currently has:

```text
181 backend tests
93 frontend tests
32 frontend test suites
0 TypeScript errors
```

---

## 8. Security-Conscious Design

The application deliberately avoids:

```text
❌ Access tokens in localStorage

❌ Access tokens in sessionStorage

❌ Refresh tokens exposed to JavaScript

❌ OAuth access tokens treated as ID tokens

❌ Production secrets inside Docker images

❌ Production secrets committed to Git

❌ Permanent authentication diagnostic logging
```

---

# 📊 Engineering Metrics

| Area                 | Current Status |
| -------------------- | -------------: |
| Backend tests        |            181 |
| Frontend tests       |             93 |
| Frontend test suites |             32 |
| TypeScript errors    |              0 |
| Production build     |         Passed |
| Docker build         |         Passed |
| Production health    |       HTTP 200 |
| Production database  |      Connected |
| ECS running tasks    |              1 |
| ECS desired tasks    |              1 |
| ECS rollout          |      Completed |

---

# 🧭 Development Roadmap

The project evolved through multiple stages.

```text
Phase 1
Book Discovery
      ↓
Phase 2
Authentication
      ↓
Phase 3
Persistent Bookshelf
      ↓
Phase 4
Reading Progress
      ↓
Phase 5
State Synchronization
      ↓
Phase 6
Security Hardening
      ↓
Phase 7
Automated Testing
      ↓
Phase 8
Dockerization
      ↓
Phase 9
AWS Deployment
      ↓
Phase 10
Production Verification
```

---

# 📈 Future Improvements

The following are potential future enhancements and are **not currently claimed as implemented**.

## User Experience

* Advanced book filtering
* Search history
* Reading statistics dashboard
* Recently viewed books
* Favorite authors
* Reading streaks
* More detailed reading analytics

---

## Backend

* Redis caching
* Background jobs
* WebSockets
* Rate limiting
* More granular API permissions
* Advanced observability
* Improved API performance monitoring

---

## Infrastructure

* HTTPS/custom domain for frontend
* CloudFront CDN
* Automated CI/CD pipeline
* Infrastructure as Code
* Automated database backup/restore testing
* Automated security scanning
* Production autoscaling improvements

---

## Authentication

* Additional identity providers
* Account recovery
* Multi-factor authentication
* Improved multi-device session management
* Dedicated session-management UI

---

# 🧑‍💻 Engineering Lessons

This project provided practical experience with:

* React component architecture
* React Context state management
* TypeScript
* JavaScript
* REST API design
* FastAPI
* Python
* PostgreSQL
* SQLAlchemy
* Alembic
* Google Identity Services
* JWT authentication
* Refresh-token rotation
* HttpOnly cookies
* Authentication security
* Session management
* State synchronization
* Conflict recovery
* Docker
* Amazon ECS
* AWS Fargate
* Amazon ECR
* Amazon RDS
* Amazon S3
* AWS Secrets Manager
* CloudWatch
* Automated testing
* Production debugging
* Git
* GitHub
* Cloud deployment
* Security-conscious application design

---

# 🔬 Production Debugging Lessons

The project also provided practical experience in diagnosing production issues.

A major example was the Google authentication failure.

The debugging process demonstrated:

```text
Production Failure
       ↓
Observe HTTP behavior
       ↓
Inspect backend logs
       ↓
Identify token mismatch
       ↓
Trace frontend authentication flow
       ↓
Find access-token fallback
       ↓
Remove incorrect flow
       ↓
Run automated tests
       ↓
Build clean Docker image
       ↓
Deploy
       ↓
Verify production
```

This was an important transition from simply writing application code to understanding how an application behaves in production.

---

# 🛡️ Production Engineering Principles

The project follows several practical engineering principles:

### Backend as Source of Truth

Persistent user data is ultimately managed by the backend/database rather than relying only on client state.

### Short-Lived Access Tokens

Access tokens have a short lifetime to reduce exposure.

### HttpOnly Refresh Tokens

Refresh tokens are protected from direct JavaScript access.

### Refresh Rotation

Refresh tokens are rotated rather than reused indefinitely.

### Explicit Session Revocation

Logout invalidates the user's existing session state.

### Temporary Diagnostics

Production diagnostics are removed once the underlying problem is identified.

### Secrets Outside Source Control

Production secrets are provided through AWS Secrets Manager.

### Automated Validation

Changes are validated through tests, TypeScript checks, builds, and production verification.

---

# 📜 Database Migration Principle

Database schema changes should always be performed through Alembic migrations.

Recommended workflow:

```text
Modify Model
    ↓
Create Migration
    ↓
Review Migration
    ↓
alembic upgrade head
    ↓
Run Tests
    ↓
Verify Application
```

Avoid manually modifying the production database schema outside the migration system.

---

# 🐳 Container Deployment Principle

The backend deployment follows:

```text
Source Code
    ↓
Dockerfile
    ↓
Docker Image
    ↓
Image Verification
    ↓
Amazon ECR
    ↓
Amazon ECS
    ↓
Production Health Check
```

The production image should be verified before deployment.

---

# ☁️ AWS Deployment Principle

The production environment separates application responsibilities:

```text
Frontend
   ↓
Amazon S3

Backend
   ↓
Amazon ECS/Fargate

Database
   ↓
Amazon RDS

Secrets
   ↓
AWS Secrets Manager

Container Registry
   ↓
Amazon ECR

Monitoring
   ↓
CloudWatch
```

This provides clear separation between application layers.

---

# 📋 Release Checklist

Before considering a release complete:

```text
☐ Backend tests pass
☐ Frontend tests pass
☐ TypeScript check passes
☐ Production frontend build passes
☐ Docker build passes
☐ Docker image does not contain secrets
☐ Database migrations are current
☐ Authentication flow verified
☐ Refresh flow verified
☐ Logout verified
☐ Bookshelf behavior verified
☐ Reading progress verified
☐ CORS configuration verified
☐ Production health endpoint returns 200
☐ Production database connection verified
☐ CloudWatch logs reviewed
☐ No temporary diagnostic logging remains
☐ Git working tree is clean
☐ Changes pushed to GitHub
```

---

# 📌 Current Project Status

> **Status: Production deployed and verified**

The current release has successfully passed:

* Backend automated testing
* Frontend automated testing
* TypeScript validation
* Production frontend build
* Docker build and verification
* Google authentication verification
* Session restoration verification
* Refresh-token verification
* Logout/session revocation verification
* Bookshelf verification
* Reading-progress verification
* Database connectivity verification
* ECS deployment verification
* Production health verification

---

# 📝 Final Release Validation

The final source was committed with:

```text
feat: finalize authentication and bookshelf improvements
```

The main branch was synchronized with the remote repository after the implementation work.

The production backend was deployed using a clean, verified Docker image.

The final production environment passed:

```text
Application Health       → HTTP 200
Database                 → Connected
ECS Desired Tasks        → 1
ECS Running Tasks        → 1
ECS Rollout              → Completed
Startup Errors           → 0
HTTP 500 Errors          → 0
Authentication Errors    → 0
Diagnostic Token Logging → None
```

---

# 📚 Final Architecture Summary

```text
┌─────────────────────────────────────────────┐
│              BOOK FINDER APP                │
├─────────────────────────────────────────────┤
│                                             │
│  🔎 Book Discovery                          │
│           +                                 │
│  📖 Book Details                            │
│           +                                 │
│  📚 Personal Bookshelf                      │
│           +                                 │
│  📈 Reading Progress                        │
│           +                                 │
│  🔐 Google Authentication                   │
│           +                                 │
│  🔑 JWT Session Management                  │
│           +                                 │
│  🔄 Refresh Token Rotation                  │
│           +                                 │
│  🗄️ PostgreSQL Persistence                  │
│           +                                 │
│  🔄 State Synchronization                   │
│           +                                 │
│  🐳 Dockerized Backend                      │
│           +                                 │
│  ☁️ AWS Production Infrastructure            │
│           +                                 │
│  🧪 Automated Testing                       │
│           +                                 │
│  🛡️ Security-Conscious Design               │
│                                             │
└─────────────────────────────────────────────┘
```

---

# 🎯 Project Summary

Book Finder App evolved from a simple book-discovery concept into a complete full-stack reading-management platform.

The final architecture combines:

```text
React
   +
TypeScript
   +
FastAPI
   +
PostgreSQL
   +
SQLAlchemy
   +
Alembic
   +
Google Identity Services
   +
JWT Session Management
   +
Docker
   +
Amazon ECR
   +
Amazon ECS/Fargate
   +
Amazon RDS
   +
Amazon S3
   +
AWS Secrets Manager
   +
CloudWatch
   +
Automated Testing
```

The project demonstrates experience across:

```text
Frontend Development
        +
Backend Development
        +
Database Design
        +
Authentication
        +
Session Security
        +
State Management
        +
Conflict Recovery
        +
Testing
        +
Containerization
        +
Cloud Deployment
        +
Production Debugging
        +
Security
```

It therefore represents considerably more than a basic book-search application.

---

# 👨‍💻 Author

**Rohith M**

Junior React Developer

## Core Technologies

```text
React • TypeScript • JavaScript

FastAPI • Python

PostgreSQL • SQLAlchemy • Alembic

Docker • AWS ECS • AWS Fargate

Amazon ECR • Amazon RDS

Amazon S3 • AWS Secrets Manager • CloudWatch

Git • GitHub
```

---

# 📄 License

This project is licensed under the MIT License.

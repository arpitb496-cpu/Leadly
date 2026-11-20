# Leadly

A minimal, premium full-stack Lead Management application built with a Flask + SQLite REST API backend and a React + Vite frontend styled with a modern monochrome theme.

---

## Screenshots

![Leadly Dashboard](docs/screenshot.png)

---

## Folder Structure

```text
Leadly/
├── .env.example              # Root environment template (Port 5001, DATABASE_URL, ALLOWED_ORIGINS)
├── .gitignore                # Git ignore rules (.env, .venv, node_modules, *.db, dist, etc.)
├── README.md                 # Complete documentation, setup & deployment guide
├── requirements.txt          # Single source of truth for Python dependencies (Flask, Gunicorn, Psycopg2, etc.)
├── docs/                     # Documentation assets and screenshots
│   └── screenshot.png
│
├── backend/
│   ├── app.py                # Flask app factory, CORS, and entry point (Port 5001)
│   ├── config.py             # App & SQLite/Postgres configuration (reads PORT, DATABASE_URL, ALLOWED_ORIGINS)
│   ├── models.py             # SQLAlchemy Lead model with indexed fields
│   ├── routes.py             # REST API endpoints (/api/leads and /api/leads/stats)
│   ├── validation.py         # Payload & query parameter validation logic
│   └── tests/
│       ├── __init__.py       # Test package marker
│       ├── conftest.py       # Pytest fixtures and in-memory test database
│       └── test_api.py       # API test suite (CRUD, validation, search, stats)
│
└── frontend/
    ├── index.html            # HTML root template with Inter typography
    ├── package.json          # Node scripts and dependencies
    ├── vite.config.js        # Vite dev server with proxy to Flask on PORT 5001
    └── src/
        ├── main.jsx          # React DOM entry point
        ├── App.jsx           # App state coordinator, modals & toast provider
        ├── index.css         # Minimal monochrome CSS design tokens
        ├── App.css           # Component styles (table, cards, modals, badges)
        ├── services/
        │   └── api.js        # Centralized REST API client (supports VITE_API_URL and /api fallback)
        └── components/
            ├── DashboardStats.jsx     # Status metrics cards with interactive filter
            ├── DeleteConfirmModal.jsx # Styled deletion confirmation modal
            ├── LeadFormModal.jsx      # Create/Edit modal with field-level validation
            ├── LeadList.jsx           # Leads table with sorting, avatars & pagination
            ├── Navbar.jsx             # Top navigation bar & action button
            └── Toast.jsx              # Floating toast notification system
```

---

## How to Run Locally

### Prerequisites
- **Python:** 3.9+ installed
- **Node.js:** 18+ and `npm` installed

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/arpitb496-cpu/Leadly.git
cd Leadly
```

---

### Step 2: Backend Setup (Flask + SQLite)

1. **Create and activate a virtual environment:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate    # On Windows: .venv\Scripts\activate
   ```

2. **Install backend dependencies:**
   *(Uses the single source of truth `requirements.txt` in the root)*
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the Flask backend server:**
   ```bash
   python backend/app.py
   ```
   - The backend runs at `http://localhost:5001`.
   - The port is configurable via the `PORT` environment variable (defaults to `5001` to prevent conflicts with macOS AirPlay on port `5000`).
   - The SQLite database (`leads.db` inside `backend/`) and its tables are **created automatically** upon startup.

4. **Run the Automated Pytest Suite:**
   In a terminal with the virtual environment activated:
   ```bash
   pytest backend/tests -v
   ```

---

### Step 3: Frontend Setup (React + Vite)

1. **Open a new terminal tab/window and navigate to `frontend`:**
   ```bash
   cd Leadly/frontend
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Start the Vite development server:**
   ```bash
   npm run dev
   ```
   - The web application will be live at `http://localhost:5173`.
   - API calls to `/api/*` are automatically proxied to the backend at `http://localhost:5001`.

---

## Deployment on Render

Leadly is configured for quick and seamless deployment on [Render](https://render.com) using two decoupled services: a **Web Service** for the Flask API and a **Static Site** for the React frontend.

### 1. Backend Web Service (Flask + Gunicorn)

1. On Render, click **New +** and select **Web Service**.
2. Connect your `Leadly` repository.
3. Configure the service settings:
   - **Environment:** `Python 3`
   - **Root Directory:** *(leave blank to run from repo root)*
   - **Build Command:**
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command:**
     ```bash
     gunicorn "backend.app:app"
     ```
     *(Or with explicit port binding: `gunicorn "backend.app:app" --bind 0.0.0.0:$PORT`)*
4. Set the following **Environment Variables**:
   - `PYTHON_VERSION`: `3.9` (or `3.10`+)
   - `DATABASE_URL`: Your Render PostgreSQL database connection string (if using Render Postgres). If your URL starts with `postgres://`, Leadly automatically converts it to `postgresql://` for SQLAlchemy. If `DATABASE_URL` is omitted, Leadly automatically falls back to an SQLite database file.
   - `ALLOWED_ORIGINS`: The URL of your deployed frontend (e.g. `https://leadly.onrender.com`), or `*` to allow all origins.
   - `SECRET_KEY`: A strong random string for Flask session security.
5. Deploy the service. Database tables are **automatically created on startup** via `db.create_all()`.

---

### 2. Frontend Static Site (React + Vite)

1. On Render, click **New +** and select **Static Site**.
2. Connect your `Leadly` repository.
3. Configure the static site settings:
   - **Root Directory:** *(leave blank)*
   - **Build Command:**
     ```bash
     cd frontend && npm install && npm run build
     ```
   - **Publish Directory:**
     ```bash
     frontend/dist
     ```
4. Set the following **Environment Variable**:
   - `VITE_API_URL`: The full URL to your deployed backend API with `/api` appended (e.g. `https://leadly-api.onrender.com/api`).
5. Under **Redirects/Rewrites**, add an SPA rewrite:
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** `Rewrite`
6. Deploy the site.

---

## Tech Chosen and Why

- **Backend: Flask + SQLite/PostgreSQL (Flask-SQLAlchemy 3.x)**
  - *Why:* Flask provides an unopinionated, lightweight framework without unnecessary overhead. SQLAlchemy 2.0+ ORM mapping offers clean models, indexed queries on `name` and `status`, and zero-friction portability between SQLite locally and PostgreSQL on Render.
- **Production Server: Gunicorn**
  - *Why:* Robust, WSGI-compliant HTTP server designed to handle concurrency with multiple worker processes in cloud container environments.
- **Frontend: React 18 + Vite**
  - *Why:* Vite delivers instantaneous Hot Module Replacement (HMR) and sub-second production builds. React's component model and hooks (`useState`, `useEffect`, `useCallback`, `useMemo`) provide clear and reactive state synchronization without bulky external state libraries.
- **Styling: Minimalist Monochrome Theme (NexBank-Inspired)**
  - *Why:* Built directly with CSS Custom Properties using pure black (`#000`), white (`#fff`), and neutral borders (`#e4e4e7`). Avoids bloated UI frameworks while delivering a high-contrast, premium aesthetic with subtle 150ms transitions and responsive layouts.
- **Testing: Pytest**
  - *Why:* Clean fixture lifecycle management (`conftest.py`), expressive assertions, and seamless integration with Flask's test client.

---

## Assumptions

1. **Internal CRM Workflow:** The application is modeled for sales teams and representatives managing prospect pipelines without multi-tenant authentication complexity.
2. **Phone Number Format:** Restricts phone input to digits only between 7 and 15 digits (`^\d{7,15}$`) to maintain consistency for dialer integrations.
3. **Bounded Enumerations:** Lead `source` is restricted to `['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Other']`, and `status` is bounded to `['New', 'Contacted', 'Qualified', 'Lost']`.
4. **Database Portability:** SQLite is used for zero-configuration local development. Switching to PostgreSQL in production only requires providing the `DATABASE_URL` environment variable.

---

## What I Would Improve with More Time

1. **Lead Activity Timeline:** Log timestamped status transitions, call logs, and communication notes per lead.
2. **CSV Import & Export:** Bulk import leads via CSV and export filtered table views.
3. **Authentication & RBAC:** Add role-based authentication (Admin vs. Sales Rep) using JWT tokens.
4. **End-to-End Testing:** Automate full user flows using Playwright or Cypress.
5. **Real-time Updates:** Push live lead updates to connected clients using Server-Sent Events (SSE) or WebSockets.

---

## What Was Tricky

1. **Dual-Layer Field Validation:** Synchronizing frontend client-side validation with backend-generated validation errors required designing structured error payloads (`{ "errors": { "field": "message" } }`) and dynamic inline field mapping.
2. **macOS Port 5000 Collision:** Port 5000 is occupied by default on macOS Monterey and later by the AirPlay Receiver service. Standardizing the backend and Vite dev proxy to port `5001` via environment configuration resolved silent network connection failures.
3. **SQLAlchemy 2.0 Compatibility:** Transitioning away from legacy `Query.get()` calls to `db.session.get(Lead, id)` ensured zero deprecation warnings during testing.

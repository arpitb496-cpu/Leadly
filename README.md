# Lead Manager

A full-stack, lightweight, and responsive Lead Management application built with a Flask + SQLite REST API backend and a modern React + Vite frontend.

---

## Folder Structure

```text
Leadly/
├── .env.example              # Root environment template
├── .gitignore                # Git ignore rules for Python, Node, SQLite, env
├── README.md                 # Complete documentation and setup guide
├── requirements.txt          # Python dependencies (Flask, SQLAlchemy, Cors, Pytest)
│
├── backend/
│   ├── app.py                # Flask app factory, CORS, and entry point
│   ├── config.py             # App & SQLite configuration
│   ├── models.py             # SQLAlchemy Lead model with indexed fields
│   ├── routes.py             # REST API endpoints (/api/leads and /api/leads/stats)
│   ├── validation.py         # Payload & query parameter validation logic
│   ├── requirements.txt      # Backend requirements
│   └── tests/
│       ├── __init__.py       # Test package marker
│       ├── conftest.py       # Pytest fixtures and in-memory test database
│       └── test_api.py       # API test suite (CRUD, validation, search, stats)
│
└── frontend/
    ├── index.html            # HTML root template
    ├── package.json          # Node scripts and dependencies
    ├── vite.config.js        # Vite dev server with /api proxy to Flask
    └── src/
        ├── main.jsx          # React DOM entry point
        ├── App.jsx           # App state coordinator, API handler & error boundary
        ├── index.css         # CSS design tokens & reset
        ├── App.css           # Component styles (table, cards, modal, badges)
        ├── services/
        │   └── api.js        # Centralized REST API client
        └── components/
            ├── DashboardStats.jsx     # Interactive status count cards
            ├── DeleteConfirmModal.jsx # Confirmation dialog before deleting lead
            ├── LeadFormModal.jsx      # Create/Edit lead modal dialog with validation
            ├── LeadList.jsx           # Leads table, search, sorting & pagination
            └── Navbar.jsx             # Top bar branding & actions
```

---

## How to Run Locally

### Prerequisites
- **Python:** 3.9+ installed
- **Node.js:** 18+ and `npm` installed

### 1. Backend Setup (Flask + SQLite)

1. Open your terminal and navigate to the project directory:
   ```bash
   cd Leadly
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate    # On Windows: .venv\Scripts\activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the Flask backend server:
   ```bash
   python backend/app.py
   # Or from within the backend directory:
   # cd backend && python app.py
   ```
   The API will run at `http://localhost:5000`. The SQLite database (`leads.db`) is automatically initialized upon startup.

5. **Run the Automated Pytest Suite:**
   ```bash
   pytest backend/tests -v
   ```

---

### 2. Frontend Setup (React + Vite)

1. Open a new terminal tab/window and navigate to the `frontend` folder:
   ```bash
   cd Leadly/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The web application will open at `http://localhost:5173`.
   Requests to `/api` are automatically proxied to `http://localhost:5000`.

---

## Tech Chosen and Why

- **Backend: Flask + SQLite (Flask-SQLAlchemy)**
  - *Why:* Flask provides a lightweight, minimalist framework without unnecessary boilerplate. Paired with SQLAlchemy, it offers clean ORM abstraction, database migrations flexibility, and easy in-memory SQLite isolation for lightning-fast testing (`sqlite:///:memory:`).
- **Frontend: React 18 + Vite**
  - *Why:* Vite provides near-instantaneous Hot Module Replacement (HMR) and optimized build times compared to legacy bundlers. React's functional component model and hooks (`useState`, `useEffect`, `useCallback`, `useMemo`) provide clear, reactive state synchronization without the overhead of heavy global state managers.
- **Styling: Modern CSS with CSS Custom Properties**
  - *Why:* Built directly with custom design tokens (CSS variables) for crisp typography, soft elevations, accessible status colors, and zero framework bundle bloat.
- **Testing: Pytest**
  - *Why:* Clean fixture architecture (`conftest.py`), expressive assertions, and seamless integration with Flask's test client.

---

## Assumptions

1. **CRM Use-Case:** The system is intended as an internal lead tracking tool where leads are managed by sales representatives or managers without requiring complex multi-tenant permissions.
2. **Phone Number Format:** To ensure clean data for telephony integrations, phone numbers (if provided) are restricted to digits only between 7 and 15 characters (`^\d{7,15}$`).
3. **Allowed Values:** Lead `source` is strictly bounded to `['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Other']`, and `status` is bounded to `['New', 'Contacted', 'Qualified', 'Lost']`.
4. **Database Portability:** SQLite is assumed for local development and simplicity; switching to PostgreSQL in production only requires updating the `DATABASE_URL` environment variable.

---

## What I Would Improve with More Time

1. **Lead Activity Timeline & History:** Log timestamped status transitions, call notes, and activity history for each lead.
2. **CSV Export & Bulk Ingestion:** Allow sales teams to export filtered lead views to CSV or upload batches of leads via spreadsheet.
3. **Authentication & RBAC:** Add JWT-based user authentication with Role-Based Access Control (e.g., Sales Rep vs. Admin).
4. **End-to-End Testing:** Implement automated browser testing using Playwright or Cypress to test complete interactive UI workflows.
5. **Real-time Synchronization:** Use WebSockets or Server-Sent Events (SSE) so multi-user updates reflect instantly on dashboards without manual refresh.

---

## What Was Tricky

Coordinating dual-layer validation so client-side feedback is immediate while gracefully parsing and binding backend-generated field errors dynamically beneath form inputs required careful state isolation. Additionally, ensuring seamless pagination and search compatibility across both proxy and direct CORS configurations while keeping SQLAlchemy 2.0 query patterns warning-free required thoughtful route ordering and query composition.

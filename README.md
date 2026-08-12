# CivicLens AI

> **Transforming citizen voices into actionable, funded development priorities — with AI.**

CivicLens AI is a civic feedback platform that takes citizen reports (roads, water, health, security, and more), automatically analyzes and prioritizes them with AI, and routes them through a real government approval pipeline — from first report to a funded, budgeted decision.

## How it works

```
Citizen reports an issue
        │
        ▼
  AI analyzes it        → categorizes, sets priority, drafts a summary,
        │                  recommendation, and action plan (Google Gemini)
        ▼
  Staff reviews it       → tracks status, adds resolution notes, forwards
        │                  it for approval
        ▼
  Admin verifies it       → confirms or overrides the AI's priority call,
        │                  can decline invalid/duplicate reports
        ▼
  Government Official approves it  → allocates a budget, sets a timeline,
                                       records the reasoning
```

Every case carries a full audit trail: who reviewed it, who approved it, and why.

## Key features

- **AI-powered triage** — every report is automatically categorized, prioritized (Low/Medium/High), summarized, and routed to the right department via Google Gemini, with a graceful fallback across models.
- **Four-tier role system** — Guest (citizen), Staff, Admin, and Government Official, each with distinct permissions enforced on both the API and the UI.
- **Budget approval workflow** — Government Officials give the final sign-off with an allocated budget (KES), an expected timeline, and a written reason — all stored on the case.
- **Verified citizen identity** — citizens register and log in with their **National ID number** and phone number (not a self-chosen username), so a report can always be traced back to a real, reachable person.
- **Nationwide coverage** — all 47 Kenyan counties are seeded with wards, with county/ward filtering throughout the dashboard and PDF exports.
- **Bilingual** — full English/Swahili UI via `react-i18next`, with a language switcher.
- **Analytics dashboard** — live stats, category/ward breakdowns, recent reports table, and a branded PDF export.

## Tech stack

**Frontend** — React 19, Vite, React Router, Tailwind CSS, Recharts, `react-i18next`, Axios

**Backend** — Django, Django REST Framework, Simple JWT, `django-cors-headers`, WhiteNoise

**Database** — PostgreSQL in production (via `DATABASE_URL`), SQLite for local development

**AI** — Google Gemini (`google-genai`), with automatic fallback across `gemma-4-26b-a4b-it`, `gemini-2.5-flash`, and `gemini-2.0-flash`

## Project structure

```
backend/            Django project
  config/           settings, root URLs
  feedback/         core app — models, views, permissions, serializers
frontend/           React app (Vite)
  src/pages/        route-level screens (Login, Register, Dashboard, CaseDetail, SubmitFeedback)
  src/components/   shared UI (Navbar, charts, StatusStepper, etc.)
  src/services/     API client + auth/session helpers
  src/i18n/         English/Swahili translation files
render.yaml         Render Blueprint for the backend + database
.github/workflows/  keep-alive ping for the deployed backend
```

## Roles

| Role | Access |
|---|---|
| **Guest** (citizen) | Registers with National ID + phone, submits reports |
| **Staff** | Views dashboard/cases, updates status and resolution notes |
| **Admin** | Everything Staff can, plus: confirm/override AI priority tags, decline reports, manage staff accounts |
| **Government Official** | Everything Admin can, plus: approve a case with budget, timeline, and reason |

## Running locally

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows — use `source .venv/bin/activate` on macOS/Linux
pip install -r requirements.txt

# create backend/.env with:
#   GEMINI_API_KEY=your-gemini-key
#   SECRET_KEY=any-random-string-for-local-dev

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

By default the frontend talks to `http://127.0.0.1:8000/api/`. To point it elsewhere, set `VITE_API_URL` (e.g. in `frontend/.env`).

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | backend | Required — AI analysis will fail without it |
| `SECRET_KEY` | backend | Django secret key (falls back to an insecure dev key locally) |
| `DEBUG` | backend | `"True"`/`"False"`, defaults to `False` |
| `ALLOWED_HOSTS` | backend | Comma-separated, defaults to localhost + `.onrender.com` |
| `DATABASE_URL` | backend | Postgres connection string; falls back to local SQLite if unset |
| `CORS_ALLOWED_ORIGINS` | backend | Comma-separated frontend origins; defaults to allowing all |
| `VITE_API_URL` | frontend | Backend API base URL, e.g. `https://your-backend.onrender.com/api/` |

## Deployment

- **Backend**: `render.yaml` defines a Render Blueprint (web service + free Postgres). In the Render dashboard: **New + → Blueprint**, select this repo, supply `GEMINI_API_KEY` when prompted.
- **Frontend**: deploy `frontend/` on Vercel (root directory `frontend`), set `VITE_API_URL` to the deployed backend's `/api/` URL. `frontend/vercel.json` already handles SPA routing.
- **Keep-alive**: Render's free tier sleeps after 15 minutes of inactivity. `.github/workflows/keep-alive.yml` pings the backend every 5 minutes to prevent that — set a `BACKEND_URL` repository variable (Settings → Secrets and variables → Actions) to the deployed backend URL to activate it.

## API overview

All endpoints are under `/api/`. Auth uses JWT (`/api/token/`, `/api/token/refresh/`).

| Endpoint | Description |
|---|---|
| `POST /api/register/` | Citizen self-registration (National ID + phone) |
| `GET /api/me/` | Current user's profile and role |
| `POST /api/analyze/` | Submit a report for AI analysis |
| `GET /api/dashboard/` | Aggregate stats (optionally `?county=`) |
| `GET /api/recent/` | Recent reports (optionally `?county=`) |
| `GET/POST /api/feedback/` | Case list/detail, plus `confirm_priority/`, `decline_priority/`, `update_status/`, `approve_case/` actions |
| `GET /api/counties/`, `/api/wards/`, `/api/categories/` | Reference data |
| `GET /api/reports/pdf/` | Branded PDF export |
| `GET/POST/DELETE /api/users/` | Admin-only staff account management |

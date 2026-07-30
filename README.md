# Backend + Frontend

AI-powered constituency development planning platform with a Django API and a React/Tailwind dashboard.

## Backend features
- Django + DRF setup
- Database models for planning submissions and constituent feedback
- REST endpoints for submit, dashboard, report generation, and feedback analysis
- Lightweight AI-style analysis layer for report generation and sentiment inference

## Frontend features
- React + Vite app
- Tailwind CSS styling
- Responsive dashboard and forms
- Charts for budget and priority analysis
- Home, feedback submission, dashboard, and AI report views

## API Endpoints
- POST /api/submit
- GET /api/dashboard
- GET /api/generate-report/<submission_id>
- POST /api/analyze-feedback

## Run locally
### Backend
1. Install dependencies: `pip install -r requirements.txt`
2. Apply migrations: `python manage.py migrate`
3. Start the server: `python manage.py runserver`

### Frontend
1. Change into the frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Start the UI: `npm run dev`

## Test
- Backend: `python manage.py test`
- Frontend build: `npm run build`

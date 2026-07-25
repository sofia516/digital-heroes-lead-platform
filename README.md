# LeadFlow — Full Stack Lead Management Platform

LeadFlow is a full-stack lead management and sales workflow application built for the Digital Heroes Full Stack Developer task.

It provides a complete workflow from public lead capture to internal sales management, including authentication, role-based access control, lead assignment, pipeline tracking, notes, activity history, search, filtering, and pagination.

## Live Application

Frontend:
https://leadflow-woua.onrender.com

Backend API:
https://leadflow-api-ns4g.onrender.com

API Documentation:
https://leadflow-api-ns4g.onrender.com/docs

## Demo Credentials

### Admin

Email:
admin@leadflow.com

Password:
Admin@123

### Sales Member

Email:
member@leadflow.com

Password:
Member@123

The Admin account can view all leads and assign leads to sales members.

Sales Members only have access to leads assigned to them.

---

## Core Features

### Public Lead Capture

Visitors can submit an enquiry without authentication.

Each submission is stored in the database as a new lead and becomes immediately available to the sales team.

### Authentication

LeadFlow uses JWT-based authentication.

Protected frontend routes and backend endpoints require a valid access token.

### Role-Based Access Control

Two roles are implemented:

**Admin**
- View all leads
- Search and filter leads
- View lead details
- Change pipeline status
- Assign leads to sales members
- Add notes
- View activity history

**Member**
- View only assigned leads
- Open assigned lead details
- Update lead status
- Add notes
- View activity history

Lead assignment is restricted to Admin users at both the frontend and backend authorization layers.

### Lead Pipeline

Leads move through the following states:

`New → Contacted → Qualified → Won / Lost`

Status changes are recorded in the activity history.

### Lead Assignment

Admins can assign leads to active sales members.

Members cannot assign or reassign leads.

### Notes

Authenticated users can add contextual notes to leads they are authorized to access.

### Activity Audit Trail

Important lead actions are recorded, including:

- Lead creation
- Status changes
- Lead assignment
- Notes/activity updates

### Search and Filtering

The lead workspace supports:

- Name search
- Email search
- Company search
- Status filtering
- Pagination

---

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Lucide React
- CSS

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT authentication
- Passlib / bcrypt
- Uvicorn

### Database

Development:
- SQLite

Production:
- PostgreSQL

### Deployment

- Render Web Service — FastAPI backend
- Render PostgreSQL — production database
- Render Static Site — React frontend

---

## Architecture

```text
Public Visitor
      |
      v
React / Vite Frontend
      |
      | REST API
      v
FastAPI Backend
      |
      +---- JWT Authentication
      |
      +---- Role-Based Authorization
      |
      +---- Lead Management
      |
      +---- Notes & Activity Tracking
      |
      v
PostgreSQL
```

The frontend communicates with FastAPI through REST endpoints.

Authentication tokens are sent using the HTTP Authorization header.

Backend authorization rules ensure that frontend restrictions cannot be bypassed simply by calling the API directly.

---

## Project Structure

```text
digital-heroes-lead-platform/
|
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── database.py
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   └── seed_admin.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/sofia516/digital-heroes-lead-platform.git
cd digital-heroes-lead-platform
```

### 2. Backend Setup

```bash
cd backend

python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

macOS/Linux:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## Environment Variables

The backend supports:

```text
DATABASE_URL=
SECRET_KEY=
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
FRONTEND_URL=
```

For local development, the application falls back to SQLite when `DATABASE_URL` is not provided.

The frontend supports:

```text
VITE_API_URL=
```

When it is not provided, the frontend uses the local FastAPI server.

Secrets and production credentials are not committed to the repository.

---

## API Overview

Important endpoints include:

```text
POST   /api/auth/login

POST   /api/leads
GET    /api/leads
GET    /api/leads/{lead_id}
PATCH  /api/leads/{lead_id}

GET    /api/leads/{lead_id}/notes
POST   /api/leads/{lead_id}/notes

GET    /api/leads/{lead_id}/activities

GET    /api/users/members
```

Interactive API documentation is available through Swagger at `/docs`.

---

## Testing

Backend automated tests are implemented with pytest.

Run:

```bash
cd backend
pytest -v
```

Current result:

```text
5 passed
```

Tests cover key backend behavior and authorization rules.

---

## Security Decisions

Several controls were implemented deliberately:

- Passwords are stored as hashes rather than plaintext.
- JWT tokens protect authenticated API routes.
- Authorization is enforced by the backend, not only by the UI.
- Members are restricted to leads assigned to them.
- Lead assignment is Admin-only.
- Production secrets are provided through environment variables.
- Sensitive environment files and local databases are excluded from Git.

---

## Key Engineering Decisions

### Backend-enforced RBAC

Role restrictions are enforced inside FastAPI even when corresponding controls are hidden in React. This prevents a Member from bypassing the interface and directly calling an Admin operation.

### Separate Development and Production Databases

SQLite keeps local setup lightweight, while PostgreSQL provides persistent production storage.

### Activity History

Status changes and assignments create activity records instead of silently modifying the lead. This provides useful context and a basic audit trail for the sales team.

### Simple Architecture

The application deliberately avoids unnecessary infrastructure. React, FastAPI, SQLAlchemy and PostgreSQL provide enough separation of concerns for the scope while keeping the project straightforward to run and review.

---

## AI Tool Usage

AI tools were used as a development assistant during the project for brainstorming implementation approaches, debugging errors, reviewing code structure, and improving documentation. I reviewed, adapted, integrated, and tested the generated suggestions myself. Architectural choices, feature prioritization, authorization behavior, integration decisions, deployment, and final verification were performed as part of my own development process.

---

## Future Improvements

Given additional production time, I would consider adding:

- Refresh-token authentication
- Password reset flow
- Admin user-management interface
- Named assignees instead of numeric IDs in all views
- Dashboard analytics from real database data
- Email notifications for assignments
- Database migrations with Alembic
- Expanded integration and end-to-end tests
- Rate limiting for the public lead form

---

## Author

**Sofia Naushad**

Digital Heroes — Full Stack Developer Task
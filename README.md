# MentorMesh

> **Locality-first AI mentor matching for students — no cold DMs, no wasted connections.**

MentorMesh connects college students with working professionals and researchers in their own city. An AI engine ranks mentor relevance against the student's stated goal, and no message reaches a mentor until the student answers three specific intent questions. The result: every connection starts with context, not noise.

---

## Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Feature Overview](#feature-overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [AI Match Engine](#ai-match-engine)
- [Project Structure](#project-structure)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Author](#author)

---

## The Problem

Students who want real-world guidance face the same broken loop: find someone impressive on LinkedIn, send a cold connection request, write a vague "I'd love to connect" message, and wait to be ignored. The professional has no idea what the student actually wants. The student has no way to stand out. Nobody wins.

Three specific problems drive this:

**Geographic mismatch.** Most mentor-matching platforms are global by default. But for a student in Hyderabad, a mentor in the same city means the possibility of meeting in person, attending the same events, and building a relationship that isn't purely transactional.

**Intent mismatch.** A mentor with 30 years of experience in cloud infrastructure cannot help every student who vaguely wants to "learn tech." Without knowing what the student has already tried, what they specifically want to achieve, and what they are asking for in the very first session, the mentor cannot evaluate whether their time is well spent.

**No filtering layer.** LinkedIn and Twitter have no mechanism that forces a student to qualify their request before sending it. MentorMesh does.

---

## The Solution

MentorMesh is a structured, locality-first matching platform with three core design decisions baked into the product:

**City-first discovery.** Students search mentors by city and domain. The default view shows professionals in the same metropolitan area, making in-person collaboration a realistic option rather than an afterthought.

**AI-powered ranking.** When a student enters their goal in plain language — "I want to publish a research paper on ML fairness before graduating" — the system sends that goal and all local mentor profiles to Claude. The AI returns a ranked list with a specific match score and a one-sentence reason per mentor. Students see *why* each match is relevant, not just a list of names.

**Intent-gated connection requests.** Before any message reaches a mentor, the student must answer three non-skippable questions:
1. What specifically do you want to learn or achieve?
2. What have you already tried or explored on your own?
3. What is your concrete ask for the first session?

The mentor sees all three answers before deciding to accept or decline. This single mechanism eliminates low-effort outreach entirely.

---

## Feature Overview

| Feature | Description |
|---|---|
| Student & Mentor Registration | Role-based accounts with city tracking |
| JWT Authentication | Secure login with 7-day token expiry |
| Mentor Profile Management | Domains, bio, capacity limits, discussion topics, and availability state |
| City + Domain Search | Filter mentors by location and expertise area |
| AI Match Engine | Claude ranks mentors by relevance to a student's goal with match scores (gated $\ge 60\%$) and reasons |
| Interactive Dark Map | Leaflet map with city pins showing geolocated guides on home and search dashboards |
| Intent-Gated Requests | 3-question form required before any connection request is sent |
| Mentor Inbox | Mentors review full student answers before accepting or declining |
| Workspace Chat | Real-time workspace chat with custom simulated AI replies from mentors |
| Ratings & Reviews | Students rate (1-5 stars) and review completed sessions; mentor rating updates in real-time |
| Dicebear Avatars | Snapchat-style adventurer icons replacing standard initials circles |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python 3.11+) |
| Database ORM | SQLAlchemy |
| Database (Local) | SQLite |
| Database (Production) | PostgreSQL |
| Authentication | JWT via `python-jose` + direct `bcrypt` hashing |
| AI Engine | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Map Library | Leaflet.js |
| Avatars | Dicebear Adventurer API |
| Backend Deployment | Render |
| Frontend Deployment | Vercel |

---

## Architecture

```mermaid
graph TD
    subgraph Frontend [React 19 & Tailwind CSS v4]
        UI[Browse / Match Dashboard]
        Map[Interactive Leaflet Dark Map]
        Chat[Workspace Chat - Blur-Free]
        Review[Rating & Review Modal]
        Avatars[Dicebear Adventurer Avatars]
    end

    subgraph Backend [FastAPI & SQLAlchemy]
        AuthRouter[Auth Router / JWT Authentication]
        MentorRouter[Mentor Profiles & Match Router]
        RequestRouter[Connection & Reviews Router]
    end

    subgraph AI [Match Service - Anthropic Claude]
        Claude[claude-sonnet-4-20250514]
    end

    subgraph Storage [Database]
        DB[(PostgreSQL / SQLite)]
    end

    %% Connections
    UI -->|API Requests - Axios| AuthRouter
    UI -->|Fetch Match Scores| MentorRouter
    Map -->|Geolocated Pin Sync| MentorRouter
    Chat -->|Simulated Replies| MentorRouter
    Review -->|Submit Ratings| RequestRouter

    MentorRouter -->|Evaluate Compatibility| Claude
    AuthRouter -->|CRUD operations| DB
    MentorRouter -->|Query profiles & reviews| DB
    RequestRouter -->|Store requests & updates| DB
```

The frontend communicates exclusively through the REST API. The Axios client (`client.js`) attaches the JWT from `localStorage` on every request and redirects to `/login` on a `401` response. The backend validates tokens, queries the database, and calls the Claude API only for the `/mentors/match` endpoint to keep costs minimal.

---

## Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary key |
| name | String | |
| email | String | Unique |
| password_hash | String | bcrypt |
| role | String | `student` or `mentor` |
| city | String | Used for locality matching |
| focus_area | String | Student target learnings field |
| learnt_so_far | String | Student skill progress field |
| achievements | String | Student target achievements |
| next_target | String | Student milestone target |
| created_at | DateTime | |

### `mentor_profiles`
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary key |
| user_id | Integer | FK → users (CASCADE) |
| domains | JSON | Array of strings e.g. `["AI/ML", "Web Dev"]` |
| bio | String | |
| max_sessions_per_month | Integer | Default 4 |
| what_ill_discuss | String | |
| avg_rating | Float | Default 0.0, updated on review |
| session_count | Integer | Default 0 |
| availability_state | String | `available`, `limited`, `busy`, `offline` |

### `connection_requests`
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary key |
| student_id | Integer | FK → users (CASCADE) |
| mentor_id | Integer | FK → users (CASCADE) |
| answer_1 | String | What do you want to learn or achieve? |
| answer_2 | String | What have you already tried? |
| answer_3 | String | Concrete ask for the first session |
| status | String | `pending`, `accepted`, `declined` |
| created_at | DateTime | |

### `sessions`
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary key |
| request_id | Integer | FK → connection_requests (CASCADE) |
| student_id | Integer | FK → users (CASCADE) |
| mentor_id | Integer | FK → users (CASCADE) |
| scheduled_at | DateTime | |
| agenda | String | Pre-filled from request answers |
| status | String | `upcoming`, `completed` |

### `reviews`
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary key |
| session_id | Integer | FK → sessions (CASCADE) |
| rating | Integer | 1–5 |
| note | String | Optional written review |
| created_at | DateTime | |

All foreign keys use `ondelete="CASCADE"` — deleting a user removes all their associated records cleanly.

---

## API Reference

### Auth

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/register` | Register new student or mentor | No |
| POST | `/auth/login` | Login and receive JWT | No |
| GET | `/auth/me` | Retrieve authenticated user profile info | Yes |
| PUT | `/auth/me` | Update student profile metadata | Yes |

**Register payload:**
```json
{
  "name": "Harsha Vardhan",
  "email": "harsha@ace.edu",
  "password": "securepass123",
  "role": "student",
  "city": "Hyderabad"
}
```

**Login response:**
```json
{
  "access_token": "<jwt>",
  "token_type": "bearer"
}
```

### Mentors

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| PUT | `/mentors/me` | Upsert mentor profile variables | Yes (mentor) |
| GET | `/mentors` | Fetch all public profiles | No |
| POST | `/mentors/match` | AI-ranked mentor list for a student goal | Yes (student) |
| POST | `/mentors/chat-reply` | Simulated context-aware chat responder | Yes |
| POST | `/mentors/{mentor_id}/reviews` | Leave review note and rating stars | Yes (student) |

**Match payload:**
```json
{
  "goal_text": "I want to publish a research paper on ML fairness",
  "city": "Hyderabad"
}
```

### Connection Requests

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/requests` | Submit intent form + connection request | Yes (student) |
| PATCH | `/requests/{id}` | Accept or decline a request | Yes (mentor) |

### Sessions

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/sessions` | Schedule a session from accepted request | Yes (mentor) |
| POST | `/sessions/{id}/review` | Submit a review for a completed session | Yes (student) |

---

## AI Match Engine

The matching logic lives in `backend/services/match.py` and is invoked only by `POST /mentors/match`.

**Flow:**
1. Query all mentor profiles where `city` matches the student's city
2. Serialize the profiles to a compact JSON representation
3. Send a structured prompt to `claude-sonnet-4-20250514` with the student's goal and the mentor list
4. Parse the returned JSON array
5. Filter rankings to return only highly compatible mentors (score $\ge 60\%$)

**Prompt structure:**
```
You are a mentor matching engine. Given a student's goal and a list of mentor
profiles, return a JSON array ranked by relevance. Each item must include:
mentor_id, match_score (0–100), match_reason (one sentence, specific, not generic).

Student goal: {goal_text}
Mentors: {mentor_profiles_json}

Return only valid JSON. No other text.
```

The frontend renders each result with the `match_reason` displayed as a badge beneath the mentor's name, giving students a specific explanation for every ranking position rather than an opaque score.

---

## Project Structure

```
mentormesh/
├── backend/
│   ├── main.py              # FastAPI app, CORS, router registration
│   ├── database.py          # SQLAlchemy engine, session factory, get_db
│   ├── models.py            # table models
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── auth.py              # Password hashing, JWT creation, get_current_user
│   ├── seed.py              # Demo data seeding script
│   ├── routers/
│   │   ├── auth.py          # POST /auth/register, POST /auth/login
│   │   ├── mentors.py       # Mentor profile CRUD + reviews + simulated chat
│   │   ├── requests.py      # Connection request creation + status updates
│   │   └── sessions.py      # Session scheduling + review submission
│   └── services/
│       └── match.py         # Claude API integration for mentor ranking
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── MentorDashboard.jsx
│   │   │   ├── Browse.jsx
│   │   │   └── MentorProfile.jsx
│   │   ├── components/
│   │   │   ├── MentorCard.jsx
│   │   │   ├── MentorMap.jsx    # Leaflet dark map with city pins
│   │   │   ├── IntentForm.jsx
│   │   │   ├── SessionCard.jsx
│   │   │   └── MatchResult.jsx
│   │   └── api/
│   │       └── client.js    # Axios instance with JWT interceptor
│   ├── index.css            # Tailwind v4 + custom design tokens
│   └── index.html
└── README.md
```

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/your-username/mentormesh.git
cd mentormesh
```

### 2. Backend setup

```bash
# Create and activate virtual environment
python -m venv venv

# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file in the root directory (see [Environment Variables](#environment-variables) section below).

### 4. Run the backend

```bash
uvicorn backend.main:app --reload
```

The API will be available at `http://localhost:8000`.  
Interactive Swagger docs: `http://localhost:8000/docs`

### 5. Seed demo data (optional)

```bash
python -m backend.seed --force
```

This populates the database with 15 mentor profiles and 5 student accounts for testing.

### 6. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```
VITE_API_BASE_URL=http://localhost:8000
```

### 7. Run the frontend

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Testing via PowerShell

**Register a student:**
```powershell
$body = @{
    name = "Harsha Vardhan"
    email = "harsha@ace.edu"
    password = "securepassword123"
    role = "student"
    city = "Hyderabad"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:8000/auth/register" `
  -ContentType "application/json" -Body $body
```

**Login and retrieve token:**
```powershell
$login = @{ email = "harsha@ace.edu"; password = "securepassword123" } | ConvertTo-Json
$token = (Invoke-RestMethod -Method Post -Uri "http://localhost:8000/auth/login" `
  -ContentType "application/json" -Body $login).access_token
```

---

## Environment Variables

### Backend (`.env`)

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | Yes (production) | Secret key for signing JWTs. Use a long random string in production. Defaults to a hardcoded dev key locally — **never deploy without setting this**. |
| `DATABASE_URL` | No (local) | PostgreSQL connection string for production. Defaults to `sqlite:///./mentormesh.db` locally. Format: `postgresql://user:password@host:port/dbname` |
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key for the Claude match engine. Get one at [console.anthropic.com](https://console.anthropic.com). |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Base URL of the backend API. `http://localhost:8000` locally, your Render URL in production. |

---

## Deployment

### Backend on Render

1. Push your code to GitHub.
2. Create a new **Web Service** on [render.com](https://render.com) pointing to your repo.
3. Set the following:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Add a **PostgreSQL** database on Render and copy the connection string.
5. Set all environment variables in the Render dashboard (`JWT_SECRET`, `DATABASE_URL`, `ANTHROPIC_API_KEY`, `PYTHON_VERSION`).

### Frontend on Vercel

1. Import your GitHub repo into [vercel.com](https://vercel.com).
2. Set the root directory to `frontend/`.
3. Add environment variable: `VITE_API_BASE_URL=https://your-render-service.onrender.com`
4. Deploy.

Vercel automatically rebuilds on every push to `main`.

---

## Roadmap

**V2 — Quality of life**
- AI Goal Refinement: Claude rewrites the student's rough goal into a structured, specific version before running the match
- Mentor verification badge for trusted profiles

**V3 — Discovery**
- Personalized discovery feed on the student dashboard, ranked by AI match score against a saved goal
- Domain-based trending mentors surfaced weekly

**V4 — Trust signals**
- Response time tracking per mentor
- Session completion rate badge
- Student endorsements visible on mentor profile

---

## Author

**ALIMINETI ANIRUDH**  
Student · ACE Engineering College, Hyderabad

Built for a 7-day hackathon. Stack: FastAPI · React · OPENAI And Codex · PostgreSQL · Render · Vercel.

---

*MentorMesh — structured intent, local connections, zero cold DMs.*

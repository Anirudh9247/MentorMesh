# MentorMesh

MentorMesh is a locality-first, AI-powered mentor matching platform that helps students discover and connect with working professionals and researchers in their city.

Instead of sending cold, generic outreach messages, students submit a structured intent form describing their goals, prior efforts, and specific mentorship needs. MentorMesh then uses AI-ranked matching to recommend the most relevant mentors and facilitate direct, context-aware connections.

---

## System Architecture

```mermaid
graph TD
    subgraph Frontend [Client - React 19 & Tailwind CSS v4]
        UI[Browse / Match Dashboard]
        Map[Interactive Leaflet Dark Map]
        Chat[Workspace Chat - Blur-Free]
        Review[Rating & Review Modal]
        Avatars[Dicebear Adventurer Avatars]
    end

    subgraph Backend [REST API - FastAPI & SQLAlchemy]
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

---

## Core Features

*   **AI Mentor Matching Gating**: Students describe their next target milestones. The match service queries Claude API to evaluate compatibility, returns a tailored Match Score and Match Reason, and gates matches so only mentors with a score of $\ge 60\%$ are recommended to eliminate low-quality pairings.
*   **Locality-First Live Map**: Integrated an interactive CartoDB dark-themed map on the Welcome landing page and search layouts. Automatically maps guides based on user city coordinates, utilizing spiral layout jitter to prevent overlapping pins.
*   **Intent-Gated Requests**: To eliminate spam, students must answer three intent questions:
    1. *What specifically do you want to learn or achieve?*
    2. *What have you already tried or explored on your own?*
    3. *What is your concrete ask for the first session?*
*   **Context-Aware Workspace Chat**: A blur-free real-time chat interface. Includes a simulated backend responder that generates personalized, context-aware replies based on the mentor's actual bio, domains, and professional profile details.
*   **Runtime Ratings & Reviews**: Students can submit 1–5 star ratings and reviews upon completing sessions. Average ratings and session counts are dynamically calculated and updated in real-time.
*   **Dicebear Adventurer Avatars**: Replaced flat text initials with Snapchat-style graphical avatars powered by the Dicebear Adventurer API (`https://api.dicebear.com/7.x/adventurer/svg`), adding a colorful, custom feel to both student and mentor layouts.
*   **On-Demand Availability Controls**: Mentors can configure their status toggles (`available`, `limited`, `busy`, `offline`) directly inside their dashboard settings.

---

## Technology Stack

*   **Frontend**: React 19, Tailwind CSS v4, Axios, Leaflet.js, React-Router-DOM (v7).
*   **Backend**: FastAPI, SQLAlchemy ORM, Uvicorn, Python-Jose (JWT), Cryptography.
*   **Database**: PostgreSQL (Production) / SQLite (Local development).
*   **AI Engine**: Anthropic Claude (`claude-sonnet-4-20250514`).
*   **Avatars**: Dicebear Adventurer API.

---

## Database Schema

```
Users
 ├── id (PK, Integer)
 ├── name (String, Not Null)
 ├── email (String, Unique, Index, Not Null)
 ├── password_hash (String, Not Null)
 ├── role (String, Index, Not Null)  -- 'student' or 'mentor'
 ├── city (String, Index, Not Null)
 ├── avatar_url / avatar_gradient (String, Nullable)
 ├── focus_area / learnt_so_far / achievements / next_target (String, Nullable)
 └── created_at (DateTime)

Mentor Profiles
 ├── id (PK, Integer)
 ├── user_id (FK -> Users.id, Cascade, Unique)
 ├── domains (JSON Array, Not Null)  -- e.g. ["AI/ML", "Web Dev"]
 ├── bio / what_ill_discuss (String, Nullable)
 ├── max_sessions_per_month (Integer, Default: 4)
 ├── avg_rating (Float, Default: 0.0)
 ├── session_count (Integer, Default: 0)
 └── availability_state (String, Default: 'available')

Connection Requests
 ├── id (PK, Integer)
 ├── student_id (FK -> Users.id, Cascade)
 ├── mentor_id (FK -> Users.id, Cascade)
 ├── answer_1 / answer_2 / answer_3 (String, Not Null)
 ├── status (String, Default: 'pending')  -- pending, accepted, declined
 └── created_at / updated_at (DateTime)

Sessions
 ├── id (PK, Integer)
 ├── request_id (FK -> Connection Requests.id, Cascade)
 ├── student_id (FK -> Users.id)
 ├── mentor_id (FK -> Users.id)
 ├── scheduled_at (DateTime)
 ├── agenda (String)
 └── status (String, Default: 'upcoming')  -- upcoming, completed

Reviews
 ├── id (PK, Integer)
 ├── session_id (FK -> Sessions.id, Cascade)
 ├── rating (Integer)  -- 1 to 5
 ├── note (String)
 └── created_at (DateTime)

Mentorship Connections
 ├── id (PK, Integer)
 ├── student_id (FK -> Users.id)
 ├── mentor_id (FK -> Users.id)
 ├── created_from_request_id (FK -> Connection Requests.id)
 ├── status (String, Default: 'active')  -- active, paused, completed
 └── created_at (DateTime)
```

---

## API Endpoints

### Authentication
*   `POST /auth/register` - Create student or mentor accounts.
*   `POST /auth/login` - Obtain JWT bearer access token.
*   `GET /auth/me` - Fetch authenticated user details.
*   `PUT /auth/me` - Update profile parameters.

### Mentor Profiles & Match
*   `GET /mentors` - Get public mentors directory.
*   `GET /mentors/me` - Retrieve current mentor profile.
*   `PUT /mentors/me` - Upsert mentor profile variables (availability, domains, bio).
*   `GET /mentors/{user_id}` - Retrieve detailed mentor profile with dynamically loaded stats and reviews.
*   `POST /mentors/match` - AI-ranked recommendations list (gated $\ge 60\%$).
*   `GET /mentors/match-score` - Fallback route to compute compatibility score.
*   `POST /mentors/chat-reply` - Generates a simulated, context-aware mentor response.
*   `POST /mentors/{mentor_id}/reviews` - Submit review notes and rating stars.

### Connection Requests
*   `POST /requests` - Send a structured connection request.
*   `GET /requests/sent` - Get student's sent requests.
*   `GET /requests/received` - Get mentor's incoming requests.
*   `PATCH /requests/{request_id}` - Update status (accept/decline request).

---

## Local Development

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Set up a Python virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the root folder with the following variables:
   ```env
   JWT_SECRET=your_jwt_secret_key
   ANTHROPIC_API_KEY=your_claude_api_key
   OPENAI_API_KEY=your_openai_api_key
   DATABASE_URL=sqlite:///./mentormesh.db
   ```
5. Seed initial realistic test data (includes 15 mentors and 5 student profiles):
   ```bash
   python -m backend.seed --force
   ```
6. Start the uvicorn development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *   **API Base**: `http://localhost:8000`
   *   **Swagger Docs**: `http://localhost:8000/docs`

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:8000
   ```
4. Run the Vite development server:
   ```bash
   npm run dev
   ```
   *   **Local UI URL**: `http://localhost:5173`

---

## Deployment Configuration

### Frontend (Vercel)
To deploy the React SPA, connect your repository to Vercel and configure the settings as follows:
*   **Root Directory**: `frontend`
*   **Framework Preset**: `Vite` (automatically detected)
*   **Build Command**: `npm run build`
*   **Output Directory**: `dist`
*   **Environment Variables**:
    *   `VITE_API_URL`: `https://your-backend-railway-url.railway.app`

### Backend (Railway)
To deploy the FastAPI server on Railway:
*   Set the **Root Directory** of your Railway service to `backend`.
*   Ensure the **Start Command** is configured to run the uvicorn service:
    ```bash
    uvicorn main:app --host 0.0.0.0 --port $PORT
    ```
*   **Environment Variables**:
    *   `DATABASE_URL`: provision a PostgreSQL database on Railway; the connection string will be automatically linked and formatted inside [database.py](file:///e:/MentorMesh/backend/database.py).
    *   `JWT_SECRET`: your JWT secret key.
    *   `ANTHROPIC_API_KEY`: your Anthropic API Key.

---

## Author

*   **Anirudh**
    *   ACE Engineering College
    *   Research Contributor – Quantum Random Number Generation

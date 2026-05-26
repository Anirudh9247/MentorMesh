# MentorMesh — Day 2, Day 3 & Day 4 Walkthrough

This document outlines the visual, functional, and architectural updates implemented for Day 2 (Mentor Profiles, Discovery), Day 3 (AI Multi-Model Matching Engine), and Day 4 (Intent-Gated Request Flow).

---

## Day 4: Intent-Gated Request Flow

We implemented the complete Intent-Gated request invitation system, connecting students to mentors through a multi-step form, supporting real-time statuses, and automatically creating mentorship relationships on approval.

### 1. Key Technical Backend Implementations
* **Database Updates ([models.py](file:///e:/MentorMesh/backend/models.py))** [MODIFY]:
  - Added the `MentorshipConnection` table to store active relationships.
  - Configured composite indices `idx_student_mentor` and `idx_conn_student_mentor` to enforce lookup speeds and duplication checks at the database level.
* **API Schemas ([schemas.py](file:///e:/MentorMesh/backend/schemas.py))** [MODIFY]:
  - Restrained `ConnectionRequestUpdate` statuses strictly to `accepted` or `declined`.
  - Added read schemas for the mentorship connections model.
* **Requests API Router ([requests.py](file:///e:/MentorMesh/backend/routers/requests.py))** [NEW]:
  - `POST /requests`: Creates a pending connection request after verifying user roles (student only) and checking for duplicates.
  - `GET /requests/sent`: Retrieves sent requests for students.
  - `GET /requests/received`: Retrieves received requests for mentors.
  - `PATCH /requests/{id}`: Processes requests (accept/decline) after ownership validation, and creates a `MentorshipConnection` if accepted.

### 2. Frontend User Interface
* **IntentForm Modal ([IntentForm.jsx](file:///e:/MentorMesh/frontend/src/components/IntentForm.jsx))** [NEW]:
  - Multi-step wizard ("Question X of 3") with a visual progress bar.
  - Character minimum validation (10 chars) and detailed placeholder guidance for each step.
* **Mentor Profile Connection Triggers ([MentorProfile.jsx](file:///e:/MentorMesh/frontend/src/pages/MentorProfile.jsx))** [MODIFY]:
  - Dynamically disables or transforms button styles based on connection status (e.g. shows "Pending Approval" or "Connected").
* **My Requests Tracker ([Browse.jsx](file:///e:/MentorMesh/frontend/src/pages/Browse.jsx))** [MODIFY]:
  - Tabbed interface separating Browse and Requests.
  - Display list with color status badges: Amber (pending), Green (accepted), and Red (declined).
  - Expandable detail accordion showing student answers.
* **Mentorship CRM Inbox ([MentorDashboard.jsx](file:///e:/MentorMesh/frontend/src/pages/MentorDashboard.jsx))** [MODIFY]:
  - Sidebar counter and received requests inbox with collapsing cards, time-ago formatting, and Accept/Decline action handlers.

---

## Day 3: AI Matching Engine Integration

We integrated a unified multi-model matching system that connects to Anthropic (Claude) and OpenAI (GPT), letting students toggle between providers dynamically to find optimal mentors.

### 1. Key Technical Implementations
* **AI Matching Logic ([match.py](file:///e:/MentorMesh/backend/services/match.py))** [NEW]:
  - Connects to **Anthropic Claude** using the `claude-sonnet-4-20250514` model with a max token limit of 1000.
  - Connects to **OpenAI GPT-4o** using JSON schema output mode.
  - **High-Fidelity Offline Fallback**: If no API keys are supplied (or if standard calls encounter network constraints), the system automatically triggers a Python-based keyword heuristic. This matches goals with mentor cities, domains, and bios, assigning logical scores and generating custom matching reasons, ensuring the **live demo functions perfectly without keys**.
* **Request & Result Schemas ([schemas.py](file:///e:/MentorMesh/backend/schemas.py))** [MODIFY]:
  - Created `MatchRequest` to validate goals and the selected provider.
  - Created `MatchResult` to package mentor details along with their computed match score and reason block.
* **Match Router Endpoint ([mentors.py](file:///e:/MentorMesh/backend/routers/mentors.py))** [MODIFY]:
  - Registered `POST /mentors/match`. Fetches all active mentor profiles, filters out the requester, structures minimal data payloads, and forwards them to `run_ai_match`.

### 2. Frontend User Interface
* **AI Matchmaker Panel ([Browse.jsx](file:///e:/MentorMesh/frontend/src/pages/Browse.jsx))** [MODIFY]:
  - Added an **AI Matchmaker** card to the sidebar.
  - Students can describe their mentorship goals in a text box, select their AI engine from a dropdown (Claude vs. GPT-4), and click **"Generate AI Matches"**.
  - Triggers a loading pulse and renders ranked cards with custom exit buttons.
* **AI Score & Explanation Cards ([MentorCard.jsx](file:///e:/MentorMesh/frontend/src/components/MentorCard.jsx))** [MODIFY]:
  - Displays a green glowing `⚡ XX% Match` indicator.
  - Adds an indigo alert box displaying a dynamic, explanation-based **"Match Reason"** (e.g. *"Also based in Hyderabad, Harsha can discuss your QRNG paper and React goals in person."*).

---

## Day 2: Mentor Profiles & Spacing Refinements

* **Unified 2-Column Browse Layout**: Re-organized [Browse.jsx](file:///e:/MentorMesh/frontend/src/pages/Browse.jsx) into a professional sidebar structure. Added a "Mesh Guide" card and "Locality welcome header" to remove empty spaces.
* **Mentor Dashboard Statistics ([MentorDashboard.jsx](file:///e:/MentorMesh/frontend/src/pages/MentorDashboard.jsx))**: Added completed session cards, gold rating indices, and a gamified profile completion progress bar.
* **Centered Modal positioning ([MentorProfile.jsx](file:///e:/MentorMesh/frontend/src/pages/MentorProfile.jsx))**: centered student connection request overlay using `fixed inset-0` flex alignment and responsive scroll-lock overlays.

---

## How to Test Locally

1. **Start Backend**:
   ```bash
   uvicorn backend.main:app --reload
   ```
2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
3. **Verify All Edge Case Backend Tests**:
   ```bash
   .venv\Scripts\python test_requests.py
   ```
   *(Confirms students register requests, duplicates check blocks, invalid/non-student responses reject, and cascades remove correctly).*

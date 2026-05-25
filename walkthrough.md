# MentorMesh — Day 1 Backend Foundation Walkthrough

This document outlines the setup, installation dependencies, database connection, model architecture, authentication setup, and API requests implemented for the MentorMesh backend.

## 1. Required Dependencies & Installation

To run the backend, you will need to install the following Python packages. Create a virtual environment first, then run the installation commands.

### Installation Steps

In your terminal (run from the project root `E:\MentorMesh`):

```bash
# 1. Create a virtual environment
python -m venv venv

# 2. Activate the virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Windows (CMD):
.\venv\Scripts\activate.bat
# On macOS/Linux:
source venv/bin/activate

# 3. Install core dependencies
pip install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] bcrypt pydantic
```

*Note: `python-jose[cryptography]` handles JWT creation and parsing, while `passlib[bcrypt]` combined with `bcrypt` secures user passwords.*

---

## 2. Database Connection

The database configuration in [database.py](file:///E:/MentorMesh/backend/database.py) uses **SQLAlchemy**.
* **Local Development**: Connects to a local SQLite database file named `mentormesh.db` generated automatically in the root directory.
* **Production/Render**: Detects if a `DATABASE_URL` environment variable is defined. If so, it dynamically overrides the SQLite fallback and connects to PostgreSQL, converting any legacy `postgres://` protocols to `postgresql://` automatically to avoid driver errors.
* **Session Lifecycle**: The `get_db` generator yields a database session to endpoints and closes it safely in a `finally` block when the request finishes.

---

## 3. Database Models

The [models.py](file:///E:/MentorMesh/backend/models.py) file maps Python classes to database tables:
1. **`User`**: Core accounts table representing both `student` and `mentor` roles.
2. **`MentorProfile`**: Detailed mentor configuration linked via one-to-one relationship to `User`. Domains are stored as a serializable JSON list.
3. **`ConnectionRequest`**: Tracks connection invitations. Stores responses to the 3 mandatory student questions.
4. **`Session`**: Tracks scheduled virtual chats.
5. **`Review`**: Enables students to rate and comment on sessions.

All foreign keys use `ondelete="CASCADE"` to ensure child records are removed when parent entities are deleted.

---

## 4. API Schemas & Data Serialization

The Pydantic v2 schemas in [schemas.py](file:///E:/MentorMesh/backend/schemas.py) perform request-data validation and serialize outputs:
* **`UserRegister`**: Validates standard signup fields, enforcing minimum lengths on names/passwords.
* **`UserLogin`**: Receives validation payload.
* **`Token` / `TokenData`**: Defines payload configuration for JWT authorization headers.
* **`UserRead`**: Strips out sensitive fields like passwords, exposing only safe fields.
* **`from_attributes = True`**: Configured to translate SQLAlchemy model instances to Pydantic JSON outputs.

---

## 5. Security & Authentication Flow

Auth utilities in [auth.py](file:///E:/MentorMesh/backend/auth.py) manage password security and JWTs:
* **Hashing**: Passwords are securely hashed with standard `bcrypt`.
* **Signing**: JWTs are signed using HMAC-SHA256 (`HS256`) with a private key loaded from `JWT_SECRET`.
* **Extraction**: The `get_current_user` dependency automatically extracts the `Authorization: Bearer <token>` token, verifies its expiration, decodes the sub-claim (email), and queries the database for the current logged-in user.

---

## 6. Endpoints Implemented

The API endpoints in [routers/auth.py](file:///E:/MentorMesh/backend/routers/auth.py) are:

### `POST /auth/register`
* **Purpose**: Registers a new user.
* **Validation**: Rejects existing email addresses, validates that the role is strictly either `'student'` or `'mentor'`.
* **Flow**: Hashes the password, inserts a user record, commits, and returns the user payload without password hashes.

### `POST /auth/login`
* **Purpose**: Logs in a registered user.
* **Validation**: Matches password hash. If invalid, throws a `401 Unauthorized` exception.
* **Flow**: Signs and returns a JWT containing the user's `email` and `role`.

---

## 7. Testing the Backend Locally

To test the backend locally:

1. Run the FastAPI development server:
   ```bash
   uvicorn backend.main:app --reload
   ```
2. Open your browser and head to:
   * **API Root**: [http://localhost:8000/](http://localhost:8000/) (should return healthy status JSON)
   * **Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs) (interactive API client)

### Testing via PowerShell (Local Client)

Run the following commands in a PowerShell terminal to test backend operations:

#### Register a Student:
```powershell
$registerBody = @{
    name = "Harsha Vardhan"
    email = "harsha.v@ace.edu"
    password = "securepassword123"
    role = "student"
    city = "Hyderabad"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:8000/auth/register" -ContentType "application/json" -Body $registerBody
```

#### Login and Retrieve JWT Token:
```powershell
$loginBody = @{
    email = "harsha.v@ace.edu"
    password = "securepassword123"
} | ConvertTo-Json

$tokenResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:8000/auth/login" -ContentType "application/json" -Body $loginBody
$tokenResponse
```

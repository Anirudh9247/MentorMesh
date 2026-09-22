"""
Session State Management Agent.
Tracks the state and metadata of all review sessions and stacked pull requests.
"""

class SessionStateAgent:
    def __init__(self):
        self.sessions = {}

    def register_session(self, session_id: str, branch_name: str, status: str = "PENDING"):
        self.sessions[session_id] = {
            "branch": branch_name,
            "status": status,
            "history": []
        }

    def update_status(self, session_id: str, status: str, note: str = ""):
        if session_id in self.sessions:
            self.sessions[session_id]["status"] = status
            self.sessions[session_id]["history"].append({"status": status, "note": note})

    def get_session(self, session_id: str):
        return self.sessions.get(session_id)

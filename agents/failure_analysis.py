"""
Failure Analysis and Solution Generation Agent.
Analyzes test and build errors to suggest recovery solutions.
"""

class FailureAnalysisAgent:
    @staticmethod
    def analyze_error(error_log: str):
        analysis = []
        if "NameError: name 'ReviewRead' is not defined" in error_log:
            analysis.append({
                "issue": "Schema forward reference unresolved for ReviewRead",
                "cause": "ReviewRead defined after MentorProfileRead in backend/schemas.py",
                "solution": "Use string literal 'ReviewRead' in List['ReviewRead'] annotation"
            })
        if "sqlalchemy.exc.OperationalError" in error_log or "database is locked" in error_log:
            analysis.append({
                "issue": "SQLite DB concurrency/locking error in test suite",
                "cause": "Multiple tests sharing or prematurely deleting mentormesh.db while engine connections remain open",
                "solution": "Use tempfile.mkstemp() for isolated sqlite DBs in setup_db/teardown_db fixtures"
            })
        if "Avoid calling setState() directly within an effect" in error_log:
            analysis.append({
                "issue": "React hook setState inside effect error",
                "cause": "Synchronous setState inside useEffect in React components",
                "solution": "Refactor component state synchronization or wrap in state callbacks"
            })
        return analysis

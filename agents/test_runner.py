"""
Test Execution and Monitoring Agent.
Runs backend and frontend tests and monitors execution metrics.
"""
import subprocess
import time

class TestRunnerAgent:
    def run_backend_tests(self):
        start_time = time.time()
        res = subprocess.run(["python3", "-m", "pytest"], capture_output=True, text=True)
        duration = time.time() - start_time
        return {
            "success": res.returncode == 0,
            "stdout": res.stdout,
            "stderr": res.stderr,
            "duration": duration
        }

    def run_frontend_lint(self):
        start_time = time.time()
        res = subprocess.run(["npm", "run", "lint"], cwd="frontend", capture_output=True, text=True)
        duration = time.time() - start_time
        return {
            "success": res.returncode == 0,
            "stdout": res.stdout,
            "stderr": res.stderr,
            "duration": duration
        }

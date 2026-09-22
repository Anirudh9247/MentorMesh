"""
Agent Effectiveness Metrics Framework.
Measures execution efficiency, error recovery rates, and session completion metrics.
"""

class AgentMetricsTracker:
    def __init__(self):
        self.metrics = {
            "total_sessions_audited": 0,
            "sessions_failed_initially": 0,
            "sessions_recovered": 0,
            "test_runs": 0,
            "test_pass_rate": 0.0,
            "execution_times": []
        }

    def record_audit(self, total: int, failed: int):
        self.metrics["total_sessions_audited"] = total
        self.metrics["sessions_failed_initially"] = failed

    def record_recovery(self, recovered_count: int):
        self.metrics["sessions_recovered"] = recovered_count

    def record_test_run(self, passed: bool, duration: float):
        self.metrics["test_runs"] += 1
        self.metrics["execution_times"].append(duration)

    def calculate_effectiveness_score(self) -> float:
        total = self.metrics["total_sessions_audited"]
        if total == 0:
            return 100.0
        recovered = self.metrics["sessions_recovered"]
        successful_initial = total - self.metrics["sessions_failed_initially"]
        return round(((successful_initial + recovered) / total) * 100, 2)

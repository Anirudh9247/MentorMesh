import pytest
from unittest.mock import patch
from backend.services.match import run_ai_match

def test_run_ai_match_exception_fallback():
    student_goals = "Learn machine learning and publish a paper"
    student_city = "Seattle"
    mentors = [
        {
            "id": 1,
            "user": {
                "id": 101,
                "name": "Mentor One",
                "city": "Seattle"
            },
            "domains": ["AI/ML"],
            "bio": "Expert in machine learning.",
            "what_ill_discuss": "Anything related to AI",
            "session_count": 5
        },
        {
            "id": 2,
            "user": {
                "id": 102,
                "name": "Mentor Two",
                "city": "New York"
            },
            "domains": ["Web Dev"],
            "bio": "Frontend expert.",
            "what_ill_discuss": "React and Angular",
            "session_count": 2
        }
    ]

    # Mock match_with_anthropic to return malformed JSON structure
    # The 'user_id' key is missing which will cause a KeyError in run_ai_match
    with patch("backend.services.match.match_with_anthropic") as mock_match:
        mock_match.return_value = {"matches": [{}]}

        # Call the function under test
        result = run_ai_match(student_goals, student_city, mentors, provider="anthropic")

        # Verify the exception was caught and fallback was used
        # We know fallback was used if it returns a non-empty list
        # We can also check if the fallback logic sorted the mentors correctly
        assert isinstance(result, list)
        assert len(result) == 2

        # In fallback logic, local mentors get +40 score
        # Mentor One is in Seattle (same as student) and has domain 'AI/ML' matching goals slightly
        assert result[0]["mentor_id"] == 1
        assert result[0]["score"] > result[1]["score"]

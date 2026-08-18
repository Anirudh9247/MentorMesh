import pytest
from unittest.mock import patch
from backend.services.match import run_ai_match

@pytest.fixture
def sample_mentors():
    return [
        {
            "id": 1,
            "user": {
                "id": 101,
                "name": "Alice",
                "city": "Seattle"
            },
            "domains": ["Web Development"],
            "bio": "Frontend expert",
            "what_ill_discuss": "React, Vue"
        },
        {
            "id": 2,
            "user": {
                "id": 102,
                "name": "Bob",
                "city": "New York"
            },
            "domains": ["AI/ML"],
            "bio": "Data Scientist",
            "what_ill_discuss": "Python, PyTorch"
        }
    ]

def test_run_ai_match_empty_mentors():
    result = run_ai_match("learn python", "Seattle", [])
    assert result == []

@patch("backend.services.match.match_with_anthropic")
def test_run_ai_match_anthropic_success(mock_anthropic, sample_mentors):
    mock_anthropic.return_value = {
        "matches": [
            {"user_id": 101, "match_score": 80, "match_reason": "Great match"},
            {"user_id": 102, "match_score": 60, "match_reason": "Good match"}
        ]
    }

    result = run_ai_match("learn react", "Seattle", sample_mentors, provider="anthropic")

    mock_anthropic.assert_called_once()
    assert len(result) == 2
    assert result[0]["user_id"] == 101
    assert result[0]["score"] == 80
    assert result[0]["reason"] == "Great match"

    assert result[1]["user_id"] == 102
    assert result[1]["score"] == 60
    assert result[1]["reason"] == "Good match"

@patch("backend.services.match.match_with_openai")
def test_run_ai_match_openai_success(mock_openai, sample_mentors):
    mock_openai.return_value = {
        "matches": [
            {"user_id": 102, "match_score": 90, "match_reason": "Perfect match for ML"}
        ]
    }

    result = run_ai_match("learn ML", "New York", sample_mentors, provider="openai")

    mock_openai.assert_called_once()
    assert len(result) == 2
    # The first should be 102 because score 90 > 50 (default for 101)
    assert result[0]["user_id"] == 102
    assert result[0]["score"] == 90
    assert result[0]["reason"] == "Perfect match for ML"

    # Missing mentor in AI response should get default score 50
    assert result[1]["user_id"] == 101
    assert result[1]["score"] == 50
    assert result[1]["reason"] == "Matches your general learning interests."

@patch("backend.services.match.match_with_anthropic")
@patch("backend.services.match.offline_match_fallback")
def test_run_ai_match_api_returns_none(mock_fallback, mock_anthropic, sample_mentors):
    mock_anthropic.return_value = None
    mock_fallback.return_value = [{"fallback": True}]

    result = run_ai_match("learn python", "Seattle", sample_mentors, provider="anthropic")

    mock_anthropic.assert_called_once()
    mock_fallback.assert_called_once_with("learn python", "Seattle", sample_mentors)
    assert result == [{"fallback": True}]

@patch("backend.services.match.match_with_openai")
@patch("backend.services.match.offline_match_fallback")
def test_run_ai_match_missing_matches_key(mock_fallback, mock_openai, sample_mentors):
    mock_openai.return_value = {"error": "Something went wrong"}
    mock_fallback.return_value = [{"fallback": True}]

    result = run_ai_match("learn python", "Seattle", sample_mentors, provider="openai")

    mock_openai.assert_called_once()
    mock_fallback.assert_called_once()
    assert result == [{"fallback": True}]

@patch("backend.services.match.match_with_anthropic")
@patch("backend.services.match.offline_match_fallback")
def test_run_ai_match_post_processing_exception(mock_fallback, mock_anthropic, sample_mentors):
    # This will cause a KeyError during post-processing because item is missing "user_id"



    mock_anthropic.return_value = {
        "matches": [
            {"invalid_key": 101, "match_score": 80}
        ]
    }
    mock_fallback.return_value = [{"fallback": True}]

    result = run_ai_match("learn python", "Seattle", sample_mentors, provider="anthropic")

    mock_anthropic.assert_called_once()
    mock_fallback.assert_called_once()
    assert result == [{"fallback": True}]

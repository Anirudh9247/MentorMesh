import pytest
from typing import List, Dict, Any
from backend.services.match import offline_match_fallback

def create_mock_mentor(mentor_id: int, city: str, domains: List[str], bio: str = "", session_count: int = 0) -> Dict[str, Any]:
    return {
        "id": mentor_id,
        "user": {
            "id": mentor_id * 10,
            "city": city
        },
        "domains": domains,
        "bio": bio,
        "session_count": session_count
    }

def test_offline_match_fallback_empty_mentors():
    """Test handling of empty mentor list."""
    results = offline_match_fallback("want to learn python", "Seattle", [])
    assert results == []

def test_offline_match_fallback_base_scoring_and_city_match():
    """Test base score of 30 and +40 city match boost."""
    mentors = [
        create_mock_mentor(1, "Seattle", []),       # Base 30 + 40 (City) = 70
        create_mock_mentor(2, "New York", [])       # Base 30
    ]

    results = offline_match_fallback("general learning", "Seattle", mentors)

    assert len(results) == 2
    assert results[0]["mentor_id"] == 1
    assert results[0]["score"] == 70
    assert "local match" in results[0]["reason"].lower()

    assert results[1]["mentor_id"] == 2
    assert results[1]["score"] == 30
    assert "shares expertise" in results[1]["reason"].lower()

def test_offline_match_fallback_domain_match_boost():
    """Test +15 score boost per matching domain."""
    mentors = [
        create_mock_mentor(1, "New York", ["Python", "Machine Learning"]) # Base 30 + 15 + 15 = 60
    ]

    # "python" and "machine learning" are in goals_lower
    results = offline_match_fallback("i want to learn python and machine learning", "Seattle", mentors)

    assert len(results) == 1
    assert results[0]["score"] == 60
    assert "remote matching" in results[0]["reason"].lower()

def test_offline_match_fallback_bio_keyword_match_boost():
    """Test +2 score boost for matching words in bio (length > 4)."""
    mentors = [
        # "kubernetes" is > 4 chars and in bio
        # "docker" is > 4 chars and in bio
        # Base 30 + 2 (kubernetes) + 2 (docker) = 34
        create_mock_mentor(1, "New York", [], bio="I have experience with kubernetes and docker containers.")
    ]

    results = offline_match_fallback("need help with kubernetes and docker deployment", "Seattle", mentors)

    assert len(results) == 1
    assert results[0]["score"] == 34

def test_offline_match_fallback_score_cap():
    """Test that score is capped at 99."""
    mentors = [
        create_mock_mentor(
            1,
            "Seattle", # +40
            ["python", "django", "react", "postgresql", "docker", "kubernetes"], # +90
            bio="expert developer"
        )
    ]

    # Total potential score: 30(base) + 40(city) + 90(domains) = 160
    results = offline_match_fallback("python django react postgresql docker kubernetes", "Seattle", mentors)

    assert len(results) == 1
    assert results[0]["score"] == 99

def test_offline_match_fallback_sorting_tie_breaker():
    """Test that ties in score are broken by session_count descending."""
    mentors = [
        create_mock_mentor(1, "Seattle", [], session_count=5),  # Score 70, Sessions 5
        create_mock_mentor(2, "Seattle", [], session_count=10), # Score 70, Sessions 10
        create_mock_mentor(3, "Seattle", [], session_count=2)   # Score 70, Sessions 2
    ]

    results = offline_match_fallback("general learning", "Seattle", mentors)

    assert len(results) == 3
    # Expected order: Mentor 2 (10 sessions), Mentor 1 (5 sessions), Mentor 3 (2 sessions)
    assert results[0]["mentor_id"] == 2
    assert results[1]["mentor_id"] == 1
    assert results[2]["mentor_id"] == 3

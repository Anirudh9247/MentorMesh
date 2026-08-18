import pytest
from backend.services.match import offline_match_fallback

def test_offline_match_fallback_local_city_boost():
    student_goals = "python web development"
    student_city = "Seattle"

    mentors = [
        {
            "id": 1,
            "user": {"id": 101, "city": "Seattle"},
            "domains": ["Python"],
            "bio": "I love python",
            "session_count": 0
        },
        {
            "id": 2,
            "user": {"id": 102, "city": "New York"},
            "domains": ["Python"],
            "bio": "I love python",
            "session_count": 0
        }
    ]

    res = offline_match_fallback(student_goals, student_city, mentors)
    assert len(res) == 2

    # Seattle mentor should score higher due to locality boost (+40)
    assert res[0]["mentor_id"] == 1
    assert res[0]["score"] == 87 # 30(base) + 40(city) + 15(domain) + 2(bio) = 87
    assert res[1]["mentor_id"] == 2
    assert res[1]["score"] == 47 # 30(base) + 0(city) + 15(domain) + 2(bio) = 47

def test_offline_match_fallback_domains_and_bio():
    student_goals = "machine learning and deep learning"
    student_city = "Seattle"

    mentors = [
        {
            "id": 1,
            "user": {"id": 101, "city": "New York"},
            "domains": ["Machine Learning", "Deep Learning"], # +30
            "bio": "Expert in learning new things", # +2 for "learning" x 2 (learning is in goals twice) = +4
            "session_count": 0
        }
    ]

    res = offline_match_fallback(student_goals, student_city, mentors)
    assert res[0]["score"] == 64 # 30 + 30 + 4 = 64

def test_offline_match_fallback_cap_score():
    student_goals = "python web machine learning cloud aws react"
    student_city = "Seattle"

    mentors = [
        {
            "id": 1,
            "user": {"id": 101, "city": "Seattle"}, # +40
            "domains": ["Python", "Web", "Machine Learning", "Cloud", "AWS", "React"], # +90
            "bio": "python web machine learning cloud aws react", # + lots
            "session_count": 0
        }
    ]

    res = offline_match_fallback(student_goals, student_city, mentors)
    assert res[0]["score"] == 99 # Capped at 99

def test_offline_match_fallback_sorting():
    student_goals = "python"
    student_city = "Seattle"

    mentors = [
        {
            "id": 1,
            "user": {"id": 101, "city": "New York"},
            "domains": ["Python"],
            "bio": "",
            "session_count": 10
        },
        {
            "id": 2,
            "user": {"id": 102, "city": "New York"},
            "domains": ["Python"],
            "bio": "",
            "session_count": 20
        }
    ]

    res = offline_match_fallback(student_goals, student_city, mentors)
    assert len(res) == 2
    # Both have the same score (45), so sort by session_count desc
    assert res[0]["mentor_id"] == 2
    assert res[1]["mentor_id"] == 1

def test_offline_match_fallback_empty_mentors():
    res = offline_match_fallback("python", "Seattle", [])
    assert res == []

def test_offline_match_fallback_case_insensitive_and_strip():
    student_goals = " PYTHON "
    student_city = "  Seattle  "

    mentors = [
        {
            "id": 1,
            "user": {"id": 101, "city": "SEATTLE"},
            "domains": ["python"],
            "bio": "",
            "session_count": 0
        }
    ]

    res = offline_match_fallback(student_goals, student_city, mentors)
    assert res[0]["score"] == 85 # 30 + 40 + 15

def test_offline_match_fallback_dynamic_reasons():
    student_goals = "python"
    student_city = "Seattle"

    mentors = [
        {
            "id": 1,
            "user": {"id": 101, "city": "Seattle"},
            "domains": ["Python"],
            "bio": "",
            "session_count": 0
        },
        {
            "id": 2,
            "user": {"id": 102, "city": "Seattle"},
            "domains": [],
            "bio": "",
            "session_count": 0
        },
        {
            "id": 3,
            "user": {"id": 103, "city": "New York"},
            "domains": ["Python"],
            "bio": "",
            "session_count": 0
        },
        {
            "id": 4,
            "user": {"id": 104, "city": "New York"},
            "domains": [],
            "bio": "",
            "session_count": 0
        }
    ]

    res = offline_match_fallback(student_goals, student_city, mentors)

    # 1. Local and matched domains
    m1 = next(m for m in res if m["mentor_id"] == 1)
    assert "Excellent local match in seattle" in m1["reason"] or "Excellent local match in Seattle" in m1["reason"]

    # 2. Local only
    m2 = next(m for m in res if m["mentor_id"] == 2)
    assert "Great local match in seattle" in m2["reason"] or "Great local match in Seattle" in m2["reason"]

    # 3. Domains only
    m3 = next(m for m in res if m["mentor_id"] == 3)
    assert "Remote matching expertise in Python" in m3["reason"]

    # 4. Neither
    m4 = next(m for m in res if m["mentor_id"] == 4)
    assert "Shares expertise matching your interests" in m4["reason"]

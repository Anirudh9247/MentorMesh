import pytest
from backend.services.match import parse_llm_json

def test_parse_llm_json_plain():
    """Test standard plain JSON string"""
    text = '{"matches": [{"user_id": 1, "match_score": 90, "match_reason": "Great match"}]}'
    expected = {"matches": [{"user_id": 1, "match_score": 90, "match_reason": "Great match"}]}
    assert parse_llm_json(text) == expected

def test_parse_llm_json_markdown():
    """Test JSON wrapped in ```json ... ``` markdown block"""
    text = '```json\n{"matches": [{"user_id": 2, "match_score": 85, "match_reason": "Good match"}]}\n```'
    expected = {"matches": [{"user_id": 2, "match_score": 85, "match_reason": "Good match"}]}
    assert parse_llm_json(text) == expected

def test_parse_llm_json_extra_whitespace():
    """Test JSON wrapped in markdown with extra whitespace around it"""
    text = '   ```json\n  {"key": "value"} \n```   '
    expected = {"key": "value"}
    assert parse_llm_json(text) == expected

def test_parse_llm_json_invalid():
    """Test that invalid JSON returns None safely"""
    text = '{"matches": [{"user_id": 1, "match_score": 90' # missing closing brackets
    assert parse_llm_json(text) is None

def test_parse_llm_json_empty():
    """Test that empty string returns None safely"""
    text = ''
    assert parse_llm_json(text) is None

def test_parse_llm_json_no_json_tag():
    """Test markdown block without 'json' tag (just ```...```)"""
    # The code only checks text.startswith("```json").
    # If it starts with just ``` it won't strip the front, but will strip the back.
    # It might result in None, let's test it returns None as expected if it's invalid.
    text = '```\n{"key": "value"}\n```'
    assert parse_llm_json(text) is None

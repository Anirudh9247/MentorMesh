import pytest
from unittest.mock import patch, MagicMock

import backend.services.match as match_service
from backend.services.match import match_with_anthropic

def test_match_with_anthropic_missing_api_key(monkeypatch):
    monkeypatch.setattr(match_service, 'ANTHROPIC_API_KEY', None)

    result = match_with_anthropic("I want to learn Python", "Seattle", "[]")

    assert result is None

def test_match_with_anthropic_success(monkeypatch):
    monkeypatch.setattr(match_service, 'ANTHROPIC_API_KEY', "fake-api-key")

    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.content = [MagicMock(text='{"matches": [{"user_id": 1, "match_score": 90, "match_reason": "Great match!"}]}')]
    mock_client.messages.create.return_value = mock_response

    # Mock the anthropic.Anthropic instantiation
    with patch('anthropic.Anthropic', return_value=mock_client):
        result = match_with_anthropic("I want to learn Python", "Seattle", '[{"user": {"id": 1}}]')

    assert result == {"matches": [{"user_id": 1, "match_score": 90, "match_reason": "Great match!"}]}

def test_match_with_anthropic_api_failure(monkeypatch):
    monkeypatch.setattr(match_service, 'ANTHROPIC_API_KEY', "fake-api-key")

    mock_client = MagicMock()
    mock_client.messages.create.side_effect = Exception("API Error")

    with patch('anthropic.Anthropic', return_value=mock_client):
        result = match_with_anthropic("I want to learn Python", "Seattle", '[{"user": {"id": 1}}]')

    assert result is None

if __name__ == "__main__":
    pytest.main(["-v", "test_match.py"])

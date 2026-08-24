# Amaris Mathematics Hub (AMH) - Redis Caching & Invalidation Test Suite

import time
import pytest

class MockRedisCache:
    def __init__(self):
        self.store = {}
        self.expirations = {}

    def setex(self, key, ttl_seconds, value):
        self.store[key] = value
        self.expirations[key] = time.time() + ttl_seconds

    def get(self, key):
        if key not in self.store:
            return None
        if time.time() > self.expirations.get(key, 0):
            del self.store[key]
            del self.expirations[key]
            return None
        return self.store[key]

    def delete(self, key):
        self.store.pop(key, None)
        self.expirations.pop(key, None)

    def flushall(self):
        self.store.clear()
        self.expirations.clear()

@pytest.fixture
def cache():
    return MockRedisCache()

def test_cache_creation_and_hit(cache):
    key = "dashboard:std_101"
    data = '{"mock_exam_score": 88, "grade": "Grade 12"}'
    cache.setex(key, 300, data)
    
    cached_val = cache.get(key)
    assert cached_val is not None
    assert "88" in cached_val

def test_cache_expiration(cache):
    key = "api:courses_list"
    data = '["Calculus", "Trigonometry"]'
    cache.setex(key, 0.1, data) # Expires in 100ms
    
    assert cache.get(key) == data
    time.sleep(0.15)
    assert cache.get(key) is None # Expired

def test_cache_invalidation_on_homework_submit(cache):
    student_key = "dashboard:std_101"
    cache.setex(student_key, 300, '{"assignments_pending": 2}')
    
    # Simulate homework submit invalidation
    cache.delete(student_key)
    
    assert cache.get(student_key) is None # Cache invalidated successfully

import time
from backend.services.match import offline_match_fallback

def run_benchmark():
    student_goals = "I want to learn machine learning, data science, and deep learning. I am looking for someone to guide me through neural networks and AI models." * 10
    student_city = "Seattle"
    mentors = [
        {
            "user": {"id": i, "city": "Seattle" if i % 2 == 0 else "New York"},
            "domains": ["Machine Learning", "AI", "Data Science"],
            "bio": "I am an experienced data scientist working on machine learning and deep learning models for the past 10 years. " * 5,
            "id": i
        } for i in range(5000)
    ]

    start_time = time.time()
    for _ in range(5):
        offline_match_fallback(student_goals, student_city, mentors)
    end_time = time.time()

    print(f"Time taken: {end_time - start_time:.4f} seconds")

if __name__ == "__main__":
    run_benchmark()
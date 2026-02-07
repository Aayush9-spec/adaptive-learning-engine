"""Seed database with sample data"""
from app.core.database import SessionLocal, engine
from app.core.security import get_password_hash
from app.models.user import User, StudentProfile, Class
from app.models.knowledge_graph import Topic, TopicPrerequisite, Concept, Question
from app.models import Base
import json

def seed_database():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Create demo users
        print("Creating users...")
        student_user = User(
            username="demo_student",
            password_hash=get_password_hash("password123"),
            role="student"
        )
        db.add(student_user)
        db.commit()
        db.refresh(student_user)
        
        # Create student profile
        student_profile = StudentProfile(
            user_id=student_user.id,
            grade=12,
            target_exam="CBSE",
            available_hours_per_day=4.0
        )
        db.add(student_profile)
        db.commit()
        
        # Create topics
        print("Creating topics...")
        topics_data = [
            {"name": "Algebra Basics", "weightage": 15.0, "hours": 3.0, "desc": "Fundamental algebraic operations"},
            {"name": "Linear Equations", "weightage": 12.0, "hours": 2.5, "desc": "Solving linear equations"},
            {"name": "Quadratic Equations", "weightage": 18.0, "hours": 4.0, "desc": "Solving quadratic equations"},
            {"name": "Trigonometry Basics", "weightage": 10.0, "hours": 3.0, "desc": "Basic trigonometric ratios"},
            {"name": "Trigonometric Identities", "weightage": 18.0, "hours": 4.5, "desc": "Trigonometric identities and proofs"},
            {"name": "Calculus - Limits", "weightage": 15.0, "hours": 5.0, "desc": "Limits and continuity"},
            {"name": "Calculus - Derivatives", "weightage": 20.0, "hours": 6.0, "desc": "Differentiation"},
            {"name": "Geometry - Triangles", "weightage": 12.0, "hours": 3.0, "desc": "Properties of triangles"},
            {"name": "Geometry - Circles", "weightage": 14.0, "hours": 3.5, "desc": "Properties of circles"},
            {"name": "Statistics", "weightage": 10.0, "hours": 2.5, "desc": "Basic statistics"},
        ]
        
        topics = []
        for t_data in topics_data:
            topic = Topic(
                name=t_data["name"],
                exam_weightage=t_data["weightage"],
                estimated_hours=t_data["hours"],
                description=t_data["desc"]
            )
            db.add(topic)
            topics.append(topic)
        
        db.commit()
        
        # Create prerequisites
        print("Creating prerequisites...")
        prerequisites = [
            (2, 1, 60.0),  # Linear Equations requires Algebra Basics
            (3, 1, 60.0),  # Quadratic Equations requires Algebra Basics
            (5, 4, 60.0),  # Trig Identities requires Trig Basics
            (7, 6, 60.0),  # Derivatives requires Limits
        ]
        
        for topic_id, prereq_id, min_mastery in prerequisites:
            prereq = TopicPrerequisite(
                topic_id=topic_id,
                prerequisite_topic_id=prereq_id,
                minimum_mastery=min_mastery
            )
            db.add(prereq)
        
        db.commit()
        
        # Create concepts
        print("Creating concepts...")
        concepts_data = [
            (1, "Addition and Subtraction"),
            (1, "Multiplication and Division"),
            (2, "Solving for x"),
            (2, "Word Problems"),
            (3, "Factoring"),
            (3, "Quadratic Formula"),
            (4, "Sine and Cosine"),
            (4, "Tangent"),
            (5, "Pythagorean Identity"),
            (5, "Sum and Difference Formulas"),
        ]
        
        concepts = []
        for topic_id, concept_name in concepts_data:
            concept = Concept(
                topic_id=topic_id,
                name=concept_name,
                description=f"Concept: {concept_name}"
            )
            db.add(concept)
            concepts.append(concept)
        
        db.commit()
        
        # Create sample questions
        print("Creating questions...")
        questions_data = [
            (1, "What is 5 + 3?", "mcq", ["6", "7", "8", "9"], "8", "easy", 60),
            (1, "What is 12 - 7?", "mcq", ["3", "4", "5", "6"], "5", "easy", 60),
            (2, "What is 6 × 7?", "mcq", ["40", "42", "44", "48"], "42", "easy", 60),
            (3, "Solve: 2x + 5 = 13", "numerical", None, "4", "medium", 120),
            (4, "If 3x - 7 = 14, what is x?", "numerical", None, "7", "medium", 120),
            (5, "Factor: x² - 5x + 6", "mcq", ["(x-2)(x-3)", "(x-1)(x-6)", "(x+2)(x+3)", "(x-6)(x+1)"], "(x-2)(x-3)", "medium", 180),
            (6, "Solve using quadratic formula: x² - 4x + 3 = 0", "mcq", ["x=1,3", "x=2,2", "x=-1,-3", "x=0,4"], "x=1,3", "hard", 240),
            (7, "What is sin(30°)?", "mcq", ["0.5", "0.707", "0.866", "1"], "0.5", "easy", 90),
            (8, "What is cos(60°)?", "mcq", ["0.5", "0.707", "0.866", "1"], "0.5", "easy", 90),
            (9, "Prove: sin²θ + cos²θ = ?", "mcq", ["0", "1", "2", "θ"], "1", "medium", 180),
        ]
        
        for concept_id, q_text, q_type, options, answer, difficulty, time in questions_data:
            question = Question(
                concept_id=concept_id,
                question_text=q_text,
                question_type=q_type,
                options=json.dumps(options) if options else None,
                correct_answer=answer,
                difficulty=difficulty,
                expected_time_seconds=time
            )
            db.add(question)
        
        db.commit()
        
        print("✅ Database seeded successfully!")
        print("\nDemo credentials:")
        print("Username: demo_student")
        print("Password: password123")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

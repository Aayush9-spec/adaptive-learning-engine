"""
Seed database with sample data for testing and demonstration.
Creates topics, concepts, questions, and sample students with performance data.
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, init_db
from app.models.user import User, StudentProfile
from app.models.knowledge_graph import Topic, Concept, Question, TopicPrerequisite
from app.models.performance import QuestionAttempt, ConceptMastery
from app.services.auth_service import AuthService
from datetime import datetime, timedelta
import random


def seed_topics_and_concepts(db: Session):
    """Create sample topics with prerequisite relationships"""
    print("Creating topics and concepts...")
    
    # Mathematics topics
    topics_data = [
        # Foundation topics (no prerequisites)
        {"name": "Basic Algebra", "weightage": 15.0, "hours": 8.0, "prereqs": []},
        {"name": "Number Systems", "weightage": 10.0, "hours": 6.0, "prereqs": []},
        
        # Intermediate topics
        {"name": "Linear Equations", "weightage": 12.0, "hours": 10.0, "prereqs": [1]},  # Needs Basic Algebra
        {"name": "Quadratic Equations", "weightage": 15.0, "hours": 12.0, "prereqs": [1, 3]},  # Needs Algebra + Linear
        {"name": "Trigonometry Basics", "weightage": 12.0, "hours": 10.0, "prereqs": [2]},  # Needs Number Systems
        
        # Advanced topics
        {"name": "Calculus - Differentiation", "weightage": 18.0, "hours": 15.0, "prereqs": [3, 4]},
        {"name": "Calculus - Integration", "weightage": 18.0, "hours": 15.0, "prereqs": [6]},  # Needs Differentiation
        
        # Physics topics
        {"name": "Mechanics - Kinematics", "weightage": 14.0, "hours": 10.0, "prereqs": [1]},
        {"name": "Mechanics - Dynamics", "weightage": 16.0, "hours": 12.0, "prereqs": [8]},
        {"name": "Electricity Basics", "weightage": 12.0, "hours": 10.0, "prereqs": [1]},
    ]
    
    topics = []
    for i, topic_data in enumerate(topics_data, 1):
        topic = Topic(
            name=topic_data["name"],
            exam_weightage=topic_data["weightage"],
            estimated_hours=topic_data["hours"]
        )
        db.add(topic)
        db.flush()
        topics.append(topic)
        
        # Add prerequisites
        for prereq_idx in topic_data["prereqs"]:
            prereq = TopicPrerequisite(
                topic_id=topic.id,
                prerequisite_topic_id=topics[prereq_idx - 1].id
            )
            db.add(prereq)
        
        # Create 3-5 concepts per topic
        num_concepts = random.randint(3, 5)
        for j in range(num_concepts):
            concept = Concept(
                topic_id=topic.id,
                name=f"{topic.name} - Concept {j+1}"
            )
            db.add(concept)
    
    db.commit()
    print(f"✓ Created {len(topics)} topics")
    return topics


def seed_questions(db: Session):
    """Create sample questions for all concepts"""
    print("Creating questions...")
    
    concepts = db.query(Concept).all()
    question_count = 0
    
    question_types = ["mcq", "numerical", "true_false"]
    difficulties = ["easy", "medium", "hard"]
    
    for concept in concepts:
        # Create 5-10 questions per concept
        num_questions = random.randint(5, 10)
        
        for i in range(num_questions):
            q_type = random.choice(question_types)
            difficulty = random.choice(difficulties)
            
            if q_type == "mcq":
                correct_answer = random.choice(["A", "B", "C", "D"])
                question_text = f"Multiple choice question {i+1} for {concept.name}?"
            elif q_type == "numerical":
                correct_answer = str(random.randint(1, 100))
                question_text = f"Calculate the value for {concept.name} problem {i+1}."
            else:  # true_false
                correct_answer = random.choice(["True", "False"])
                question_text = f"True or False: Statement about {concept.name} #{i+1}."
            
            expected_time = {
                "easy": random.randint(30, 60),
                "medium": random.randint(60, 120),
                "hard": random.randint(120, 300)
            }[difficulty]
            
            question = Question(
                concept_id=concept.id,
                question_text=question_text,
                question_type=q_type,
                correct_answer=correct_answer,
                difficulty=difficulty,
                expected_time_seconds=expected_time
            )
            db.add(question)
            question_count += 1
    
    db.commit()
    print(f"✓ Created {question_count} questions")


def seed_students(db: Session):
    """Create sample students with varied performance"""
    print("Creating sample students...")
    
    students = []
    
    # Create 5 sample students
    for i in range(1, 6):
        try:
            exam_date = datetime.utcnow().date() + timedelta(days=random.randint(30, 180))
            user = AuthService.register_user(
                db=db,
                username=f"student{i}",
                password=f"password{i}",
                role="student",
                grade=random.randint(9, 12),
                target_exam="Board Exam",
                exam_date=exam_date,
                available_hours_per_day=random.uniform(2.0, 6.0)
            )
            
            # Get student profile (should be created automatically)
            db.refresh(user)
            if user.student_profile:
                students.append(user.student_profile)
        except Exception as e:
            print(f"Warning: Could not create student{i}: {e}")
            db.rollback()
    
    print(f"✓ Created {len(students)} students")
    return students


def seed_performance_data(db: Session, students: list):
    """Create sample performance data for students"""
    print("Creating performance data...")
    
    questions = db.query(Question).all()
    attempt_count = 0
    
    for student in students:
        # Each student attempts 20-50 random questions
        num_attempts = random.randint(20, 50)
        attempted_questions = random.sample(questions, min(num_attempts, len(questions)))
        
        for question in attempted_questions:
            # Simulate performance (70% accuracy on average)
            is_correct = random.random() < 0.7
            
            # Generate answer
            if is_correct:
                answer = question.correct_answer
            else:
                # Generate wrong answer
                if question.question_type == "mcq":
                    options = ["A", "B", "C", "D"]
                    options.remove(question.correct_answer)
                    answer = random.choice(options)
                elif question.question_type == "numerical":
                    answer = str(int(question.correct_answer) + random.randint(-10, 10))
                else:
                    answer = "False" if question.correct_answer == "True" else "True"
            
            # Time taken (varies around expected time)
            time_taken = question.expected_time_seconds * random.uniform(0.7, 1.5)
            
            # Confidence (higher if correct)
            confidence = random.randint(3, 5) if is_correct else random.randint(1, 3)
            
            attempt = QuestionAttempt(
                student_id=student.id,
                question_id=question.id,
                answer=answer,
                is_correct=is_correct,
                time_taken_seconds=time_taken,
                confidence=confidence,
                timestamp=datetime.utcnow() - timedelta(days=random.randint(0, 30))
            )
            db.add(attempt)
            attempt_count += 1
    
    db.commit()
    print(f"✓ Created {attempt_count} question attempts")
    
    # Calculate mastery scores
    print("Calculating mastery scores...")
    from app.services.performance_tracker import PerformanceTracker
    
    concepts = db.query(Concept).all()
    for student in students:
        for concept in concepts:
            tracker = PerformanceTracker(db)
            try:
                tracker.calculate_mastery_score(student.id, concept.id)
            except:
                pass  # Skip if no attempts for this concept
    
    print("✓ Mastery scores calculated")


def seed_teacher(db: Session):
    """Create a sample teacher account"""
    print("Creating teacher account...")
    
    try:
        teacher = AuthService.register_user(
            db=db,
            username="teacher1",
            password="teacher123",
            role="teacher"
        )
        print(f"✓ Created teacher account: teacher1 / teacher123")
    except Exception as e:
        print(f"Warning: Could not create teacher: {e}")


def main():
    """Main seeding function"""
    print("\n" + "="*50)
    print("SEEDING DATABASE WITH SAMPLE DATA")
    print("="*50 + "\n")
    
    # Initialize database
    init_db()
    db = SessionLocal()
    
    try:
        # Seed in order
        topics = seed_topics_and_concepts(db)
        seed_questions(db)
        students = seed_students(db)
        seed_teacher(db)
        seed_performance_data(db, students)
        
        print("\n" + "="*50)
        print("✓ DATABASE SEEDING COMPLETE!")
        print("="*50)
        print("\nSample Accounts:")
        print("  Students: student1-student5 (password: password1-password5)")
        print("  Teacher: teacher1 (password: teacher123)")
        print("\nYou can now test the API with these accounts.")
        
    except Exception as e:
        print(f"\n✗ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()

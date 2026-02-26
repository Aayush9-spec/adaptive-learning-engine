"""Initial schema with all tables

Revision ID: 001
Revises: 
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    # Create classes table
    op.create_table(
        'classes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('teacher_id', sa.Integer(), nullable=True),
        sa.Column('grade', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['teacher_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_classes_id'), 'classes', ['id'], unique=False)

    # Create student_profiles table
    op.create_table(
        'student_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('grade', sa.Integer(), nullable=False),
        sa.Column('target_exam', sa.String(), nullable=False),
        sa.Column('exam_date', sa.DateTime(), nullable=True),
        sa.Column('available_hours_per_day', sa.Float(), nullable=True),
        sa.Column('class_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['class_id'], ['classes.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_student_profiles_id'), 'student_profiles', ['id'], unique=False)

    # Create topics table
    op.create_table(
        'topics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('parent_id', sa.Integer(), nullable=True),
        sa.Column('exam_weightage', sa.Float(), nullable=False),
        sa.Column('estimated_hours', sa.Float(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['parent_id'], ['topics.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_topics_id'), 'topics', ['id'], unique=False)

    # Create topic_prerequisites table
    op.create_table(
        'topic_prerequisites',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('topic_id', sa.Integer(), nullable=False),
        sa.Column('prerequisite_topic_id', sa.Integer(), nullable=False),
        sa.Column('minimum_mastery', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['prerequisite_topic_id'], ['topics.id'], ),
        sa.ForeignKeyConstraint(['topic_id'], ['topics.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_topic_prerequisites_id'), 'topic_prerequisites', ['id'], unique=False)

    # Create concepts table
    op.create_table(
        'concepts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('topic_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['topic_id'], ['topics.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_concepts_id'), 'concepts', ['id'], unique=False)

    # Create questions table
    op.create_table(
        'questions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('concept_id', sa.Integer(), nullable=False),
        sa.Column('question_text', sa.Text(), nullable=False),
        sa.Column('question_type', sa.String(), nullable=False),
        sa.Column('options', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('correct_answer', sa.String(), nullable=False),
        sa.Column('difficulty', sa.String(), nullable=False),
        sa.Column('expected_time_seconds', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['concept_id'], ['concepts.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_questions_id'), 'questions', ['id'], unique=False)

    # Create question_attempts table
    op.create_table(
        'question_attempts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('question_id', sa.Integer(), nullable=False),
        sa.Column('answer', sa.String(), nullable=False),
        sa.Column('is_correct', sa.Boolean(), nullable=False),
        sa.Column('time_taken_seconds', sa.Float(), nullable=False),
        sa.Column('confidence', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
        sa.Column('synced', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['question_id'], ['questions.id'], ),
        sa.ForeignKeyConstraint(['student_id'], ['student_profiles.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_question_attempts_id'), 'question_attempts', ['id'], unique=False)
    op.create_index(op.f('ix_question_attempts_question_id'), 'question_attempts', ['question_id'], unique=False)
    op.create_index(op.f('ix_question_attempts_student_id'), 'question_attempts', ['student_id'], unique=False)
    op.create_index(op.f('ix_question_attempts_timestamp'), 'question_attempts', ['timestamp'], unique=False)
    op.create_index('idx_attempts_student_timestamp', 'question_attempts', ['student_id', 'timestamp'], unique=False)

    # Create concept_mastery table
    op.create_table(
        'concept_mastery',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('concept_id', sa.Integer(), nullable=False),
        sa.Column('total_attempts', sa.Integer(), nullable=True),
        sa.Column('correct_attempts', sa.Integer(), nullable=True),
        sa.Column('avg_time_seconds', sa.Float(), nullable=True),
        sa.Column('avg_confidence', sa.Float(), nullable=True),
        sa.Column('mastery_score', sa.Float(), nullable=True),
        sa.Column('last_updated', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['concept_id'], ['concepts.id'], ),
        sa.ForeignKeyConstraint(['student_id'], ['student_profiles.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_concept_mastery_concept_id'), 'concept_mastery', ['concept_id'], unique=False)
    op.create_index(op.f('ix_concept_mastery_id'), 'concept_mastery', ['id'], unique=False)
    op.create_index(op.f('ix_concept_mastery_student_id'), 'concept_mastery', ['student_id'], unique=False)
    op.create_index('idx_mastery_student_concept', 'concept_mastery', ['student_id', 'concept_id'], unique=True)

    # Create study_plans table
    op.create_table(
        'study_plans',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('plan_type', sa.String(), nullable=False),
        sa.Column('start_date', sa.DateTime(), nullable=False),
        sa.Column('end_date', sa.DateTime(), nullable=False),
        sa.Column('topics', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['student_id'], ['student_profiles.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_study_plans_id'), 'study_plans', ['id'], unique=False)

    # Create sync_operations table
    op.create_table(
        'sync_operations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('operation_type', sa.String(), nullable=False),
        sa.Column('table_name', sa.String(), nullable=False),
        sa.Column('record_id', sa.Integer(), nullable=False),
        sa.Column('data', sa.String(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
        sa.Column('synced', sa.Boolean(), nullable=True),
        sa.Column('retry_count', sa.Integer(), nullable=True),
        sa.Column('last_error', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_sync_operations_id'), 'sync_operations', ['id'], unique=False)
    op.create_index(op.f('ix_sync_operations_timestamp'), 'sync_operations', ['timestamp'], unique=False)
    op.create_index(op.f('ix_sync_operations_synced'), 'sync_operations', ['synced'], unique=False)
    op.create_index('idx_sync_pending', 'sync_operations', ['synced', 'timestamp'], unique=False)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_index('idx_sync_pending', table_name='sync_operations')
    op.drop_index(op.f('ix_sync_operations_synced'), table_name='sync_operations')
    op.drop_index(op.f('ix_sync_operations_timestamp'), table_name='sync_operations')
    op.drop_index(op.f('ix_sync_operations_id'), table_name='sync_operations')
    op.drop_table('sync_operations')

    op.drop_index(op.f('ix_study_plans_id'), table_name='study_plans')
    op.drop_table('study_plans')

    op.drop_index('idx_mastery_student_concept', table_name='concept_mastery')
    op.drop_index(op.f('ix_concept_mastery_student_id'), table_name='concept_mastery')
    op.drop_index(op.f('ix_concept_mastery_id'), table_name='concept_mastery')
    op.drop_index(op.f('ix_concept_mastery_concept_id'), table_name='concept_mastery')
    op.drop_table('concept_mastery')

    op.drop_index('idx_attempts_student_timestamp', table_name='question_attempts')
    op.drop_index(op.f('ix_question_attempts_timestamp'), table_name='question_attempts')
    op.drop_index(op.f('ix_question_attempts_student_id'), table_name='question_attempts')
    op.drop_index(op.f('ix_question_attempts_question_id'), table_name='question_attempts')
    op.drop_index(op.f('ix_question_attempts_id'), table_name='question_attempts')
    op.drop_table('question_attempts')

    op.drop_index(op.f('ix_questions_id'), table_name='questions')
    op.drop_table('questions')

    op.drop_index(op.f('ix_concepts_id'), table_name='concepts')
    op.drop_table('concepts')

    op.drop_index(op.f('ix_topic_prerequisites_id'), table_name='topic_prerequisites')
    op.drop_table('topic_prerequisites')

    op.drop_index(op.f('ix_topics_id'), table_name='topics')
    op.drop_table('topics')

    op.drop_index(op.f('ix_student_profiles_id'), table_name='student_profiles')
    op.drop_table('student_profiles')

    op.drop_index(op.f('ix_classes_id'), table_name='classes')
    op.drop_table('classes')

    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')

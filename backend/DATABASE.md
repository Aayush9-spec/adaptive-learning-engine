# Database Setup and Migrations

This document describes the database setup, schema, and migration process for the Adaptive Learning Decision Engine.

## Database Architecture

The system uses a **dual-database strategy** for offline-first functionality:

1. **PostgreSQL** - Cloud database for persistent storage and multi-device sync
2. **SQLite** - Local database for offline access and queued operations

## Database Schema

### Tables

#### Users and Profiles
- **users** - User authentication and role management
- **student_profiles** - Student-specific data (grade, exam date, available hours)
- **classes** - Class groupings for teacher analytics

#### Knowledge Graph
- **topics** - Syllabus topics with hierarchy and weightage
- **topic_prerequisites** - Prerequisite relationships between topics
- **concepts** - Learning units within topics
- **questions** - Practice questions for each concept

#### Performance Tracking
- **question_attempts** - Student answers with timing and confidence
- **concept_mastery** - Aggregated mastery scores per concept
- **study_plans** - Generated study schedules

#### Synchronization
- **sync_operations** - Queue for offline operations to sync

### Indexes

Performance-critical indexes are created for:
- `idx_attempts_student_timestamp` - Fast student attempt queries
- `idx_mastery_student_concept` - Unique mastery records per student/concept
- `idx_sync_pending` - Efficient sync queue processing
- Username and ID indexes on all primary tables

## Migration Management

### Using Alembic (Recommended)

Alembic is configured for database version control and migrations.

#### Initial Setup

The initial migration (`001_initial_schema.py`) creates all tables with proper indexes.

```bash
# Run migrations (inside Docker container)
docker-compose exec backend alembic upgrade head

# Or using the Makefile
make migrate
```

#### Creating New Migrations

When you modify models, create a new migration:

```bash
# Auto-generate migration from model changes
docker-compose exec backend alembic revision --autogenerate -m "add user email field"

# Or create an empty migration to write manually
docker-compose exec backend alembic revision -m "add custom index"
```

#### Migration Commands

```bash
# Upgrade to latest version
docker-compose exec backend alembic upgrade head

# Upgrade by one version
docker-compose exec backend alembic upgrade +1

# Downgrade by one version
docker-compose exec backend alembic downgrade -1

# Show current version
docker-compose exec backend alembic current

# Show migration history
docker-compose exec backend alembic history

# Show SQL without executing
docker-compose exec backend alembic upgrade head --sql
```

### Using Helper Scripts

#### migrate.py

A Python helper script for easier migration management:

```bash
# Inside container
python migrate.py upgrade
python migrate.py downgrade
python migrate.py current
python migrate.py history
python migrate.py autogenerate "description"
```

#### init_db.py

Direct database initialization (bypasses migrations):

```bash
# Initialize both PostgreSQL and SQLite
docker-compose exec backend python init_db.py
```

**Note:** This is useful for development but Alembic migrations are recommended for production.

## Configuration

### Environment Variables

Database connections are configured via environment variables:

```bash
# PostgreSQL (Cloud)
DATABASE_URL=postgresql://user:password@host:port/database

# SQLite (Local)
SQLITE_DATABASE_URL=sqlite:///./local.db
```

### Connection Pools

PostgreSQL uses connection pooling for performance:
- Pool size: 10 connections
- Max overflow: 20 connections
- Pre-ping enabled for connection health checks

SQLite configuration:
- `check_same_thread=False` for FastAPI async support
- Pre-ping enabled

## Database Access in Code

### Getting Database Sessions

```python
from app.core.database import get_db, get_sqlite_db

# PostgreSQL session
def some_endpoint(db: Session = Depends(get_db)):
    # Use db for cloud operations
    pass

# SQLite session (for offline operations)
def offline_endpoint(db: Session = Depends(get_sqlite_db)):
    # Use db for local operations
    pass
```

### Dual-Database Pattern

For offline-first functionality:

1. Write to SQLite immediately (always available)
2. Queue sync operation in `sync_operations` table
3. When online, sync to PostgreSQL
4. Mark sync operation as complete

## Backup and Restore

### PostgreSQL Backup

```bash
# Create backup
make backup

# Or manually
docker-compose exec db pg_dump -U postgres adaptive_learning > backup.sql
```

### Restore from Backup

```bash
# Restore database
docker-compose exec -T db psql -U postgres adaptive_learning < backup.sql
```

### SQLite Backup

SQLite database is stored in `backend/local.db` and can be copied directly:

```bash
# Backup
cp backend/local.db backend/local.db.backup

# Restore
cp backend/local.db.backup backend/local.db
```

## Development Workflow

### First Time Setup

1. Start Docker containers:
   ```bash
   make dev
   ```

2. Migrations run automatically via Makefile

3. Seed sample data:
   ```bash
   make seed
   ```

### Adding New Models

1. Define model in `app/models/`
2. Import model in `alembic/env.py`
3. Create migration:
   ```bash
   docker-compose exec backend alembic revision --autogenerate -m "add new model"
   ```
4. Review generated migration file
5. Apply migration:
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

### Schema Changes

1. Modify existing model
2. Generate migration:
   ```bash
   docker-compose exec backend alembic revision --autogenerate -m "modify model"
   ```
3. Review and edit migration if needed
4. Test migration:
   ```bash
   docker-compose exec backend alembic upgrade head
   docker-compose exec backend alembic downgrade -1
   docker-compose exec backend alembic upgrade head
   ```
5. Commit migration file to version control

## Troubleshooting

### Migration Conflicts

If you have migration conflicts:

```bash
# Check current state
docker-compose exec backend alembic current

# Check history
docker-compose exec backend alembic history

# Stamp database to specific revision
docker-compose exec backend alembic stamp head
```

### Database Connection Issues

```bash
# Check if database is running
docker-compose ps

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Reset Database

**Warning:** This deletes all data!

```bash
# Stop services
docker-compose down

# Remove volumes
docker-compose down -v

# Restart and migrate
make dev
```

## Production Considerations

### Migration Strategy

1. **Always test migrations** in staging environment first
2. **Backup database** before running migrations in production
3. **Use transactions** for data migrations
4. **Plan for rollback** - ensure downgrade migrations work
5. **Monitor migration time** - large tables may need special handling

### Zero-Downtime Migrations

For production deployments:

1. **Additive changes first** - Add new columns/tables without removing old ones
2. **Deploy code** that works with both old and new schema
3. **Run migration** to add new schema elements
4. **Deploy code** that uses new schema exclusively
5. **Clean up** - Remove old columns/tables in a later migration

### Performance

- Create indexes in separate migrations for large tables
- Use `CREATE INDEX CONCURRENTLY` for PostgreSQL (manual migration)
- Monitor query performance after schema changes
- Consider partitioning for very large tables (future enhancement)

## References

- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

# Database Migration Quick Reference

## Quick Start

### First Time Setup
```bash
# Start all services (migrations run automatically)
make dev
```

### Run Migrations Manually
```bash
# Upgrade to latest
make migrate

# Or using docker-compose directly
docker-compose exec backend alembic upgrade head
```

## Common Operations

### Check Migration Status
```bash
# Show current version
docker-compose exec backend alembic current

# Show migration history
docker-compose exec backend alembic history
```

### Create New Migration

#### Auto-generate from model changes
```bash
docker-compose exec backend alembic revision --autogenerate -m "add email to user"
```

#### Create empty migration
```bash
docker-compose exec backend alembic revision -m "custom data migration"
```

### Apply Migrations
```bash
# Upgrade to latest
docker-compose exec backend alembic upgrade head

# Upgrade by one version
docker-compose exec backend alembic upgrade +1

# Upgrade to specific version
docker-compose exec backend alembic upgrade abc123
```

### Rollback Migrations
```bash
# Downgrade by one version
docker-compose exec backend alembic downgrade -1

# Downgrade to specific version
docker-compose exec backend alembic downgrade abc123

# Downgrade to base (empty database)
docker-compose exec backend alembic downgrade base
```

## Database Management

### Access PostgreSQL Shell
```bash
make db-shell

# Or directly
docker-compose exec db psql -U postgres -d adaptive_learning
```

### Backup Database
```bash
make backup

# Or manually
docker-compose exec db pg_dump -U postgres adaptive_learning > backup.sql
```

### Restore Database
```bash
docker-compose exec -T db psql -U postgres adaptive_learning < backup.sql
```

### Reset Database (Development Only)
```bash
# WARNING: Deletes all data!
docker-compose down -v
make dev
```

## Troubleshooting

### Migration Fails
```bash
# Check database connection
docker-compose logs db

# Check backend logs
docker-compose logs backend

# Verify database is running
docker-compose ps
```

### Alembic Version Mismatch
```bash
# Stamp database to current code version
docker-compose exec backend alembic stamp head
```

### Start Fresh
```bash
# Remove all containers and volumes
docker-compose down -v

# Rebuild and start
make dev
```

## Migration Best Practices

1. **Always review auto-generated migrations** before applying
2. **Test migrations** in development before production
3. **Backup database** before running migrations in production
4. **Write reversible migrations** (proper downgrade functions)
5. **Keep migrations small** and focused on one change
6. **Document complex migrations** with comments
7. **Test both upgrade and downgrade** paths

## File Locations

- **Migration files**: `backend/alembic/versions/`
- **Alembic config**: `backend/alembic.ini`
- **Alembic env**: `backend/alembic/env.py`
- **Models**: `backend/app/models/`
- **Database config**: `backend/app/core/database.py`

## Environment Variables

```bash
# PostgreSQL connection
DATABASE_URL=postgresql://user:password@host:port/database

# SQLite connection (offline storage)
SQLITE_DATABASE_URL=sqlite:///./local.db
```

## Migration Workflow

### Adding a New Field

1. **Modify the model**:
   ```python
   # In app/models/user.py
   class User(Base):
       # ... existing fields ...
       email = Column(String, nullable=True)  # Start nullable
   ```

2. **Generate migration**:
   ```bash
   docker-compose exec backend alembic revision --autogenerate -m "add email to user"
   ```

3. **Review migration file** in `alembic/versions/`

4. **Apply migration**:
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

5. **Test the change**:
   ```bash
   # Access database and verify
   make db-shell
   \d users
   ```

### Removing a Field

1. **Make field nullable first** (if not already):
   ```python
   email = Column(String, nullable=True)
   ```

2. **Deploy and migrate**

3. **Remove field from model**:
   ```python
   # Remove the email field
   ```

4. **Generate migration**:
   ```bash
   docker-compose exec backend alembic revision --autogenerate -m "remove email from user"
   ```

5. **Apply migration**:
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

### Renaming a Field

**Don't use auto-generate for renames!** It will drop and recreate.

1. **Create empty migration**:
   ```bash
   docker-compose exec backend alembic revision -m "rename user email to email_address"
   ```

2. **Edit migration manually**:
   ```python
   def upgrade():
       op.alter_column('users', 'email', new_column_name='email_address')
   
   def downgrade():
       op.alter_column('users', 'email_address', new_column_name='email')
   ```

3. **Update model**:
   ```python
   email_address = Column(String, nullable=True)
   ```

4. **Apply migration**:
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

## Production Deployment

### Pre-deployment Checklist

- [ ] Backup production database
- [ ] Test migrations in staging environment
- [ ] Review all migration files
- [ ] Verify downgrade paths work
- [ ] Check for breaking changes
- [ ] Plan rollback strategy

### Deployment Steps

1. **Backup database**:
   ```bash
   pg_dump -U postgres adaptive_learning > backup_$(date +%Y%m%d).sql
   ```

2. **Run migrations**:
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
   ```

3. **Verify migration**:
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend alembic current
   ```

4. **Monitor application logs**:
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f backend
   ```

### Rollback Plan

If migration fails:

1. **Stop application**:
   ```bash
   docker-compose -f docker-compose.prod.yml stop backend
   ```

2. **Rollback migration**:
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend alembic downgrade -1
   ```

3. **Restore from backup** (if needed):
   ```bash
   psql -U postgres adaptive_learning < backup_YYYYMMDD.sql
   ```

4. **Restart application**:
   ```bash
   docker-compose -f docker-compose.prod.yml start backend
   ```

## Additional Resources

- [Alembic Tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/20/orm/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

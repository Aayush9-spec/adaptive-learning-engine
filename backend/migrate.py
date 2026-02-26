"""
Migration helper script
Provides easy commands for database migrations
"""
import sys
import os
from alembic.config import Config
from alembic import command

def get_alembic_config():
    """Get Alembic configuration"""
    alembic_cfg = Config("alembic.ini")
    return alembic_cfg

def upgrade(revision="head"):
    """Upgrade database to a specific revision"""
    print(f"Upgrading database to {revision}...")
    alembic_cfg = get_alembic_config()
    command.upgrade(alembic_cfg, revision)
    print("✓ Database upgraded successfully")

def downgrade(revision="-1"):
    """Downgrade database by one revision"""
    print(f"Downgrading database to {revision}...")
    alembic_cfg = get_alembic_config()
    command.downgrade(alembic_cfg, revision)
    print("✓ Database downgraded successfully")

def current():
    """Show current database revision"""
    print("Current database revision:")
    alembic_cfg = get_alembic_config()
    command.current(alembic_cfg)

def history():
    """Show migration history"""
    print("Migration history:")
    alembic_cfg = get_alembic_config()
    command.history(alembic_cfg)

def revision(message, autogenerate=False):
    """Create a new migration revision"""
    print(f"Creating new migration: {message}")
    alembic_cfg = get_alembic_config()
    command.revision(alembic_cfg, message=message, autogenerate=autogenerate)
    print("✓ Migration created successfully")

def show_help():
    """Show help message"""
    print("""
Database Migration Helper

Usage: python migrate.py <command> [args]

Commands:
  upgrade [revision]     Upgrade to a specific revision (default: head)
  downgrade [revision]   Downgrade to a specific revision (default: -1)
  current                Show current database revision
  history                Show migration history
  revision <message>     Create a new empty migration
  autogenerate <message> Auto-generate migration from model changes
  help                   Show this help message

Examples:
  python migrate.py upgrade
  python migrate.py downgrade
  python migrate.py current
  python migrate.py history
  python migrate.py revision "add user email field"
  python migrate.py autogenerate "add user email field"
""")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        show_help()
        sys.exit(1)
    
    cmd = sys.argv[1].lower()
    
    if cmd == "upgrade":
        revision = sys.argv[2] if len(sys.argv) > 2 else "head"
        upgrade(revision)
    elif cmd == "downgrade":
        revision = sys.argv[2] if len(sys.argv) > 2 else "-1"
        downgrade(revision)
    elif cmd == "current":
        current()
    elif cmd == "history":
        history()
    elif cmd == "revision":
        if len(sys.argv) < 3:
            print("Error: Please provide a migration message")
            sys.exit(1)
        message = sys.argv[2]
        revision(message, autogenerate=False)
    elif cmd == "autogenerate":
        if len(sys.argv) < 3:
            print("Error: Please provide a migration message")
            sys.exit(1)
        message = sys.argv[2]
        revision(message, autogenerate=True)
    elif cmd == "help":
        show_help()
    else:
        print(f"Error: Unknown command '{cmd}'")
        show_help()
        sys.exit(1)

"""
SyncManager - Handles offline-online data synchronization with conflict resolution.

This module provides the core synchronization logic for the offline-first architecture,
managing data sync between local SQLite and cloud PostgreSQL databases.
"""

import time
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum


class SyncState(str, Enum):
    """Sync status states"""
    SYNCED = "synced"
    PENDING = "pending"
    SYNCING = "syncing"
    ERROR = "error"


@dataclass
class SyncOperation:
    """
    Represents a queued sync operation.
    
    Attributes:
        id: Unique identifier for the operation
        operation_type: Type of operation ('create', 'update', 'delete')
        table_name: Name of the table being modified
        record_id: ID of the record being modified
        data: The data to sync (JSON serializable)
        timestamp: When the operation was created
        synced: Whether the operation has been synced
        retry_count: Number of retry attempts
        last_error: Last error message if sync failed
    """
    operation_type: str  # 'create', 'update', 'delete'
    table_name: str
    record_id: int
    data: Dict[str, Any]
    timestamp: datetime = field(default_factory=datetime.utcnow)
    synced: bool = False
    retry_count: int = 0
    last_error: Optional[str] = None
    id: Optional[int] = None


@dataclass
class SyncResult:
    """
    Result of a sync operation.
    
    Attributes:
        success: Whether the sync was successful
        synced_count: Number of operations successfully synced
        failed_count: Number of operations that failed
        conflicts_resolved: Number of conflicts resolved
        errors: List of error messages
    """
    success: bool
    synced_count: int = 0
    failed_count: int = 0
    conflicts_resolved: int = 0
    errors: List[str] = field(default_factory=list)


@dataclass
class SyncStatus:
    """
    Current sync status.
    
    Attributes:
        pending_operations: Number of pending operations
        last_sync_time: Timestamp of last successful sync
        sync_state: Current sync state
    """
    pending_operations: int
    last_sync_time: Optional[datetime]
    sync_state: SyncState


class SyncManager:
    """
    Manages offline-online data synchronization with conflict resolution.
    
    This class handles:
    - Queuing operations when offline
    - Syncing to cloud when online
    - Syncing from cloud to local
    - Conflict resolution using latest-wins strategy
    - Retry logic with exponential backoff
    """
    
    # Tables that need to be synced
    SYNCABLE_TABLES = [
        'student_profiles',
        'question_attempts',
        'concept_mastery',
        'study_plans',
    ]
    
    # Maximum retry attempts before giving up
    MAX_RETRIES = 5
    
    # Exponential backoff delays (seconds)
    RETRY_DELAYS = [1, 2, 4, 8, 16, 32, 60]
    
    def __init__(self, local_db: Any, cloud_db: Any):
        """
        Initialize the SyncManager.
        
        Args:
            local_db: Local database connection (SQLite)
            cloud_db: Cloud database connection (PostgreSQL)
        """
        self.local_db = local_db
        self.cloud_db = cloud_db
        self.last_sync_time: Optional[datetime] = None
        self.is_syncing = False
    
    def queue_operation(
        self,
        operation_type: str,
        table_name: str,
        record_id: int,
        data: Dict[str, Any]
    ) -> int:
        """
        Queue a sync operation for later synchronization.
        
        This method is called when a data modification occurs (create, update, delete).
        The operation is stored in the sync queue and will be processed when online.
        
        Args:
            operation_type: Type of operation ('create', 'update', 'delete')
            table_name: Name of the table being modified
            record_id: ID of the record being modified
            data: The data to sync
            
        Returns:
            ID of the queued operation
            
        Validates: Requirements 6.2
        """
        if table_name not in self.SYNCABLE_TABLES:
            raise ValueError(f"Table {table_name} is not syncable")
        
        if operation_type not in ['create', 'update', 'delete']:
            raise ValueError(f"Invalid operation type: {operation_type}")
        
        operation = SyncOperation(
            operation_type=operation_type,
            table_name=table_name,
            record_id=record_id,
            data=data,
            timestamp=datetime.utcnow(),
            synced=False,
            retry_count=0
        )
        
        # Store in local sync queue
        operation_id = self._store_sync_operation(operation)
        return operation_id
    
    def sync_to_cloud(self) -> SyncResult:
        """
        Synchronize pending operations from local to cloud database.
        
        This method:
        1. Fetches all pending operations from the queue
        2. Attempts to apply each operation to the cloud database
        3. Handles conflicts using latest-wins strategy
        4. Marks successful operations as synced
        5. Retries failed operations with exponential backoff
        
        Returns:
            SyncResult with statistics about the sync operation
            
        Validates: Requirements 6.3, 6.4
        """
        if self.is_syncing:
            return SyncResult(
                success=False,
                errors=["Sync already in progress"]
            )
        
        self.is_syncing = True
        result = SyncResult(success=True)
        
        try:
            # Get pending operations ordered by timestamp
            pending_ops = self._get_pending_operations()
            
            for operation in pending_ops:
                try:
                    # Check if we've exceeded max retries
                    if operation.retry_count >= self.MAX_RETRIES:
                        result.failed_count += 1
                        result.errors.append(
                            f"Operation {operation.id} exceeded max retries"
                        )
                        continue
                    
                    # Apply operation to cloud database
                    conflict_resolved = self._apply_operation_to_cloud(operation)
                    
                    if conflict_resolved:
                        result.conflicts_resolved += 1
                    
                    # Mark as synced
                    self._mark_operation_synced(operation.id)
                    result.synced_count += 1
                    
                except Exception as e:
                    # Handle sync failure with retry logic
                    result.failed_count += 1
                    error_msg = str(e)
                    result.errors.append(error_msg)
                    
                    # Update retry count and schedule retry
                    self._update_operation_retry(operation.id, error_msg)
            
            # Update last sync time if any operations were synced
            if result.synced_count > 0:
                self.last_sync_time = datetime.utcnow()
            
            result.success = result.failed_count == 0
            
        finally:
            self.is_syncing = False
        
        return result
    
    def sync_from_cloud(self, student_id: int) -> SyncResult:
        """
        Synchronize data from cloud to local database for a specific student.
        
        This method downloads the latest data from the cloud and updates
        the local database. Used when coming online or on initial load.
        
        Args:
            student_id: ID of the student whose data to sync
            
        Returns:
            SyncResult with statistics about the sync operation
            
        Validates: Requirements 6.3
        """
        result = SyncResult(success=True)
        
        try:
            # Sync each table
            for table_name in self.SYNCABLE_TABLES:
                try:
                    # Fetch latest data from cloud
                    cloud_records = self._fetch_cloud_records(table_name, student_id)
                    
                    # Update local database
                    for record in cloud_records:
                        self._update_local_record(table_name, record)
                        result.synced_count += 1
                    
                except Exception as e:
                    result.failed_count += 1
                    result.errors.append(f"Failed to sync {table_name}: {str(e)}")
            
            result.success = result.failed_count == 0
            
        except Exception as e:
            result.success = False
            result.errors.append(f"Sync from cloud failed: {str(e)}")
        
        return result
    
    def resolve_conflict(
        self,
        local_record: Dict[str, Any],
        cloud_record: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Resolve conflicts between local and cloud records using latest-wins strategy.
        
        Compares timestamps and keeps the record with the later timestamp.
        
        Args:
            local_record: Record from local database
            cloud_record: Record from cloud database
            
        Returns:
            The winning record (with latest timestamp)
            
        Validates: Requirements 6.4
        """
        # Extract timestamps
        local_timestamp = self._get_record_timestamp(local_record)
        cloud_timestamp = self._get_record_timestamp(cloud_record)
        
        # Latest-wins strategy
        if local_timestamp >= cloud_timestamp:
            return local_record
        else:
            return cloud_record
    
    def get_sync_status(self, student_id: Optional[int] = None) -> SyncStatus:
        """
        Get current sync status.
        
        Args:
            student_id: Optional student ID to filter pending operations
            
        Returns:
            SyncStatus with current sync state
            
        Validates: Requirements 6.6
        """
        pending_count = self._count_pending_operations(student_id)
        
        # Determine sync state
        if self.is_syncing:
            state = SyncState.SYNCING
        elif pending_count > 0:
            state = SyncState.PENDING
        elif pending_count == 0:
            state = SyncState.SYNCED
        else:
            state = SyncState.ERROR
        
        return SyncStatus(
            pending_operations=pending_count,
            last_sync_time=self.last_sync_time,
            sync_state=state
        )
    
    def get_retry_delay(self, retry_count: int) -> int:
        """
        Calculate retry delay using exponential backoff.
        
        Args:
            retry_count: Number of retries attempted
            
        Returns:
            Delay in seconds before next retry
        """
        if retry_count >= len(self.RETRY_DELAYS):
            return self.RETRY_DELAYS[-1]  # Max delay
        return self.RETRY_DELAYS[retry_count]
    
    # Private helper methods
    
    def _store_sync_operation(self, operation: SyncOperation) -> int:
        """Store a sync operation in the local queue."""
        # Implementation depends on database layer
        # This is a placeholder that should be implemented with actual DB calls
        raise NotImplementedError("Database layer integration required")
    
    def _get_pending_operations(self) -> List[SyncOperation]:
        """Get all pending sync operations ordered by timestamp."""
        raise NotImplementedError("Database layer integration required")
    
    def _apply_operation_to_cloud(self, operation: SyncOperation) -> bool:
        """
        Apply a sync operation to the cloud database.
        
        Returns:
            True if a conflict was resolved, False otherwise
        """
        conflict_resolved = False
        
        if operation.operation_type == 'create':
            # Check if record already exists (conflict)
            existing = self._get_cloud_record(
                operation.table_name,
                operation.record_id
            )
            if existing:
                # Resolve conflict
                winner = self.resolve_conflict(operation.data, existing)
                self._update_cloud_record(operation.table_name, winner)
                conflict_resolved = True
            else:
                self._insert_cloud_record(operation.table_name, operation.data)
        
        elif operation.operation_type == 'update':
            # Check for conflicts
            existing = self._get_cloud_record(
                operation.table_name,
                operation.record_id
            )
            if existing:
                winner = self.resolve_conflict(operation.data, existing)
                self._update_cloud_record(operation.table_name, winner)
                if winner != operation.data:
                    conflict_resolved = True
            else:
                # Record doesn't exist, treat as create
                self._insert_cloud_record(operation.table_name, operation.data)
        
        elif operation.operation_type == 'delete':
            self._delete_cloud_record(operation.table_name, operation.record_id)
        
        return conflict_resolved
    
    def _mark_operation_synced(self, operation_id: int) -> None:
        """Mark a sync operation as successfully synced."""
        raise NotImplementedError("Database layer integration required")
    
    def _update_operation_retry(self, operation_id: int, error_msg: str) -> None:
        """Update retry count and error message for a failed operation."""
        raise NotImplementedError("Database layer integration required")
    
    def _fetch_cloud_records(
        self,
        table_name: str,
        student_id: int
    ) -> List[Dict[str, Any]]:
        """Fetch records from cloud database for a specific student."""
        raise NotImplementedError("Database layer integration required")
    
    def _update_local_record(
        self,
        table_name: str,
        record: Dict[str, Any]
    ) -> None:
        """Update a record in the local database."""
        raise NotImplementedError("Database layer integration required")
    
    def _get_cloud_record(
        self,
        table_name: str,
        record_id: int
    ) -> Optional[Dict[str, Any]]:
        """Get a record from cloud database."""
        raise NotImplementedError("Database layer integration required")
    
    def _insert_cloud_record(
        self,
        table_name: str,
        data: Dict[str, Any]
    ) -> None:
        """Insert a record into cloud database."""
        raise NotImplementedError("Database layer integration required")
    
    def _update_cloud_record(
        self,
        table_name: str,
        data: Dict[str, Any]
    ) -> None:
        """Update a record in cloud database."""
        raise NotImplementedError("Database layer integration required")
    
    def _delete_cloud_record(
        self,
        table_name: str,
        record_id: int
    ) -> None:
        """Delete a record from cloud database."""
        raise NotImplementedError("Database layer integration required")
    
    def _count_pending_operations(
        self,
        student_id: Optional[int] = None
    ) -> int:
        """Count pending sync operations."""
        raise NotImplementedError("Database layer integration required")
    
    def _get_record_timestamp(self, record: Dict[str, Any]) -> datetime:
        """
        Extract timestamp from a record.
        
        Looks for common timestamp fields: timestamp, last_updated, created_at
        """
        for field in ['timestamp', 'last_updated', 'created_at']:
            if field in record:
                ts = record[field]
                if isinstance(ts, datetime):
                    return ts
                elif isinstance(ts, str):
                    return datetime.fromisoformat(ts.replace('Z', '+00:00'))
        
        # Default to epoch if no timestamp found
        return datetime.fromtimestamp(0)

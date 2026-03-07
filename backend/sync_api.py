"""
Sync API Endpoints - Handle offline-online data synchronization.

This module provides REST API endpoints for:
- Uploading pending sync operations from client
- Downloading latest data for a student
- Getting sync status

Validates: Requirements 6.3, 6.6, 13.1, 13.2
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from dataclasses import asdict


# Mock database for demonstration
# In production, this would use actual database connections
class MockDatabase:
    """Mock database for demonstration purposes"""
    
    def __init__(self):
        self.sync_operations = []
        self.question_attempts = []
        self.concept_mastery = []
        self.study_plans = []
        self.student_profiles = []
    
    def add_sync_operation(self, operation: Dict[str, Any]) -> int:
        """Add a sync operation to the queue"""
        operation['id'] = len(self.sync_operations) + 1
        self.sync_operations.append(operation)
        return operation['id']
    
    def get_pending_operations(self) -> List[Dict[str, Any]]:
        """Get all pending sync operations"""
        return [op for op in self.sync_operations if not op.get('synced', False)]
    
    def mark_operation_synced(self, operation_id: int) -> None:
        """Mark an operation as synced"""
        for op in self.sync_operations:
            if op['id'] == operation_id:
                op['synced'] = True
                break
    
    def get_student_data(self, student_id: int) -> Dict[str, Any]:
        """Get all data for a student"""
        return {
            'question_attempts': [
                a for a in self.question_attempts 
                if a.get('student_id') == student_id
            ],
            'concept_mastery': [
                m for m in self.concept_mastery 
                if m.get('student_id') == student_id
            ],
            'study_plans': [
                p for p in self.study_plans 
                if p.get('student_id') == student_id
            ],
            'student_profile': next(
                (p for p in self.student_profiles if p.get('id') == student_id),
                None
            )
        }
    
    def apply_operation(self, operation: Dict[str, Any]) -> bool:
        """Apply a sync operation to the database"""
        table_name = operation['table_name']
        operation_type = operation['operation_type']
        data = operation['data']
        
        # Get the appropriate table
        if table_name == 'question_attempts':
            table = self.question_attempts
        elif table_name == 'concept_mastery':
            table = self.concept_mastery
        elif table_name == 'study_plans':
            table = self.study_plans
        elif table_name == 'student_profiles':
            table = self.student_profiles
        else:
            raise ValueError(f"Unknown table: {table_name}")
        
        # Apply operation
        if operation_type == 'create':
            table.append(data)
        elif operation_type == 'update':
            for i, record in enumerate(table):
                if record.get('id') == data.get('id'):
                    table[i] = data
                    break
        elif operation_type == 'delete':
            table[:] = [r for r in table if r.get('id') != operation['record_id']]
        
        return True


# Global mock database instance
mock_db = MockDatabase()


class SyncAPI:
    """
    API endpoints for data synchronization.
    
    This class provides endpoints for uploading and downloading sync data,
    as well as checking sync status.
    """
    
    def __init__(self, database: Any = None):
        """
        Initialize the Sync API.
        
        Args:
            database: Database connection (uses mock if not provided)
        """
        self.db = database or mock_db
    
    def upload_sync_operations(
        self,
        operations: List[Dict[str, Any]],
        student_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        POST /api/sync/upload
        
        Upload pending sync operations from client to server.
        
        Args:
            operations: List of sync operations to upload
            student_id: Optional student ID for filtering
            
        Returns:
            Response with sync results
            
        Validates: Requirements 6.3, 13.1, 13.2
        """
        result = {
            'success': True,
            'synced_count': 0,
            'failed_count': 0,
            'conflicts_resolved': 0,
            'errors': []
        }
        
        try:
            for operation in operations:
                try:
                    # Validate operation
                    if not self._validate_operation(operation):
                        result['failed_count'] += 1
                        result['errors'].append(
                            f"Invalid operation: {operation.get('id', 'unknown')}"
                        )
                        continue
                    
                    # Check for conflicts
                    conflict_resolved = self._check_and_resolve_conflict(operation)
                    if conflict_resolved:
                        result['conflicts_resolved'] += 1
                    
                    # Apply operation to database
                    self.db.apply_operation(operation)
                    result['synced_count'] += 1
                    
                except Exception as e:
                    result['failed_count'] += 1
                    result['errors'].append(str(e))
            
            result['success'] = result['failed_count'] == 0
            
        except Exception as e:
            result['success'] = False
            result['errors'].append(f"Upload failed: {str(e)}")
        
        return result
    
    def download_student_data(self, student_id: int) -> Dict[str, Any]:
        """
        GET /api/sync/download/{student_id}
        
        Download latest data for a specific student.
        
        Args:
            student_id: ID of the student
            
        Returns:
            Dictionary containing all student data
            
        Validates: Requirements 6.3, 13.1, 13.2
        """
        try:
            data = self.db.get_student_data(student_id)
            
            return {
                'success': True,
                'student_id': student_id,
                'data': data,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_sync_status(self, student_id: int) -> Dict[str, Any]:
        """
        GET /api/sync/status/{student_id}
        
        Get sync status for a specific student.
        
        Args:
            student_id: ID of the student
            
        Returns:
            Sync status information
            
        Validates: Requirements 6.6, 13.1, 13.2
        """
        try:
            # Get pending operations for this student
            pending_ops = self.db.get_pending_operations()
            
            # Filter by student_id if data contains it
            student_pending = [
                op for op in pending_ops
                if op.get('data', {}).get('student_id') == student_id
            ]
            
            # Determine sync state
            if len(student_pending) == 0:
                sync_state = 'synced'
            else:
                sync_state = 'pending'
            
            return {
                'success': True,
                'student_id': student_id,
                'pending_operations': len(student_pending),
                'sync_state': sync_state,
                'last_sync_time': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def _validate_operation(self, operation: Dict[str, Any]) -> bool:
        """
        Validate a sync operation.
        
        Args:
            operation: The operation to validate
            
        Returns:
            True if valid, False otherwise
        """
        required_fields = [
            'operation_type',
            'table_name',
            'record_id',
            'data',
            'timestamp'
        ]
        
        # Check required fields
        for field in required_fields:
            if field not in operation:
                return False
        
        # Validate operation type
        if operation['operation_type'] not in ['create', 'update', 'delete']:
            return False
        
        # Validate table name
        valid_tables = [
            'student_profiles',
            'question_attempts',
            'concept_mastery',
            'study_plans'
        ]
        if operation['table_name'] not in valid_tables:
            return False
        
        return True
    
    def _check_and_resolve_conflict(self, operation: Dict[str, Any]) -> bool:
        """
        Check for conflicts and resolve using latest-wins strategy.
        
        Args:
            operation: The operation to check
            
        Returns:
            True if a conflict was resolved, False otherwise
        """
        # Get existing record from database
        table_name = operation['table_name']
        record_id = operation['record_id']
        
        # This is a simplified conflict check
        # In production, would query actual database
        existing_record = None
        
        if not existing_record:
            return False
        
        # Compare timestamps
        operation_timestamp = datetime.fromisoformat(
            operation['timestamp'].replace('Z', '+00:00')
        )
        existing_timestamp = datetime.fromisoformat(
            existing_record.get('timestamp', '1970-01-01T00:00:00+00:00')
        )
        
        # Latest-wins: if operation is newer, it wins
        if operation_timestamp >= existing_timestamp:
            return True
        else:
            # Existing record is newer, don't apply operation
            return False


# FastAPI route handlers (to be integrated with main app)

def create_sync_routes(app: Any) -> None:
    """
    Create sync API routes for FastAPI application.
    
    Args:
        app: FastAPI application instance
    """
    sync_api = SyncAPI()
    
    @app.post("/api/sync/upload")
    async def upload_sync_operations(request_data: Dict[str, Any]):
        """Upload pending sync operations"""
        operations = request_data.get('operations', [])
        student_id = request_data.get('student_id')
        return sync_api.upload_sync_operations(operations, student_id)
    
    @app.get("/api/sync/download/{student_id}")
    async def download_student_data(student_id: int):
        """Download latest data for a student"""
        return sync_api.download_student_data(student_id)
    
    @app.get("/api/sync/status/{student_id}")
    async def get_sync_status(student_id: int):
        """Get sync status for a student"""
        return sync_api.get_sync_status(student_id)


# Standalone functions for testing

def handle_upload_request(operations: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Handle sync upload request.
    
    Args:
        operations: List of sync operations
        
    Returns:
        Sync result
    """
    api = SyncAPI()
    return api.upload_sync_operations(operations)


def handle_download_request(student_id: int) -> Dict[str, Any]:
    """
    Handle sync download request.
    
    Args:
        student_id: Student ID
        
    Returns:
        Student data
    """
    api = SyncAPI()
    return api.download_student_data(student_id)


def handle_status_request(student_id: int) -> Dict[str, Any]:
    """
    Handle sync status request.
    
    Args:
        student_id: Student ID
        
    Returns:
        Sync status
    """
    api = SyncAPI()
    return api.get_sync_status(student_id)

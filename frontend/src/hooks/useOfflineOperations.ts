/**
 * useOfflineOperations Hook
 * Provides utilities for queuing operations when offline
 */

import { useState, useCallback } from 'react';
import { syncManager } from '@/lib/syncManager';
import { localDb, STORES } from '@/lib/localDb';

export interface OfflineOperations {
  queueOperation: (
    operationType: 'create' | 'update' | 'delete',
    tableName: string,
    recordId: number,
    data: any
  ) => Promise<number>;
  saveQuestionAttempt: (attempt: any) => Promise<number>;
  saveConceptMastery: (mastery: any) => Promise<void>;
  saveStudyPlan: (plan: any) => Promise<number>;
  isOperationQueued: boolean;
}

export function useOfflineOperations(): OfflineOperations {
  const [isOperationQueued, setIsOperationQueued] = useState(false);

  const queueOperation = useCallback(
    async (
      operationType: 'create' | 'update' | 'delete',
      tableName: string,
      recordId: number,
      data: any
    ): Promise<number> => {
      setIsOperationQueued(true);
      try {
        // Save to local database first
        if (operationType === 'create') {
          await localDb.add(tableName, data);
        } else if (operationType === 'update') {
          await localDb.update(tableName, data);
        } else if (operationType === 'delete') {
          await localDb.delete(tableName, recordId);
        }

        // Queue for sync
        const operationId = await syncManager.queueOperation(
          operationType,
          tableName,
          recordId,
          data
        );

        return operationId;
      } finally {
        setIsOperationQueued(false);
      }
    },
    []
  );

  const saveQuestionAttempt = useCallback(
    async (attempt: any): Promise<number> => {
      // Add timestamp if not present
      if (!attempt.timestamp) {
        attempt.timestamp = new Date().toISOString();
      }

      // Mark as not synced
      attempt.synced = false;

      // Save to local database
      const attemptId = await localDb.add(STORES.QUESTION_ATTEMPTS, attempt);

      // Queue for sync
      await syncManager.queueOperation(
        'create',
        'question_attempts',
        attemptId,
        { ...attempt, id: attemptId }
      );

      return attemptId;
    },
    []
  );

  const saveConceptMastery = useCallback(
    async (mastery: any): Promise<void> => {
      // Add timestamp if not present
      if (!mastery.last_updated) {
        mastery.last_updated = new Date().toISOString();
      }

      // Check if mastery record already exists
      const existing = await localDb.getByIndex(
        STORES.CONCEPT_MASTERY,
        'student_concept',
        [mastery.student_id, mastery.concept_id]
      );

      if (existing.length > 0) {
        // Update existing record
        const existingRecord = existing[0] as any;
        const updated = { ...existingRecord, ...mastery };
        await localDb.update(STORES.CONCEPT_MASTERY, updated);

        // Queue update operation
        await syncManager.queueOperation(
          'update',
          'concept_mastery',
          updated.id!,
          updated
        );
      } else {
        // Create new record
        const masteryId = await localDb.add(STORES.CONCEPT_MASTERY, mastery);

        // Queue create operation
        await syncManager.queueOperation(
          'create',
          'concept_mastery',
          masteryId,
          { ...mastery, id: masteryId }
        );
      }
    },
    []
  );

  const saveStudyPlan = useCallback(
    async (plan: any): Promise<number> => {
      // Add timestamp if not present
      if (!plan.created_at) {
        plan.created_at = new Date().toISOString();
      }

      // Save to local database
      const planId = await localDb.add(STORES.STUDY_PLANS, plan);

      // Queue for sync
      await syncManager.queueOperation(
        'create',
        'study_plans',
        planId,
        { ...plan, id: planId }
      );

      return planId;
    },
    []
  );

  return {
    queueOperation,
    saveQuestionAttempt,
    saveConceptMastery,
    saveStudyPlan,
    isOperationQueued,
  };
}

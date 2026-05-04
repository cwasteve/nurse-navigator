import { useState, useEffect, useCallback } from 'react';
import type { MatchStatus, RejectionReason, Note } from '../types';
import { STATUS } from '../constants/status';
import { createNote } from '../utils/nurse';
import {
  loadAllStatuses,
  loadAllRejectionReasons,
  loadAllNotes,
  saveStatus,
  saveRejectionReason,
  removeRejectionReason as removeRejectionReasonFromDb,
  saveNotes,
} from '../api/matchReviewStore';

export interface UseMatchReviewStoreReturn {
  statuses: Record<string, MatchStatus>;
  rejectionReasons: Record<string, RejectionReason>;
  notes: Record<string, Note[]>;
  isLoading: boolean;
  updateStatus: (externalId: string, status: MatchStatus) => void;
  setRejectionReason: (externalId: string, reason: RejectionReason) => void;
  removeRejectionReason: (externalId: string) => void;
  addNote: (externalId: string, text: string) => void;
}

export function useMatchReviewStore(matchIds: string[]): UseMatchReviewStoreReturn {
  const [statuses, setStatuses] = useState<Record<string, MatchStatus>>({});
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, RejectionReason>>({});
  const [notes, setNotes] = useState<Record<string, Note[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [savedStatuses, savedReasons, savedNotes] = await Promise.all([
        loadAllStatuses(),
        loadAllRejectionReasons(),
        loadAllNotes(),
      ]);

      if (cancelled) return;

      // Initialize any missing match IDs to 'pending'
      const mergedStatuses: Record<string, MatchStatus> = {};
      for (const id of matchIds) {
        mergedStatuses[id] = savedStatuses[id] ?? STATUS.PENDING;
      }

      setStatuses(mergedStatuses);
      setRejectionReasons(savedReasons);
      setNotes(savedNotes);
      setIsLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [matchIds]);

  const updateStatus = useCallback((externalId: string, status: MatchStatus) => {
    setStatuses((prev) => ({ ...prev, [externalId]: status }));
    saveStatus(externalId, status);

    if (status === STATUS.PENDING) {
      setRejectionReasons((prev) => {
        const next = { ...prev };
        delete next[externalId];
        return next;
      });
      removeRejectionReasonFromDb(externalId);
    }
  }, []);

  const setRejectionReasonFn = useCallback((externalId: string, reason: RejectionReason) => {
    setRejectionReasons((prev) => ({ ...prev, [externalId]: reason }));
    saveRejectionReason(externalId, reason);
  }, []);

  const removeRejectionReasonFn = useCallback((externalId: string) => {
    setRejectionReasons((prev) => {
      const next = { ...prev };
      delete next[externalId];
      return next;
    });
    removeRejectionReasonFromDb(externalId);
  }, []);

  const addNote = useCallback((externalId: string, text: string) => {
    const note = createNote(text);
    setNotes((prev) => {
      const updated = [...(prev[externalId] ?? []), note];
      saveNotes(externalId, updated);
      return { ...prev, [externalId]: updated };
    });
  }, []);

  return {
    statuses,
    rejectionReasons,
    notes,
    isLoading,
    updateStatus,
    setRejectionReason: setRejectionReasonFn,
    removeRejectionReason: removeRejectionReasonFn,
    addNote,
  };
}

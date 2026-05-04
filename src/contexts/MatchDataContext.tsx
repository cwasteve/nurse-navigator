import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { MatchRecord, MatchStatus, Note, RejectionReason } from '../types';
import { useMatchReviewStore } from '../hooks/useMatchReviewStore';
import { useMatchData, allMatchIds } from '../hooks/useMatchData';

export interface MatchDataContextValue {
  matchRecords: MatchRecord[];
  recordsByExternalId: Map<string, MatchRecord>;
  stats: Record<MatchStatus, number>;
  isLoading: boolean;
  notes: Record<string, Note[]>;
  statuses: Record<string, MatchStatus>;
  rejectionReasons: Record<string, RejectionReason>;
  updateStatus: (id: string, status: MatchStatus) => void;
  addNote: (id: string, text: string) => void;
  setRejectionReason: (id: string, reason: RejectionReason) => void;
  removeRejectionReason: (id: string) => void;
}

export const MatchDataContext = createContext<MatchDataContextValue | null>(null);

export function useMatchDataCtx(): MatchDataContextValue {
  const ctx = useContext(MatchDataContext);
  if (!ctx) throw new Error('useMatchDataCtx must be used within <MatchDataProvider>');
  return ctx;
}

export function MatchDataProvider({ children }: { children: ReactNode }) {
  const reviewStore = useMatchReviewStore(allMatchIds);
  const { matchRecords, stats } = useMatchData(reviewStore);

  const recordsByExternalId = useMemo(
    () => new Map(matchRecords.map((r) => [r.match.ExternalPatientId, r])),
    [matchRecords],
  );

  const value: MatchDataContextValue = {
    matchRecords,
    recordsByExternalId,
    stats,
    isLoading: reviewStore.isLoading,
    notes: reviewStore.notes,
    statuses: reviewStore.statuses,
    rejectionReasons: reviewStore.rejectionReasons,
    updateStatus: reviewStore.updateStatus,
    addNote: reviewStore.addNote,
    setRejectionReason: reviewStore.setRejectionReason,
    removeRejectionReason: reviewStore.removeRejectionReason,
  };

  return (
    <MatchDataContext.Provider value={value}>
      {children}
    </MatchDataContext.Provider>
  );
}

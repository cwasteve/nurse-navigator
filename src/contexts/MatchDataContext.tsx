import { createContext, useContext } from 'react';
import type { MatchRecord, MatchStatus, Note, RejectionReason } from '../types';
import { useMatchReviewStore } from '../hooks/useMatchReviewStore';
import { useMatchData, allMatchIds } from '../hooks/useMatchData';

interface MatchDataContextValue {
  matchRecords: MatchRecord[];
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

const MatchDataContext = createContext<MatchDataContextValue | null>(null);

export function useMatchDataCtx(): MatchDataContextValue {
  const ctx = useContext(MatchDataContext);
  if (!ctx) throw new Error('useMatchDataCtx must be used within <MatchDataProvider>');
  return ctx;
}

export function MatchDataProvider({ children }: { children: React.ReactNode }) {
  const reviewStore = useMatchReviewStore(allMatchIds);
  const { matchRecords, stats } = useMatchData(reviewStore);

  const value: MatchDataContextValue = {
    matchRecords,
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

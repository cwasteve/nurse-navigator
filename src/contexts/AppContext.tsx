import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from 'react';
import type { MatchStatus, MatchRecord, RejectionReason, UndoToastItem, SearchSuggestion } from '../types';
import { STATUS } from '../constants/status';
import { fullName, formatDOB, patientMatchesQuery } from '../utils/patients';
import { useMatchDataCtx } from './MatchDataContext';
import { useMatchFilterCtx } from './MatchFilterContext';

const { UNREVIEWED, CONFIRMED, REJECTED, FOLLOW_UP } = STATUS;

interface AppContextValue {
  // Compare modal
  compareRecord: MatchRecord | null;
  openCompare: (record: MatchRecord) => void;
  closeCompare: () => void;
  handleCompareConfirm: (note?: string) => void;
  handleCompareReject: (reason: RejectionReason, note?: string) => void;
  handleCompareFollowUp: (note?: string) => void;
  handleCompareUndo: () => void;

  // Central status change (with undo toast)
  handleStatusChange: (id: string, status: MatchStatus) => void;
  handleAddNote: (id: string, text: string) => void;

  // Quick review delegates
  handleQuickReviewConfirm: (id: string) => void;
  handleQuickReviewReject: (id: string, reason: RejectionReason) => void;
  handleQuickReviewFollowUp: (id: string) => void;

  // Reject dialog
  rejectExternalId: string | null;
  requestReject: (id: string) => void;
  executeReject: (reason: RejectionReason) => void;
  cancelReject: () => void;

  // Note dialog
  noteDialogRecord: MatchRecord | null;
  openNoteDialog: (id: string) => void;
  closeNoteDialog: () => void;

  // Search suggestions (derived)
  searchSuggestions: SearchSuggestion[];
  handleSelectSuggestion: (record: MatchRecord) => void;

  // Tab change (combines filter + selection clear)
  handleTabChange: (tab: MatchStatus) => void;

  // Undo toasts
  undoToasts: UndoToastItem[];
  dismissToast: (id: string) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useAppCtx(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppCtx must be used within <AppProvider>');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { matchRecords, recordsByExternalId, updateStatus, addNote, setRejectionReason, statuses } = useMatchDataCtx();
  const { search, setSearch, setActiveTab, clearSelection } = useMatchFilterCtx();

  // Store only the external ID — derive the full record from matchRecords
  const [compareExternalId, setCompareExternalId] = useState<string | null>(null);
  const [rejectExternalId, setRejectExternalId] = useState<string | null>(null);
  const [noteDialogId, setNoteDialogId] = useState<string | null>(null);
  const [undoToasts, setUndoToasts] = useState<UndoToastItem[]>([]);

  // Derive compareRecord from the lookup map — always fresh data
  const compareRecord = useMemo(
    () => (compareExternalId ? recordsByExternalId.get(compareExternalId) ?? null : null),
    [compareExternalId, recordsByExternalId],
  );

  const noteDialogRecord = useMemo(() => {
    if (!noteDialogId) return null;
    return recordsByExternalId.get(noteDialogId) ?? null;
  }, [noteDialogId, recordsByExternalId]);

  // ─── Undo toast helpers ──────────────────────────────────────────
  const dismissToast = useCallback((id: string) => {
    setUndoToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushUndoToast = useCallback((message: string, undoFn: () => void) => {
    const id = `${Date.now()}-${Math.random()}`;
    setUndoToasts((prev) => [...prev, { id, message, onUndo: undoFn }]);
  }, []);

  // ─── Central status change ────────────────────────────────────────
  const handleStatusChange = useCallback(
    (externalId: string, newStatus: MatchStatus) => {
      const prevStatus = statuses[externalId] ?? UNREVIEWED;
      updateStatus(externalId, newStatus);

      const record = recordsByExternalId.get(externalId);
      if (record) {
        const name = fullName(record.externalPatient);
        const label =
          newStatus === CONFIRMED
            ? `Confirmed ${name}`
            : newStatus === REJECTED
              ? `Rejected ${name}`
              : newStatus === FOLLOW_UP
                ? `Flagged ${name} for follow up`
                : `Reverted ${name} to unreviewed`;
        pushUndoToast(label, () => {
          updateStatus(externalId, prevStatus);
        });
      }
    },
    [statuses, updateStatus, recordsByExternalId, pushUndoToast],
  );

  const handleAddNote = useCallback(
    (externalId: string, text: string) => {
      addNote(externalId, text);
    },
    [addNote],
  );

  // ─── Compare modal handlers ───────────────────────────────────────
  const openCompare = useCallback((record: MatchRecord) => {
    setCompareExternalId(record.match.ExternalPatientId);
  }, []);

  const closeCompare = useCallback(() => {
    setCompareExternalId(null);
  }, []);

  const handleCompareConfirm = useCallback(
    (note?: string) => {
      if (!compareExternalId) return;
      if (note) addNote(compareExternalId, note);
      handleStatusChange(compareExternalId, CONFIRMED);
      setCompareExternalId(null);
    },
    [compareExternalId, addNote, handleStatusChange],
  );

  const handleCompareReject = useCallback(
    (reason: RejectionReason, note?: string) => {
      if (!compareExternalId) return;
      if (note) addNote(compareExternalId, note);
      setRejectionReason(compareExternalId, reason);
      handleStatusChange(compareExternalId, REJECTED);
      setCompareExternalId(null);
    },
    [compareExternalId, addNote, setRejectionReason, handleStatusChange],
  );

  const handleCompareFollowUp = useCallback(
    (note?: string) => {
      if (!compareExternalId) return;
      if (note) addNote(compareExternalId, note);
      handleStatusChange(compareExternalId, FOLLOW_UP);
      setCompareExternalId(null);
    },
    [compareExternalId, addNote, handleStatusChange],
  );

  const handleCompareUndo = useCallback(() => {
    if (!compareExternalId) return;
    handleStatusChange(compareExternalId, UNREVIEWED);
    setCompareExternalId(null);
  }, [compareExternalId, handleStatusChange]);

  // ─── Quick review delegates ───────────────────────────────────────
  const handleQuickReviewConfirm = useCallback(
    (externalId: string) => {
      handleStatusChange(externalId, CONFIRMED);
    },
    [handleStatusChange],
  );

  const handleQuickReviewReject = useCallback(
    (externalId: string, reason: RejectionReason) => {
      setRejectionReason(externalId, reason);
      handleStatusChange(externalId, REJECTED);
    },
    [setRejectionReason, handleStatusChange],
  );

  const handleQuickReviewFollowUp = useCallback(
    (externalId: string) => {
      handleStatusChange(externalId, FOLLOW_UP);
    },
    [handleStatusChange],
  );

  // ─── Reject dialog ────────────────────────────────────────────────
  const requestReject = useCallback((id: string) => {
    setRejectExternalId(id);
  }, []);

  const executeReject = useCallback(
    (reason: RejectionReason) => {
      if (!rejectExternalId) return;
      setRejectionReason(rejectExternalId, reason);
      handleStatusChange(rejectExternalId, REJECTED);
      setRejectExternalId(null);
    },
    [rejectExternalId, setRejectionReason, handleStatusChange],
  );

  const cancelReject = useCallback(() => {
    setRejectExternalId(null);
  }, []);

  // ─── Note dialog ──────────────────────────────────────────────────
  const openNoteDialog = useCallback((id: string) => {
    setNoteDialogId(id);
  }, []);

  const closeNoteDialog = useCallback(() => {
    setNoteDialogId(null);
  }, []);

  // ─── Search suggestions ───────────────────────────────────────────
  const searchSuggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return matchRecords
      .filter((r) => patientMatchesQuery(r.internalPatient, q) || patientMatchesQuery(r.externalPatient, q))
      .slice(0, 8)
      .map((r) => ({
        record: r,
        label: `${fullName(r.internalPatient)} / ${fullName(r.externalPatient)}`,
        dob: formatDOB(r.internalPatient.DOB),
        confidence: `${Math.round(r.match.ConfidenceScore * 100)}%`,
      }));
  }, [matchRecords, search]);

  const handleSelectSuggestion = useCallback(
    (record: MatchRecord) => {
      setCompareExternalId(record.match.ExternalPatientId);
      setSearch('');
    },
    [setSearch],
  );

  // ─── Tab change ───────────────────────────────────────────────────
  const handleTabChange = useCallback(
    (tab: MatchStatus) => {
      setActiveTab(tab);
      clearSelection();
    },
    [setActiveTab, clearSelection],
  );

  const value: AppContextValue = {
    compareRecord,
    openCompare,
    closeCompare,
    handleCompareConfirm,
    handleCompareReject,
    handleCompareFollowUp,
    handleCompareUndo,
    handleStatusChange,
    handleAddNote,
    handleQuickReviewConfirm,
    handleQuickReviewReject,
    handleQuickReviewFollowUp,
    rejectExternalId,
    requestReject,
    executeReject,
    cancelReject,
    noteDialogRecord,
    openNoteDialog,
    closeNoteDialog,
    searchSuggestions,
    handleSelectSuggestion,
    handleTabChange,
    undoToasts,
    dismissToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

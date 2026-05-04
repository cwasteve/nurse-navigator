import { useState, useMemo, useCallback } from 'react';
import { ListChecks } from 'lucide-react';
import type { MatchStatus, RejectionReason, MatchRecord } from './types';
import { STATUS } from './constants/status';
import { createNote } from './utils/nurse';
import { fullName, formatDOB, patientMatchesQuery } from './utils/patients';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import Button from './components/Button';
import Tabs from './components/Tabs';
import MatchTable from './components/MatchTable';
import CompareModal from './components/CompareModal';
import RejectDialog from './components/RejectDialog';
import NoteDialog from './components/NoteDialog';
import QuickReviewModal from './components/QuickReviewModal';
import ConfidenceRangeSelector from './components/ConfidenceRangeSelector';
import UndoToast from './components/UndoToast';
import type { UndoToastItem } from './components/UndoToast';

import { useMatchReviewStore } from './hooks/useMatchReviewStore';
import { useMatchData, allMatchIds } from './hooks/useMatchData';
import { useMatchFilters } from './hooks/useMatchFilters';
import { useMatchSelection } from './hooks/useMatchSelection';

export default function App() {
  const reviewStore = useMatchReviewStore(allMatchIds);
  const { matchRecords, stats } = useMatchData(reviewStore);
  const filters = useMatchFilters(matchRecords);
  const selection = useMatchSelection(filters.tabFiltered);

  const [compareRecord, setCompareRecord] = useState<MatchRecord | null>(null);
  const [rejectExternalId, setRejectExternalId] = useState<string | null>(null);
  const [noteDialogId, setNoteDialogId] = useState<string | null>(null);
  const [undoToasts, setUndoToasts] = useState<UndoToastItem[]>([]);

  const handleTabChange = useCallback(
    (tab: MatchStatus) => {
      filters.setActiveTab(tab);
      selection.clearSelection();
    },
    [filters, selection],
  );

  // ─── Undo toast helpers ──────────────────────────────────────────
  const dismissToast = useCallback((id: string) => {
    setUndoToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushUndoToast = useCallback(
    (message: string, undoFn: () => void) => {
      const id = `${Date.now()}-${Math.random()}`;
      setUndoToasts((prev) => [...prev, { id, message, onUndo: undoFn }]);
    },
    [],
  );

  const handleStatusChange = useCallback(
    (externalId: string, newStatus: MatchStatus) => {
      const prevStatus = reviewStore.statuses[externalId] ?? STATUS.PENDING;
      reviewStore.updateStatus(externalId, newStatus);
      setCompareRecord((prev) =>
        prev && prev.match.ExternalPatientId === externalId
          ? { ...prev, status: newStatus, rejectionReason: newStatus === STATUS.PENDING ? undefined : prev.rejectionReason }
          : prev,
      );
      // Push undo toast for every status change
      const record = matchRecords.find((r) => r.match.ExternalPatientId === externalId);
      if (record) {
        const name = fullName(record.externalPatient);
        const label = newStatus === STATUS.CONFIRMED ? `Confirmed ${name}`
          : newStatus === STATUS.REJECTED ? `Rejected ${name}`
          : newStatus === STATUS.FOLLOW_UP ? `Flagged ${name} for follow up`
          : `Reverted ${name} to unreviewed`;
        pushUndoToast(label, () => {
          reviewStore.updateStatus(externalId, prevStatus);
        });
      }
    },
    [reviewStore, matchRecords, pushUndoToast],
  );

  const requestAction = useCallback((_type: 'confirm' | 'reject' | 'follow_up' | 'undo', externalId: string) => {
    // Only reject uses a dialog (to collect the required reason)
    setRejectExternalId(externalId);
  }, []);

  const executeReject = useCallback(
    (reason: RejectionReason) => {
      if (!rejectExternalId) return;
      reviewStore.setRejectionReason(rejectExternalId, reason);
      handleStatusChange(rejectExternalId, STATUS.REJECTED);
      setRejectExternalId(null);
    },
    [rejectExternalId, reviewStore, handleStatusChange],
  );

  const handleAddNote = useCallback(
    (externalId: string, text: string) => {
      reviewStore.addNote(externalId, text);
      setCompareRecord((prev) => {
        if (!prev || prev.match.ExternalPatientId !== externalId) return prev;
        return { ...prev, notes: [...prev.notes, createNote(text)] };
      });
    },
    [reviewStore],
  );

  // ─── CompareModal direct-action handlers ─────────────────────────
  const handleCompareConfirm = useCallback(
    (note?: string) => {
      if (!compareRecord) return;
      const id = compareRecord.match.ExternalPatientId;
      if (note) reviewStore.addNote(id, note);
      handleStatusChange(id, STATUS.CONFIRMED);
      setCompareRecord(null);
    },
    [compareRecord, reviewStore, handleStatusChange],
  );

  const handleCompareReject = useCallback(
    (reason: RejectionReason, note?: string) => {
      if (!compareRecord) return;
      const id = compareRecord.match.ExternalPatientId;
      if (note) reviewStore.addNote(id, note);
      reviewStore.setRejectionReason(id, reason);
      handleStatusChange(id, STATUS.REJECTED);
      setCompareRecord(null);
    },
    [compareRecord, reviewStore, handleStatusChange],
  );

  const handleCompareFollowUp = useCallback(
    (note?: string) => {
      if (!compareRecord) return;
      const id = compareRecord.match.ExternalPatientId;
      if (note) reviewStore.addNote(id, note);
      handleStatusChange(id, STATUS.FOLLOW_UP);
      setCompareRecord(null);
    },
    [compareRecord, reviewStore, handleStatusChange],
  );

  const handleCompareUndo = useCallback(() => {
    if (!compareRecord) return;
    handleStatusChange(compareRecord.match.ExternalPatientId, STATUS.PENDING);
    setCompareRecord(null);
  }, [compareRecord, handleStatusChange]);

  const handleQuickReviewConfirm = useCallback(
    (externalId: string) => {
      handleStatusChange(externalId, STATUS.CONFIRMED);
    },
    [handleStatusChange],
  );

  const handleQuickReviewReject = useCallback(
    (externalId: string, reason: RejectionReason) => {
      reviewStore.setRejectionReason(externalId, reason);
      handleStatusChange(externalId, STATUS.REJECTED);
    },
    [reviewStore, handleStatusChange],
  );

  const handleQuickReviewFollowUp = useCallback(
    (externalId: string) => {
      handleStatusChange(externalId, STATUS.FOLLOW_UP);
    },
    [handleStatusChange],
  );

  const searchSuggestions = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
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
  }, [matchRecords, filters.search]);

  const handleSelectSuggestion = useCallback(
    (record: MatchRecord) => {
      setCompareRecord(record);
      filters.setSearch('');
    },
    [filters],
  );

  const noteDialogRecord = useMemo(() => {
    if (!noteDialogId) return null;
    return matchRecords.find((r) => r.match.ExternalPatientId === noteDialogId) ?? null;
  }, [noteDialogId, matchRecords]);

  if (reviewStore.isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-sm text-neutral-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Toolbar */}
      <div className="bg-white border-b border-neutral-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <SearchBar
            value={filters.search}
            onChange={filters.setSearch}
            suggestions={searchSuggestions}
            onSelectSuggestion={handleSelectSuggestion}
          />
          <span className="text-sm text-neutral-400">
            {filters.tabFiltered.length} of {matchRecords.length} matches
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <Tabs
            activeTab={filters.activeTab}
            onTabChange={handleTabChange}
            counts={stats}
          />
        </div>
      </div>

      {/* Selection Toolbar — always visible on pending tab */}
      {filters.activeTab === STATUS.PENDING && (
        <div className={`border-b px-6 py-2.5 ${selection.selectedIds.size > 0 ? 'bg-primary-bg border-primary/20' : 'bg-neutral-50 border-neutral-200'}`}>
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            {selection.selectedIds.size > 0 ? (
              <>
                <span className="text-sm font-medium text-primary">{selection.selectedIds.size} selected</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={selection.openQuickReview}>
                  <ListChecks className="w-3.5 h-3.5" />
                  Quick Review
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selection.clearSelection}>
                  Clear Selection
                </Button>
              </>
            ) : (
              <span className="text-sm text-neutral-500">
                Select matches using checkboxes or by confidence level to Quick Review in bulk
              </span>
            )}
            <div className="ml-auto">
              <ConfidenceRangeSelector onSelect={selection.selectByRange} />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <main className="flex-1 px-6 py-4">
        <MatchTable
          records={filters.tabFiltered}
          activeTab={filters.activeTab}
          sort={filters.sort}
          onToggleSort={filters.toggleSort}
          selectedIds={selection.selectedIds}
          onToggleSelectAll={selection.toggleSelectAll}
          onToggleSelectRow={selection.toggleSelectRow}
          onCompare={setCompareRecord}
          onRequestAction={requestAction}
          onStatusChange={handleStatusChange}
          onOpenNotes={setNoteDialogId}
        />
      </main>

      {/* Compare Modal */}
      {compareRecord && (
        <CompareModal
          open={!!compareRecord}
          internalPatient={compareRecord.internalPatient}
          externalPatient={compareRecord.externalPatient}
          confidenceScore={compareRecord.match.ConfidenceScore}
          status={compareRecord.status}
          onClose={() => setCompareRecord(null)}
          onConfirmDirect={handleCompareConfirm}
          onRejectDirect={handleCompareReject}
          onFollowUpDirect={handleCompareFollowUp}
          onUndoDirect={handleCompareUndo}
          notes={compareRecord.notes}
          onAddNote={(text) => handleAddNote(compareRecord.match.ExternalPatientId, text)}
          rejectionReason={compareRecord.rejectionReason}
        />
      )}

      {/* Reject Dialog (row-level reject needs a reason) */}
      <RejectDialog
        open={!!rejectExternalId}
        onConfirm={executeReject}
        onCancel={() => setRejectExternalId(null)}
      />

      {/* Note Dialog */}
      {noteDialogRecord && (
        <NoteDialog
          open={!!noteDialogRecord}
          onClose={() => setNoteDialogId(null)}
          notes={noteDialogRecord.notes}
          onAddNote={(text) => handleAddNote(noteDialogRecord.match.ExternalPatientId, text)}
          patientLabel={fullName(noteDialogRecord.externalPatient)}
          editable={noteDialogRecord.status === STATUS.FOLLOW_UP}
        />
      )}

      {/* Quick Review Modal */}
      {selection.quickReviewOpen && (
        <QuickReviewModal
          open={selection.quickReviewOpen}
          records={selection.quickReviewRecords}
          onClose={selection.closeQuickReview}
          onConfirm={handleQuickReviewConfirm}
          onReject={handleQuickReviewReject}
          onFollowUp={handleQuickReviewFollowUp}
          onAddNote={handleAddNote}
          notes={reviewStore.notes}
        />
      )}

      {/* Undo Toasts */}
      <UndoToast toasts={undoToasts} onDismiss={dismissToast} />
    </div>
  );
}

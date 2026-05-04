import { useState, useMemo, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, AlertTriangle, SkipForward, CheckCircle2 } from 'lucide-react';
import type { MatchRecord, RejectionReason } from '../types';
import { STATUS, FACILITY_NAME } from '../constants';
import { fullName, formatTimestamp } from '../utils/patients';

const { CONFIRMED, REJECTED, FOLLOW_UP, UNREVIEWED } = STATUS;
import { useMatchFilterCtx, useAppCtx, useMatchDataCtx } from '../contexts';
import { FieldComparisonRow, buildFieldRows } from './FieldComparison';
import { ConfidenceBadge } from './Badge';
import Button from './Button';
import ActionForm from './ActionForm';

type ActionType = typeof CONFIRMED | typeof REJECTED | typeof FOLLOW_UP | 'skipped';

export default function QuickReviewModal() {
  const { quickReviewRecords, quickReviewOpen, closeQuickReview } = useMatchFilterCtx();
  const { handleQuickReviewConfirm, handleQuickReviewReject, handleQuickReviewFollowUp, handleAddNote } = useAppCtx();
  const { notes } = useMatchDataCtx();

  // If we don't do this we get a flash on re-render - this is an easy way to prevent that without additional complexity
  const [snapshot] = useState(() => {
    const queue = quickReviewRecords.map((r) => r.match.ExternalPatientId);
    const map = new Map<string, MatchRecord>();
    for (const r of quickReviewRecords) {
      map.set(r.match.ExternalPatientId, r);
    }
    return { queue, map };
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [results, setResults] = useState<Record<string, ActionType>>({});

  const totalCount = snapshot.queue.length;
  const reviewedCount = Object.keys(results).length;
  const isComplete = reviewedCount >= totalCount;

  const currentRecord =
    !isComplete && snapshot.queue[currentIndex] ? (snapshot.map.get(snapshot.queue[currentIndex]) ?? null) : null;

  const advanceToNext = useCallback(() => {
    setTransitioning(true);
    requestAnimationFrame(() => {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setTransitioning(false);
      }, 150);
    });
  }, []);

  const handleConfirmDirect = useCallback(
    (note?: string) => {
      if (!currentRecord) return;
      const id = currentRecord.match.ExternalPatientId;
      if (note) handleAddNote(id, note);
      handleQuickReviewConfirm(id);
      setResults((prev) => ({ ...prev, [id]: CONFIRMED }));
      advanceToNext();
    },
    [currentRecord, handleQuickReviewConfirm, handleAddNote, advanceToNext],
  );

  const handleRejectDirect = useCallback(
    (reason: RejectionReason, note?: string) => {
      if (!currentRecord) return;
      const id = currentRecord.match.ExternalPatientId;
      if (note) handleAddNote(id, note);
      handleQuickReviewReject(id, reason);
      setResults((prev) => ({ ...prev, [id]: REJECTED }));
      advanceToNext();
    },
    [currentRecord, handleQuickReviewReject, handleAddNote, advanceToNext],
  );

  const handleFollowUpDirect = useCallback(
    (note?: string) => {
      if (!currentRecord) return;
      const id = currentRecord.match.ExternalPatientId;
      if (note) handleAddNote(id, note);
      handleQuickReviewFollowUp(id);
      setResults((prev) => ({ ...prev, [id]: FOLLOW_UP }));
      advanceToNext();
    },
    [currentRecord, handleQuickReviewFollowUp, handleAddNote, advanceToNext],
  );

  const handleSkip = useCallback(() => {
    if (!currentRecord) return;
    const id = currentRecord.match.ExternalPatientId;
    setResults((prev) => ({ ...prev, [id]: 'skipped' }));
    advanceToNext();
  }, [currentRecord, advanceToNext]);

  const summary = useMemo(() => {
    const counts = { confirmed: 0, rejected: 0, follow_up: 0, skipped: 0 };
    for (const action of Object.values(results)) {
      counts[action]++;
    }
    return counts;
  }, [results]);

  const progressPct = totalCount > 0 ? (reviewedCount / totalCount) * 100 : 0;
  const displayIndex = Math.min(currentIndex + 1, totalCount);

  const currentNotes = currentRecord ? (notes[currentRecord.match.ExternalPatientId] ?? []) : [];

  return (
    <Dialog.Root
      open={quickReviewOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) closeQuickReview();
      }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content
          className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden
            flex flex-col focus:outline-none"
          aria-describedby={undefined}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <Dialog.Title className="text-lg font-semibold text-neutral-900 font-display">Quick Review</Dialog.Title>
              {!isComplete && (
                <span className="text-sm text-neutral-500">
                  {displayIndex} of {totalCount}
                </span>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-neutral-100">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto">
            {isComplete ? (
              /* Completion summary */
              <div className="px-6 py-12 text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="w-12 h-12 text-success" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-900 font-display mb-2">Review Complete</h2>
                <p className="text-sm text-neutral-500 mb-8">All {totalCount} matches have been reviewed.</p>
                <div className="flex justify-center gap-6 mb-8">
                  {summary.confirmed > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">{summary.confirmed}</div>
                      <div className="text-xs text-neutral-500 mt-1">Confirmed</div>
                    </div>
                  )}
                  {summary.rejected > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-danger">{summary.rejected}</div>
                      <div className="text-xs text-neutral-500 mt-1">Rejected</div>
                    </div>
                  )}
                  {summary.follow_up > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-warning">{summary.follow_up}</div>
                      <div className="text-xs text-neutral-500 mt-1">Flagged</div>
                    </div>
                  )}
                  {summary.skipped > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-neutral-500">{summary.skipped}</div>
                      <div className="text-xs text-neutral-500 mt-1">Skipped</div>
                    </div>
                  )}
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={closeQuickReview}>
                  Done
                </Button>
              </div>
            ) : currentRecord ? (
              <div
                key={currentRecord.match.ExternalPatientId}
                className={`transition-opacity duration-150 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
                {/* Low confidence warning */}
                {currentRecord.match.ConfidenceScore < 0.6 && (
                  <div className="flex items-center gap-2 px-6 py-2.5 bg-warning-bg border-b border-warning/20">
                    <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                    <span className="text-sm text-warning font-medium">Low confidence match — review carefully</span>
                  </div>
                )}

                {/* Patient names + confidence */}
                <div className="px-6 py-3 flex items-center gap-3 border-b border-neutral-100">
                  <ConfidenceBadge score={currentRecord.match.ConfidenceScore} />
                  <span className="text-sm font-medium text-neutral-800">
                    {fullName(currentRecord.internalPatient)}
                  </span>
                  <span className="text-neutral-400">↔</span>
                  <span className="text-sm font-medium text-neutral-800">
                    {fullName(currentRecord.externalPatient)}
                  </span>
                </div>

                {/* Column headers */}
                <div className="grid grid-cols-[140px_1fr_1fr_28px] gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-200">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Field</span>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">{FACILITY_NAME}</span>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">External</span>
                  <span />
                </div>

                {/* Field comparisons */}
                <div className="px-6 py-2">
                  {buildFieldRows(currentRecord.internalPatient, currentRecord.externalPatient).map((field) => (
                    <FieldComparisonRow
                      key={field.label}
                      {...field}
                    />
                  ))}
                </div>

                {/* Notes section */}
                {currentNotes.length > 0 && (
                  <div className="px-6 py-4 border-t border-neutral-200">
                    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                      Notes ({currentNotes.length})
                    </h3>
                    <div className="space-y-2 max-h-28 overflow-y-auto">
                      {currentNotes.map((note) => (
                        <div
                          key={note.timestamp}
                          className="border border-neutral-100 rounded-md p-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-neutral-700">{note.nurseLabel}</span>
                            <span className="text-xs text-neutral-400">{formatTimestamp(note.timestamp)}</span>
                          </div>
                          <p className="text-sm text-neutral-800 whitespace-pre-wrap">{note.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Footer actions — ActionForm + Skip */}
          {!isComplete && currentRecord && (
            <div className="border-t border-neutral-200 px-6 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}>
                  <SkipForward className="w-3.5 h-3.5" />
                  Skip
                </Button>
              </div>
              <ActionForm
                key={currentRecord.match.ExternalPatientId}
                status={UNREVIEWED}
                onConfirmDirect={handleConfirmDirect}
                onRejectDirect={handleRejectDirect}
                onFollowUpDirect={handleFollowUpDirect}
                onUndoDirect={() => {}}
              />
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

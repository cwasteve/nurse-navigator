import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { InternalPatient, ExternalPatient, MatchStatus, RejectionReason, Note } from '../types';
import { REJECTION_CONFIG, STATUS, FACILITY_NAME } from '../constants';
import { formatTimestamp } from '../utils/patients';
import { FieldComparisonRow, buildFieldRows } from './FieldComparison';
import { ConfidenceBadge, StatusBadge } from './Badge';
import NoteInput from './NoteInput';
import ActionForm from './ActionForm';

interface CompareModalProps {
  open: boolean;
  internalPatient: InternalPatient;
  externalPatient: ExternalPatient | null;
  confidenceScore: number | null;
  status: MatchStatus;
  onClose: () => void;
  onConfirmDirect: (note?: string) => void;
  onRejectDirect: (reason: RejectionReason, note?: string) => void;
  onFollowUpDirect: (note?: string) => void;
  onUndoDirect: () => void;
  notes: Note[];
  onAddNote: (text: string) => void;
  rejectionReason?: RejectionReason;
}

export default function CompareModal({
  open,
  internalPatient,
  externalPatient,
  confidenceScore,
  status,
  onClose,
  onConfirmDirect,
  onRejectDirect,
  onFollowUpDirect,
  onUndoDirect,
  notes,
  onAddNote,
  rejectionReason,
}: CompareModalProps) {
  const fields = buildFieldRows(internalPatient, externalPatient);

  const isFollowUp = status === STATUS.FOLLOW_UP;

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content
          className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto
            focus:outline-none"
          aria-describedby={undefined}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Dialog.Title className="text-lg font-semibold text-neutral-900 font-display">
                {externalPatient ? 'Compare Records' : 'Patient Details'}
              </Dialog.Title>
              {confidenceScore !== null && <ConfidenceBadge score={confidenceScore} />}
              <StatusBadge status={status} />
              {status === STATUS.REJECTED && rejectionReason && (
                <span className="text-xs text-neutral-500">
                  Reason: {REJECTION_CONFIG[rejectionReason].shortLabel}
                </span>
              )}
            </div>

            <Dialog.Close asChild>
              <button
                className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[140px_1fr_1fr_28px] gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-200">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Field</span>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">{FACILITY_NAME}</span>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              {externalPatient ? 'External' : ''}
            </span>
            <span />
          </div>

          {/* Field comparisons */}
          <div className="px-6 py-2">
            {fields.map((field) => (
              <FieldComparisonRow key={field.label} {...field} />
            ))}
          </div>

          {/* Ongoing notes section — always visible for follow_up */}
          {isFollowUp && (
            <div className="px-6 py-4 border-t border-neutral-200">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Notes {notes.length > 0 && `(${notes.length})`}
              </h3>
              {notes.length > 0 && (
                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                  {notes.map((note, i) => (
                    <div key={i} className="border border-neutral-100 rounded-md p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-neutral-700">{note.nurseLabel}</span>
                        <span className="text-xs text-neutral-400">{formatTimestamp(note.timestamp)}</span>
                      </div>
                      <p className="text-sm text-neutral-800 whitespace-pre-wrap">{note.text}</p>
                    </div>
                  ))}
                </div>
              )}
              <NoteInput onSubmit={onAddNote} />
            </div>
          )}

          {/* Notes display for non-follow_up statuses (read-only) */}
          {!isFollowUp && notes.length > 0 && (
            <div className="px-6 py-4 border-t border-neutral-200">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Notes ({notes.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {notes.map((note, i) => (
                  <div key={i} className="border border-neutral-100 rounded-md p-2.5">
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

          {/* Footer actions — key resets ActionForm state on status change */}
          {externalPatient && (
            <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-6 py-4 rounded-b-xl">
              <ActionForm
                key={`${open}-${status}`}
                status={status}
                onConfirmDirect={onConfirmDirect}
                onRejectDirect={onRejectDirect}
                onFollowUpDirect={onFollowUpDirect}
                onUndoDirect={onUndoDirect}
              />
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

import { useState } from 'react';
import type { MatchStatus, RejectionReason, ActionIntent } from '../types';
import { STATUS } from '../constants/status';
import { ACTION } from '../constants/actions';
import { REJECTION_CONFIG } from '../constants';
import Button from './Button';
import Textarea from './Textarea';

export interface ActionFormProps {
  status: MatchStatus;
  onConfirmDirect: (note?: string) => void;
  onRejectDirect: (reason: RejectionReason, note?: string) => void;
  onFollowUpDirect: (note?: string) => void;
  onUndoDirect: () => void;
}

export default function ActionForm({ status, onConfirmDirect, onRejectDirect, onFollowUpDirect, onUndoDirect }: ActionFormProps) {
  const [actionIntent, setActionIntent] = useState<ActionIntent | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [rejectionReasonLocal, setRejectionReasonLocal] = useState<RejectionReason | null>(null);

  const isPending = status === STATUS.PENDING;
  const isFollowUp = status === STATUS.FOLLOW_UP;
  const isTerminal = status === STATUS.CONFIRMED || status === STATUS.REJECTED;

  const handleSelectAction = (intent: ActionIntent | null) => {
    if (intent === ACTION.CONFIRM) {
      onConfirmDirect();
      return;
    }
    setActionIntent(intent);
    setActionNote('');
    setRejectionReasonLocal(null);
  };

  const handleExecuteAction = () => {
    const trimmedNote = actionNote.trim() || undefined;
    switch (actionIntent) {
      case ACTION.CONFIRM:
        onConfirmDirect(trimmedNote);
        break;
      case ACTION.FOLLOW_UP:
        onFollowUpDirect(trimmedNote);
        break;
      case ACTION.REJECT:
        if (rejectionReasonLocal) {
          onRejectDirect(rejectionReasonLocal, trimmedNote);
        }
        break;
      case ACTION.REVERT:
        onUndoDirect();
        break;
    }
  };

  const actionOptions: { value: ActionIntent; label: string }[] = isPending
    ? [
        { value: ACTION.CONFIRM, label: 'Confirm' },
        { value: ACTION.FOLLOW_UP, label: 'Needs Follow Up' },
        { value: ACTION.REJECT, label: 'Reject' },
      ]
    : isFollowUp
      ? [
          { value: ACTION.CONFIRM, label: 'Confirm' },
          { value: ACTION.REJECT, label: 'Reject' },
          { value: ACTION.REVERT, label: 'Revert to Unreviewed' },
        ]
      : [];

  // Show note field only for follow_up action (or when on follow_up tab for confirm/reject)
  const showNoteField = actionIntent === ACTION.FOLLOW_UP || (isFollowUp && actionIntent !== ACTION.REVERT && actionIntent !== null);

  // Terminal statuses: just an Undo button
  if (isTerminal) {
    return (
      <div className="flex justify-end">
        <Button variant="secondary" size="sm" onClick={onUndoDirect}>
          Undo — Revert to Unreviewed
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action selector radio group */}
      <div role="radiogroup" aria-label="Choose action" className="flex gap-2">
        {actionOptions.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm font-medium
              ${actionIntent === opt.value
                ? 'border-primary bg-primary-bg text-primary'
                : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              }`}
          >
            <input
              type="radio"
              name="action-intent"
              role="radio"
              value={opt.value!}
              checked={actionIntent === opt.value}
              onChange={() => handleSelectAction(opt.value)}
              className="sr-only"
              aria-label={opt.label}
            />
            <span
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center pointer-events-none
                ${actionIntent === opt.value ? 'border-primary' : 'border-neutral-300'}`}
            >
              {actionIntent === opt.value && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </span>
            {opt.label}
          </label>
        ))}
      </div>

      {/* Conditional action form */}
      {actionIntent && actionIntent !== ACTION.REVERT && (
        <div className="space-y-3">
          {/* Rejection reason selector (only for reject) */}
          {actionIntent === ACTION.REJECT && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Rejection Reason
              </span>
              <div className="space-y-1.5">
                {(Object.entries(REJECTION_CONFIG) as [RejectionReason, typeof REJECTION_CONFIG[RejectionReason]][]).map(([value, meta]) => (
                  <label
                    key={value}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-colors text-sm
                      ${rejectionReasonLocal === value
                        ? 'border-red-300 bg-red-50 text-red-800'
                        : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name="rejection-reason"
                      role="radio"
                      value={value}
                      checked={rejectionReasonLocal === value}
                      onChange={() => setRejectionReasonLocal(value)}
                      className="sr-only"
                      aria-label={meta.fullLabel}
                    />
                    <span
                      className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center pointer-events-none
                        ${rejectionReasonLocal === value ? 'border-red-500' : 'border-neutral-300'}`}
                    >
                      {rejectionReasonLocal === value && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      )}
                    </span>
                    {meta.fullLabel}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Optional note textarea — only for follow_up action or when acting from follow_up status */}
          {showNoteField && (
            <Textarea
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="Add an optional note..."
              rows={2}
              className="w-full"
            />
          )}

          {/* Action button */}
          <div className="flex justify-end">
            {actionIntent === ACTION.FOLLOW_UP && (
              <Button variant="warning" size="sm" onClick={handleExecuteAction}>
                Flag for Follow Up
              </Button>
            )}
            {actionIntent === ACTION.REJECT && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleExecuteAction}
                disabled={!rejectionReasonLocal}
              >
                Reject Match
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Revert action — just a button, no note field */}
      {actionIntent === ACTION.REVERT && (
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={handleExecuteAction}>
            Revert to Unreviewed
          </Button>
        </div>
      )}
    </div>
  );
}

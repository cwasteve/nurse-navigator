import { useState } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import type { RejectionReason } from '../types';
import { REJECTION_CONFIG } from '../constants';
import { useAppCtx } from '../contexts';
import Button from './Button';

export default function RejectDialog() {
  const { rejectExternalId, executeReject, cancelReject } = useAppCtx();
  const [selected, setSelected] = useState<RejectionReason | null>(null);

  const open = !!rejectExternalId;

  function handleCancel() {
    setSelected(null);
    cancelReject();
  }

  function handleConfirm() {
    if (!selected) return;
    executeReject(selected);
    setSelected(null);
  }

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleCancel();
      }}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-60 bg-black/40" />
        <AlertDialog.Content
          className="fixed z-60 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6
            focus:outline-none">
          <AlertDialog.Title className="text-base font-semibold text-neutral-900 font-display">
            Reject this match?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-neutral-600 leading-relaxed">
            Select a reason for rejecting this match. You can undo this later.
          </AlertDialog.Description>

          <fieldset className="mt-4 space-y-2">
            {(Object.entries(REJECTION_CONFIG) as [RejectionReason, (typeof REJECTION_CONFIG)[RejectionReason]][]).map(
              ([value, meta]) => (
                <label
                  key={value}
                  className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors
                  ${
                    selected === value ? 'border-primary bg-primary/7' : 'border-neutral-200 hover:border-neutral-300'
                  }`}>
                  <input
                    type="radio"
                    name="rejection-reason"
                    value={value}
                    checked={selected === value}
                    onChange={() => setSelected(value)}
                    className="mt-0.5 accent-primary"
                  />
                  <span className="text-sm text-neutral-700">{meta.fullLabel}</span>
                </label>
              ),
            )}
          </fieldset>

          <div className="mt-5 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <Button
                variant="secondary"
                size="sm">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirm}
                disabled={!selected}>
                Yes, Reject
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

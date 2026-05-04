import { useRef } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import Button from './Button';
import Textarea from './Textarea';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
  showNoteField?: boolean;
  noteValue?: string;
  onNoteChange?: (text: string) => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  onConfirm,
  onCancel,
  showNoteField,
  noteValue,
  onNoteChange,
}: ConfirmDialogProps) {
  const confirmedRef = useRef(false);

  return (
    <AlertDialog.Root open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        if (confirmedRef.current) {
          confirmedRef.current = false;
        } else {
          onCancel();
        }
      }
    }}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-60 bg-black/40" />
        <AlertDialog.Content
          className="fixed z-60 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6
            focus:outline-none"
        >
          <AlertDialog.Title className="text-base font-semibold text-neutral-900 font-display">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-neutral-600 leading-relaxed">
            {message}
          </AlertDialog.Description>
          {showNoteField && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-neutral-500 mb-1">
                Note <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <Textarea
                value={noteValue ?? ''}
                onChange={(e) => onNoteChange?.(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                className="w-full"
              />
            </div>
          )}
          <div className="mt-5 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <Button variant="secondary" size="sm">
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button variant={variant} size="sm" onClick={() => {
                confirmedRef.current = true;
                onConfirm();
              }}>
                {confirmLabel}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

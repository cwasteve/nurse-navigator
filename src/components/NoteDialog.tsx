import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { STATUS } from '../constants/status';
import { fullName, formatTimestamp } from '../utils/patients';

const { FOLLOW_UP } = STATUS;
import { useAppCtx } from '../contexts';
import NoteInput from './NoteInput';

export default function NoteDialog() {
  const { noteDialogRecord, closeNoteDialog, handleAddNote } = useAppCtx();

  if (!noteDialogRecord) return null;

  const { notes, externalPatient, match, status } = noteDialogRecord;
  const patientLabel = fullName(externalPatient);
  const editable = status === FOLLOW_UP;

  return (
    <Dialog.Root open onOpenChange={(isOpen) => { if (!isOpen) closeNoteDialog(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content
          className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] flex flex-col
            focus:outline-none"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
            <Dialog.Title className="text-base font-semibold text-neutral-900 font-display">
              Notes — {patientLabel}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {notes.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-6">No notes yet.</p>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.timestamp} className="border border-neutral-100 rounded-md p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-neutral-700">{note.nurseLabel}</span>
                      <span className="text-xs text-neutral-400">{formatTimestamp(note.timestamp)}</span>
                    </div>
                    <p className="text-sm text-neutral-800 whitespace-pre-wrap">{note.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {editable && (
            <div className="border-t border-neutral-200 px-5 py-4">
              <NoteInput onSubmit={(text) => handleAddNote(match.ExternalPatientId, text)} />
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

import React, { type ReactNode } from 'react';
import type { MatchStatus, Note } from '../../../src/types';
import { AppContext, MatchDataContext } from '../../../src/contexts';
import { makeRecord, defaultAppCtx, defaultMatchDataCtx } from '../test-utils';

export default function NoteDialogWrapper({
  status = 'follow_up',
  notes = [],
  onAddNote,
  onClose,
  children,
}: {
  status?: MatchStatus;
  notes?: Note[];
  onAddNote?: (id: string, text: string) => void;
  onClose?: () => void;
  children: ReactNode;
}) {
  const noteDialogRecord = makeRecord({ status, notes });
  return (
    <MatchDataContext.Provider value={{ ...defaultMatchDataCtx }}>
      <AppContext.Provider
        value={{
          ...defaultAppCtx,
          noteDialogRecord,
          handleAddNote: onAddNote ?? defaultAppCtx.handleAddNote,
          closeNoteDialog: onClose ?? defaultAppCtx.closeNoteDialog,
        }}>
        {children}
      </AppContext.Provider>
    </MatchDataContext.Provider>
  );
}

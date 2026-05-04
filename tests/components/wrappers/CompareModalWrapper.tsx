import React, { type ReactNode } from 'react';
import type { MatchStatus, Note, RejectionReason } from '../../../src/types';
import { AppContext, MatchDataContext } from '../../../src/contexts';
import { makeRecord, defaultAppCtx, defaultMatchDataCtx } from '../test-utils';

export default function CompareModalWrapper({
  status = 'unreviewed',
  notes = [],
  rejectionReason,
  onConfirm,
  onReject,
  onFollowUp,
  onUndo,
  onAddNote,
  children,
}: {
  status?: MatchStatus;
  notes?: Note[];
  rejectionReason?: RejectionReason;
  onConfirm?: (note?: string) => void;
  onReject?: (reason: RejectionReason, note?: string) => void;
  onFollowUp?: (note?: string) => void;
  onUndo?: () => void;
  onAddNote?: (id: string, text: string) => void;
  children: ReactNode;
}) {
  const compareRecord = makeRecord({ status, notes, rejectionReason });
  return (
    <MatchDataContext.Provider value={{ ...defaultMatchDataCtx }}>
      <AppContext.Provider
        value={{
          ...defaultAppCtx,
          compareRecord,
          handleCompareConfirm: onConfirm ?? defaultAppCtx.handleCompareConfirm,
          handleCompareReject: onReject ?? defaultAppCtx.handleCompareReject,
          handleCompareFollowUp: onFollowUp ?? defaultAppCtx.handleCompareFollowUp,
          handleCompareUndo: onUndo ?? defaultAppCtx.handleCompareUndo,
          handleAddNote: onAddNote ?? defaultAppCtx.handleAddNote,
        }}>
        {children}
      </AppContext.Provider>
    </MatchDataContext.Provider>
  );
}

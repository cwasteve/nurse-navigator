import React, { type ReactNode } from 'react';
import type { RejectionReason } from '../../../src/types';
import { AppContext, MatchDataContext } from '../../../src/contexts';
import { makeRecord, defaultAppCtx, defaultMatchDataCtx } from '../test-utils';

const record = makeRecord();

export default function RejectDialogWrapper({
  rejectExternalId = null,
  onExecuteReject,
  onCancelReject,
  children,
}: {
  rejectExternalId?: string | null;
  onExecuteReject?: (reason: RejectionReason) => void;
  onCancelReject?: () => void;
  children: ReactNode;
}) {
  return (
    <MatchDataContext.Provider value={{ ...defaultMatchDataCtx, matchRecords: [record], recordsByExternalId: new Map([[record.match.ExternalPatientId, record]]) }}>
      <AppContext.Provider
        value={{
          ...defaultAppCtx,
          rejectExternalId,
          executeReject: onExecuteReject ?? defaultAppCtx.executeReject,
          cancelReject: onCancelReject ?? defaultAppCtx.cancelReject,
        }}>
        {children}
      </AppContext.Provider>
    </MatchDataContext.Provider>
  );
}

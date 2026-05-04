import React, { type ReactNode } from 'react';
import type {
  MatchRecord,
  MatchStatus,
  Note,
  RejectionReason,
  UndoToastItem,
  SearchSuggestion,
  InternalPatient,
  ExternalPatient,
} from '../../src/types';
import { AppContext, MatchDataContext } from '../../src/contexts';

// ─── Stub data ──────────────────────────────────────────────────────

export const stubInternal: InternalPatient = {
  InternalPatientId: 'INT001',
  FirstName: 'Jane',
  LastName: 'Smith',
  DOB: '1990-03-15',
  Sex: 'Female',
  PhoneNumber: '555-1234',
  Address: '123 Main St',
  City: 'Springfield',
  ZipCode: 62701,
};

export const stubExternal: ExternalPatient = {
  ExternalPatientId: 'EXT001',
  FirstName: 'Jane',
  LastName: 'Smith',
  DOB: '15-Mar-1990',
  Sex: 'Female',
  PhoneNumber: '555-1234',
  Address: '123 Main St',
  City: 'Springfield',
  ZipCode: 62701,
};

export function makeRecord(overrides: Partial<MatchRecord> = {}): MatchRecord {
  return {
    match: { ExternalPatientId: 'EXT001', InternalPatientId: 'INT001', ConfidenceScore: 0.92 },
    internalPatient: stubInternal,
    externalPatient: stubExternal,
    status: 'unreviewed' as MatchStatus,
    notes: [],
    ...overrides,
  };
}

// ─── Noop defaults ──────────────────────────────────────────────────

const noop = () => {};

export const defaultAppCtx = {
  compareRecord: null as MatchRecord | null,
  openCompare: noop as (r: MatchRecord) => void,
  closeCompare: noop,
  handleCompareConfirm: noop as (note?: string) => void,
  handleCompareReject: noop as (reason: RejectionReason, note?: string) => void,
  handleCompareFollowUp: noop as (note?: string) => void,
  handleCompareUndo: noop,
  handleStatusChange: noop as (id: string, status: MatchStatus) => void,
  handleAddNote: noop as (id: string, text: string) => void,
  handleQuickReviewConfirm: noop as (id: string) => void,
  handleQuickReviewReject: noop as (id: string, reason: RejectionReason) => void,
  handleQuickReviewFollowUp: noop as (id: string) => void,
  rejectExternalId: null as string | null,
  requestReject: noop as (id: string) => void,
  executeReject: noop as (reason: RejectionReason) => void,
  cancelReject: noop,
  noteDialogRecord: null as MatchRecord | null,
  openNoteDialog: noop as (id: string) => void,
  closeNoteDialog: noop,
  searchSuggestions: [] as SearchSuggestion[],
  handleSelectSuggestion: noop as (record: MatchRecord) => void,
  handleTabChange: noop as (tab: MatchStatus) => void,
  undoToasts: [] as UndoToastItem[],
  dismissToast: noop as (id: string) => void,
};

export const defaultMatchDataCtx = {
  matchRecords: [] as MatchRecord[],
  recordsByExternalId: new Map<string, MatchRecord>(),
  stats: { unreviewed: 0, follow_up: 0, confirmed: 0, rejected: 0 } as Record<MatchStatus, number>,
  isLoading: false,
  notes: {} as Record<string, Note[]>,
  statuses: {} as Record<string, MatchStatus>,
  rejectionReasons: {} as Record<string, RejectionReason>,
  updateStatus: noop as (id: string, status: MatchStatus) => void,
  addNote: noop as (id: string, text: string) => void,
  setRejectionReason: noop as (id: string, reason: RejectionReason) => void,
  removeRejectionReason: noop as (id: string) => void,
};

// ─── Provider factory ───────────────────────────────────────────────

export function wrapWithProviders(
  children: ReactNode,
  appCtx: Partial<typeof defaultAppCtx> = {},
  matchDataCtx: Partial<typeof defaultMatchDataCtx> = {},
) {
  return (
    <MatchDataContext.Provider value={{ ...defaultMatchDataCtx, ...matchDataCtx }}>
      <AppContext.Provider value={{ ...defaultAppCtx, ...appCtx }}>
        {children}
      </AppContext.Provider>
    </MatchDataContext.Provider>
  );
}

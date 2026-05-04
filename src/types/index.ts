// Derived types — re-exported from their constant files
export type { MatchStatus } from '../constants/status';
export type { RejectionReason } from '../constants/rejection';
export type { SortDirection } from '../constants/sort';
export type { ColumnKey } from '../constants/columns';
export type { ActionIntent } from '../constants/actions';

export interface InternalPatient {
  InternalPatientId: string;
  FirstName: string;
  LastName: string;
  DOB: string; // YYYY-MM-DD
  Sex: string;
  PhoneNumber: string;
  Address: string;
  City: string;
  ZipCode: number;
}

export interface ExternalPatient {
  ExternalPatientId: string;
  FirstName: string;
  LastName: string;
  DOB: string; // DD-Mon-YYYY
  Sex: string;
  PhoneNumber: string;
  Address: string;
  City: string;
  ZipCode: number;
}

export interface Match {
  ExternalPatientId: string;
  InternalPatientId: string;
  ConfidenceScore: number;
}

import type { MatchStatus } from '../constants/status';
import type { RejectionReason } from '../constants/rejection';
import type { SortDirection } from '../constants/sort';
import type { ColumnKey } from '../constants/columns';

export interface Note {
  nurseId: string;
  nurseLabel: string;
  text: string;
  timestamp: string;
}

export interface MatchRecord {
  match: Match;
  internalPatient: InternalPatient;
  externalPatient: ExternalPatient;
  status: MatchStatus;
  rejectionReason?: RejectionReason;
  notes: Note[];
}

export interface SortConfig {
  key: ColumnKey;
  direction: SortDirection;
}

// --- Table column types ---

export interface Column {
  label: string;
  tooltip: string | null;
  sortable: boolean;
}

// --- Tab types ---

export type TabKey = MatchStatus;

export interface TabDef {
  key: TabKey;
  label: string;
}

// --- Undo toast types ---

export interface UndoToastItem {
  id: string;
  message: string;
  onUndo: () => void;
}

// --- Search suggestion types ---

export interface SearchSuggestion {
  record: MatchRecord;
  label: string;
  dob?: string;
  confidence?: string;
}

// Derived types — re-exported from their constant files
import type { MatchStatus } from '../constants/status';
import type { RejectionReason } from '../constants/rejection';
import type { SortDirection } from '../constants/sort';
import type { ColumnKey } from '../constants/columns';

export type { MatchStatus } from '../constants/status';
export type { RejectionReason } from '../constants/rejection';
export type { SortDirection } from '../constants/sort';
export type { ColumnKey } from '../constants/columns';
export type { ActionIntent } from '../constants/actions';

export interface InternalPatient {
  InternalPatientId: string;
  FirstName: string;
  LastName: string;
  DOB: string; // YYYY-MM-DD --> NOTE: This is different from ExternalPatient
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
  DOB: string; // DD-Mon-YYYY --> NOTE: This is different from InternalPatient
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

export interface Column {
  label: string;
  tooltip: string | null;
  sortable: boolean;
}

export type TabKey = MatchStatus;

export interface TabDef {
  key: TabKey;
  label: string;
}

export interface UndoToastItem {
  id: string;
  message: string;
  onUndo: () => void;
}

export interface SearchSuggestion {
  record: MatchRecord;
  label: string;
  dob?: string;
  confidence?: string;
}

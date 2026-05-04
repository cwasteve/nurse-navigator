import { openDB, type IDBPDatabase } from 'idb';
import type { MatchStatus, RejectionReason, Note } from '../types';

export interface StatusRecord {
  externalId: string;
  status: MatchStatus;
}

export interface RejectionReasonRecord {
  externalId: string;
  reason: RejectionReason;
}

export interface NotesRecord {
  externalId: string;
  notes: Note[];
}

export type NurseNavDB = IDBPDatabase<{
  statuses: { key: string; value: StatusRecord };
  rejectionReasons: { key: string; value: RejectionReasonRecord };
  notes: { key: string; value: NotesRecord };
}>;

let dbPromise: Promise<NurseNavDB> | null = null;

export function getDb(): Promise<NurseNavDB> {
  if (!dbPromise) {
    dbPromise = openDB<{
      statuses: { key: string; value: StatusRecord };
      rejectionReasons: { key: string; value: RejectionReasonRecord };
      notes: { key: string; value: NotesRecord };
    }>('nurse-navigator', 1, {
      upgrade(db) {
        db.createObjectStore('statuses', { keyPath: 'externalId' });
        db.createObjectStore('rejectionReasons', { keyPath: 'externalId' });
        db.createObjectStore('notes', { keyPath: 'externalId' });
      },
    });
  }
  return dbPromise;
}

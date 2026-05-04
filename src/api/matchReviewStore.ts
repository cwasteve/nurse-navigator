import type { MatchStatus, RejectionReason, Note } from '../types';
import { getDb } from './db';

// --- Statuses ---

export async function loadAllStatuses(): Promise<Record<string, MatchStatus>> {
  const db = await getDb();
  const rows = await db.getAll('statuses');
  const result: Record<string, MatchStatus> = {};
  for (const row of rows) {
    result[row.externalId] = row.status;
  }
  return result;
}

export async function saveStatus(externalId: string, status: MatchStatus): Promise<void> {
  const db = await getDb();
  await db.put('statuses', { externalId, status });
}

// --- Rejection Reasons ---

export async function loadAllRejectionReasons(): Promise<Record<string, RejectionReason>> {
  const db = await getDb();
  const rows = await db.getAll('rejectionReasons');
  const result: Record<string, RejectionReason> = {};
  for (const row of rows) {
    result[row.externalId] = row.reason;
  }
  return result;
}

export async function saveRejectionReason(externalId: string, reason: RejectionReason): Promise<void> {
  const db = await getDb();
  await db.put('rejectionReasons', { externalId, reason });
}

export async function removeRejectionReason(externalId: string): Promise<void> {
  const db = await getDb();
  await db.delete('rejectionReasons', externalId);
}

// --- Notes ---

export async function loadAllNotes(): Promise<Record<string, Note[]>> {
  const db = await getDb();
  const rows = await db.getAll('notes');
  const result: Record<string, Note[]> = {};
  for (const row of rows) {
    result[row.externalId] = row.notes;
  }
  return result;
}

export async function saveNotes(externalId: string, notes: Note[]): Promise<void> {
  const db = await getDb();
  await db.put('notes', { externalId, notes });
}

// --- Bulk ---

export async function clearAllReviewData(): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(['statuses', 'rejectionReasons', 'notes'], 'readwrite');
  await Promise.all([
    tx.objectStore('statuses').clear(),
    tx.objectStore('rejectionReasons').clear(),
    tx.objectStore('notes').clear(),
    tx.done,
  ]);
}

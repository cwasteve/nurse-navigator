import type { Note } from '../types';

export const CURRENT_NURSE = {
  id: 'NURSE001',
  label: 'Sarah Mitchell, RN',
} as const;

export function createNote(text: string): Note {
  return {
    nurseId: CURRENT_NURSE.id,
    nurseLabel: CURRENT_NURSE.label,
    text,
    timestamp: new Date().toISOString(),
  };
}

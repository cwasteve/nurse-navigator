import { describe, it, expect } from 'vitest';
import { createNote, CURRENT_NURSE } from './nurse';

describe('createNote', () => {
  it('stamps the current nurse ID and label', () => {
    const note = createNote('Test note');
    expect(note.nurseId).toBe(CURRENT_NURSE.id);
    expect(note.nurseLabel).toBe(CURRENT_NURSE.label);
  });

  it('preserves the input text', () => {
    const note = createNote('Patient called back');
    expect(note.text).toBe('Patient called back');
  });

  it('generates a valid ISO timestamp', () => {
    const note = createNote('Test');
    const parsed = new Date(note.timestamp);
    expect(parsed.toISOString()).toBe(note.timestamp);
  });
});

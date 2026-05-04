import { test, expect } from '@playwright/experimental-ct-react';
import NoteDialog from '../../src/components/NoteDialog';
import type { Note } from '../../src/types';

const sampleNotes: Note[] = [
  {
    nurseId: 'NURSE001',
    nurseLabel: 'Sarah Mitchell, RN',
    text: 'Called patient, no answer.',
    timestamp: '2026-05-01T10:00:00.000Z',
  },
];

test.describe('NoteDialog', () => {
  test('editable=false hides NoteInput', async ({ mount, page }) => {
    await mount(
      <NoteDialog
        open={true}
        onClose={() => {}}
        notes={sampleNotes}
        onAddNote={() => {}}
        patientLabel="Smith, Jane"
        editable={false}
      />,
    );
    await expect(page.getByRole('textbox')).toHaveCount(0);
  });

  test('editable=true shows NoteInput', async ({ mount, page }) => {
    await mount(
      <NoteDialog
        open={true}
        onClose={() => {}}
        notes={sampleNotes}
        onAddNote={() => {}}
        patientLabel="Smith, Jane"
        editable={true}
      />,
    );
    await expect(page.getByRole('textbox')).toBeVisible();
  });

  test('empty notes shows "No notes yet."', async ({ mount, page }) => {
    await mount(
      <NoteDialog
        open={true}
        onClose={() => {}}
        notes={[]}
        onAddNote={() => {}}
        patientLabel="Smith, Jane"
      />,
    );
    await expect(page.getByText('No notes yet.')).toBeVisible();
  });

  test('populated notes render', async ({ mount, page }) => {
    await mount(
      <NoteDialog
        open={true}
        onClose={() => {}}
        notes={sampleNotes}
        onAddNote={() => {}}
        patientLabel="Smith, Jane"
      />,
    );
    await expect(page.getByText('Called patient, no answer.')).toBeVisible();
    await expect(page.getByText('Sarah Mitchell, RN')).toBeVisible();
  });
});

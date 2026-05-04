import { test, expect } from '@playwright/experimental-ct-react';
import CompareModal from '../../src/components/CompareModal';
import CompareModalWrapper from './wrappers/CompareModalWrapper';
import type { Note, RejectionReason } from '../../src/types';

const sampleNotes: Note[] = [
  {
    nurseId: 'NURSE001',
    nurseLabel: 'Sarah Mitchell, RN',
    text: 'Called patient to verify DOB',
    timestamp: '2026-05-01T10:00:00Z',
  },
];

// ─── Pending status ──────────────────────���───────────────────────────

test.describe('CompareModal — unreviewed status', () => {
  test('action selector visible with 3 options, no action form initially', async ({ mount, page }) => {
    await mount(
      <CompareModalWrapper status="unreviewed">
        <CompareModal />
      </CompareModalWrapper>,
    );
    const selector = page.getByRole('radiogroup');
    await expect(selector).toBeVisible();
    await expect(page.getByRole('radio', { name: /Confirm/i })).toBeVisible();
    await expect(page.getByRole('radio', { name: /Follow Up/i })).toBeVisible();
    await expect(page.getByRole('radio', { name: /Reject/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Flag for Follow Up' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Reject Match' })).toHaveCount(0);
  });

  test('clicking Confirm immediately fires handleCompareConfirm', async ({ mount, page }) => {
    const calls: unknown[] = [];
    await mount(
      <CompareModalWrapper status="unreviewed" onConfirm={(note?: string) => calls.push({ note })}>
        <CompareModal />
      </CompareModalWrapper>,
    );
    await page.getByRole('radio', { name: /Confirm/i }).click();
    expect(calls).toEqual([{ note: undefined }]);
  });

  test('select Needs Follow Up → shows note textarea and Flag button', async ({ mount, page }) => {
    await mount(
      <CompareModalWrapper status="unreviewed">
        <CompareModal />
      </CompareModalWrapper>,
    );
    await page.getByRole('radio', { name: /Follow Up/i }).click();
    await expect(page.getByPlaceholder(/Add an optional note/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Flag for Follow Up' })).toBeVisible();
  });

  test('select Reject → shows rejection reasons and disabled Reject button', async ({ mount, page }) => {
    await mount(
      <CompareModalWrapper status="unreviewed">
        <CompareModal />
      </CompareModalWrapper>,
    );
    await page.getByRole('radio', { name: /Reject/i }).click();
    await expect(page.getByRole('radio', { name: /False positive/i })).toBeVisible();
    await expect(page.getByRole('radio', { name: /Changed PCP/i })).toBeVisible();
    const rejectBtn = page.getByRole('button', { name: 'Reject Match' });
    await expect(rejectBtn).toBeVisible();
    await expect(rejectBtn).toBeDisabled();
  });

  test('selecting rejection reason enables Reject Match button', async ({ mount, page }) => {
    await mount(
      <CompareModalWrapper status="unreviewed">
        <CompareModal />
      </CompareModalWrapper>,
    );
    await page.getByRole('radio', { name: /Reject/i }).click();
    await page.getByRole('radio', { name: /False positive/i }).click();
    await expect(page.getByRole('button', { name: 'Reject Match' })).toBeEnabled();
  });

  test('Reject Match calls handleCompareReject with reason', async ({ mount, page }) => {
    const calls: unknown[] = [];
    await mount(
      <CompareModalWrapper
        status="unreviewed"
        onReject={(reason: RejectionReason, note?: string) => calls.push({ reason, note })}>
        <CompareModal />
      </CompareModalWrapper>,
    );
    await page.getByRole('radio', { name: /Reject/i }).click();
    await page.getByRole('radio', { name: /False positive/i }).click();
    await page.getByRole('button', { name: 'Reject Match' }).click();
    expect(calls).toEqual([{ reason: 'false_positive', note: undefined }]);
  });
});

// ─── Follow-up status ─────────────��──────────────────────────────────

test.describe('CompareModal — follow_up status', () => {
  test('selector shows Revert to Unreviewed instead of Follow Up', async ({ mount, page }) => {
    await mount(
      <CompareModalWrapper status="follow_up" notes={sampleNotes}>
        <CompareModal />
      </CompareModalWrapper>,
    );
    await expect(page.getByRole('radio', { name: /Revert to Unreviewed/i })).toBeVisible();
    await expect(page.getByRole('radio', { name: /Follow Up/i })).toHaveCount(0);
  });

  test('NoteInput for ongoing notes always visible', async ({ mount, page }) => {
    await mount(
      <CompareModalWrapper status="follow_up" notes={sampleNotes}>
        <CompareModal />
      </CompareModalWrapper>,
    );
    await expect(page.getByPlaceholder('Add a note...')).toBeVisible();
  });

  test('Revert to Unreviewed calls handleCompareUndo', async ({ mount, page }) => {
    const calls: unknown[] = [];
    await mount(
      <CompareModalWrapper status="follow_up" notes={sampleNotes} onUndo={() => calls.push('undo')}>
        <CompareModal />
      </CompareModalWrapper>,
    );
    await page.getByRole('radio', { name: /Revert to Unreviewed/i }).click();
    await page.getByRole('button', { name: 'Revert to Unreviewed' }).click();
    expect(calls).toEqual(['undo']);
  });

  test('selecting Confirm from follow_up fires immediately', async ({ mount, page }) => {
    const calls: unknown[] = [];
    await mount(
      <CompareModalWrapper
        status="follow_up"
        notes={sampleNotes}
        onConfirm={(note?: string) => calls.push({ note })}>
        <CompareModal />
      </CompareModalWrapper>,
    );
    await page.getByRole('radio', { name: /Confirm/i }).click();
    expect(calls).toEqual([{ note: undefined }]);
  });
});

// ─── Confirmed status ─────────────���──────────────────────────────────

test.describe('CompareModal — confirmed status', () => {
  test('no selector, only Undo button', async ({ mount, page }) => {
    await mount(
      <CompareModalWrapper status="confirmed">
        <CompareModal />
      </CompareModalWrapper>,
    );
    await expect(page.getByRole('radiogroup')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Undo/ })).toBeVisible();
  });
});

// ─── Rejected status ──────────────────────────────────────────��──────

test.describe('CompareModal — rejected status', () => {
  test('no selector, only Undo button', async ({ mount, page }) => {
    await mount(
      <CompareModalWrapper status="rejected" rejectionReason="false_positive">
        <CompareModal />
      </CompareModalWrapper>,
    );
    await expect(page.getByRole('radiogroup')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Undo/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reject Match' })).toHaveCount(0);
  });
});

// ─── Title ──────────────���──────────────────────────────���─────────────

test.describe('CompareModal — title', () => {
  test('shows "Compare Records" when compareRecord is present', async ({ mount, page }) => {
    await mount(
      <CompareModalWrapper status="unreviewed">
        <CompareModal />
      </CompareModalWrapper>,
    );
    await expect(page.getByText('Compare Records')).toBeVisible();
  });
});

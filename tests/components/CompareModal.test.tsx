import { test, expect } from '@playwright/experimental-ct-react';
import CompareModal from '../../src/components/CompareModal';
import type { InternalPatient, ExternalPatient, Note } from '../../src/types';

const ip: InternalPatient = {
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

const ep: ExternalPatient = {
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

const noop = () => {};

const sampleNotes: Note[] = [
  {
    nurseId: 'NURSE001',
    nurseLabel: 'Sarah Mitchell, RN',
    text: 'Called patient to verify DOB',
    timestamp: '2026-05-01T10:00:00Z',
  },
];

// ─── Pending status ──────────────────────────────────────────────────

test.describe('CompareModal — unreviewed status', () => {
  const mountPending = (overrides = {}) => ({
    open: true,
    internalPatient: ip,
    externalPatient: ep,
    confidenceScore: 0.92,
    status: 'unreviewed' as const,
    onClose: noop,
    onConfirmDirect: noop,
    onRejectDirect: noop,
    onFollowUpDirect: noop,
    onUndoDirect: noop,
    notes: [],
    onAddNote: noop,
    ...overrides,
  });

  test('action selector visible with 3 options, no action form initially', async ({ mount, page }) => {
    await mount(<CompareModal {...mountPending()} />);
    const selector = page.getByRole('radiogroup');
    await expect(selector).toBeVisible();
    await expect(page.getByRole('radio', { name: /Confirm/i })).toBeVisible();
    await expect(page.getByRole('radio', { name: /Follow Up/i })).toBeVisible();
    await expect(page.getByRole('radio', { name: /Reject/i })).toBeVisible();
    // No action button or textarea visible yet
    await expect(page.getByRole('button', { name: 'Flag for Follow Up' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Reject Match' })).toHaveCount(0);
  });

  test('clicking Confirm immediately fires onConfirmDirect', async ({ mount, page }) => {
    const calls: unknown[] = [];
    await mount(<CompareModal {...mountPending({ onConfirmDirect: (note?: string) => calls.push({ note }) })} />);
    await page.getByRole('radio', { name: /Confirm/i }).click();
    // Should fire immediately — no second button needed
    expect(calls).toEqual([{ note: undefined }]);
  });

  test('select Needs Follow Up → shows note textarea and Flag button', async ({ mount, page }) => {
    await mount(<CompareModal {...mountPending()} />);
    await page.getByRole('radio', { name: /Follow Up/i }).click();
    await expect(page.getByPlaceholder(/Add an optional note/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Flag for Follow Up' })).toBeVisible();
  });

  test('select Reject → shows rejection reasons and disabled Reject button', async ({ mount, page }) => {
    await mount(<CompareModal {...mountPending()} />);
    await page.getByRole('radio', { name: /Reject/i }).click();
    // Rejection reason radios visible
    await expect(page.getByRole('radio', { name: /False positive/i })).toBeVisible();
    await expect(page.getByRole('radio', { name: /Changed PCP/i })).toBeVisible();
    // Reject button visible but disabled
    const rejectBtn = page.getByRole('button', { name: 'Reject Match' });
    await expect(rejectBtn).toBeVisible();
    await expect(rejectBtn).toBeDisabled();
  });

  test('selecting rejection reason enables Reject Match button', async ({ mount, page }) => {
    await mount(<CompareModal {...mountPending()} />);
    await page.getByRole('radio', { name: /Reject/i }).click();
    await page.getByRole('radio', { name: /False positive/i }).click();
    await expect(page.getByRole('button', { name: 'Reject Match' })).toBeEnabled();
  });

  test('Reject Match calls onRejectDirect with reason', async ({ mount, page }) => {
    const calls: unknown[] = [];
    await mount(
      <CompareModal
        {...mountPending({
          onRejectDirect: (reason: string, note?: string) => calls.push({ reason, note }),
        })}
      />,
    );
    await page.getByRole('radio', { name: /Reject/i }).click();
    await page.getByRole('radio', { name: /False positive/i }).click();
    await page.getByRole('button', { name: 'Reject Match' }).click();
    expect(calls).toEqual([{ reason: 'false_positive', note: undefined }]);
  });
});

// ─── Follow-up status ────────────────────────────────────────────────

test.describe('CompareModal — follow_up status', () => {
  const mountFollowUp = (overrides = {}) => ({
    open: true,
    internalPatient: ip,
    externalPatient: ep,
    confidenceScore: 0.85,
    status: 'follow_up' as const,
    onClose: noop,
    onConfirmDirect: noop,
    onRejectDirect: noop,
    onFollowUpDirect: noop,
    onUndoDirect: noop,
    notes: sampleNotes,
    onAddNote: noop,
    ...overrides,
  });

  test('selector shows Revert to Unreviewed instead of Follow Up', async ({ mount, page }) => {
    await mount(<CompareModal {...mountFollowUp()} />);
    await expect(page.getByRole('radio', { name: /Revert to Unreviewed/i })).toBeVisible();
    await expect(page.getByRole('radio', { name: /Follow Up/i })).toHaveCount(0);
  });

  test('NoteInput for ongoing notes always visible', async ({ mount, page }) => {
    await mount(<CompareModal {...mountFollowUp()} />);
    await expect(page.getByPlaceholder('Add a note...')).toBeVisible();
  });

  test('Revert to Unreviewed calls onUndoDirect', async ({ mount, page }) => {
    const calls: unknown[] = [];
    await mount(<CompareModal {...mountFollowUp({ onUndoDirect: () => calls.push('undo') })} />);
    await page.getByRole('radio', { name: /Revert to Unreviewed/i }).click();
    await page.getByRole('button', { name: 'Revert to Unreviewed' }).click();
    expect(calls).toEqual(['undo']);
  });

  test('selecting Confirm from follow_up fires immediately', async ({ mount, page }) => {
    const calls: unknown[] = [];
    await mount(<CompareModal {...mountFollowUp({ onConfirmDirect: (note?: string) => calls.push({ note }) })} />);
    await page.getByRole('radio', { name: /Confirm/i }).click();
    expect(calls).toEqual([{ note: undefined }]);
  });
});

// ─── Confirmed status ────────────────────────────────────────────────

test.describe('CompareModal — confirmed status', () => {
  test('no selector, only Undo button', async ({ mount, page }) => {
    await mount(
      <CompareModal
        open={true}
        internalPatient={ip}
        externalPatient={ep}
        confidenceScore={0.92}
        status="confirmed"
        onClose={noop}
        onConfirmDirect={noop}
        onRejectDirect={noop}
        onFollowUpDirect={noop}
        onUndoDirect={noop}
        notes={[]}
        onAddNote={noop}
      />,
    );
    await expect(page.getByRole('radiogroup')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Undo/ })).toBeVisible();
  });
});

// ─── Rejected status ─────────────────────────────────────────────────

test.describe('CompareModal — rejected status', () => {
  test('no selector, only Undo button', async ({ mount, page }) => {
    await mount(
      <CompareModal
        open={true}
        internalPatient={ip}
        externalPatient={ep}
        confidenceScore={0.7}
        status="rejected"
        onClose={noop}
        onConfirmDirect={noop}
        onRejectDirect={noop}
        onFollowUpDirect={noop}
        onUndoDirect={noop}
        notes={[]}
        onAddNote={noop}
        rejectionReason="false_positive"
      />,
    );
    await expect(page.getByRole('radiogroup')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Undo/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reject Match' })).toHaveCount(0);
  });
});

// ─── Title ───────────────────────────────────────────────────────────

test.describe('CompareModal — title', () => {
  test('shows "Compare Records" when externalPatient is present', async ({ mount, page }) => {
    await mount(
      <CompareModal
        open={true}
        internalPatient={ip}
        externalPatient={ep}
        confidenceScore={0.92}
        status="unreviewed"
        onClose={noop}
        onConfirmDirect={noop}
        onRejectDirect={noop}
        onFollowUpDirect={noop}
        onUndoDirect={noop}
        notes={[]}
        onAddNote={noop}
      />,
    );
    await expect(page.getByText('Compare Records')).toBeVisible();
  });

  test('shows "Patient Details" when externalPatient is null', async ({ mount, page }) => {
    await mount(
      <CompareModal
        open={true}
        internalPatient={ip}
        externalPatient={null}
        confidenceScore={null}
        status="unreviewed"
        onClose={noop}
        onConfirmDirect={noop}
        onRejectDirect={noop}
        onFollowUpDirect={noop}
        onUndoDirect={noop}
        notes={[]}
        onAddNote={noop}
      />,
    );
    await expect(page.getByText('Patient Details')).toBeVisible();
  });
});

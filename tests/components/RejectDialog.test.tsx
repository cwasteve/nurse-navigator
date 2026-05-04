import { test, expect } from '@playwright/experimental-ct-react';
import RejectDialog from '../../src/components/RejectDialog';
import RejectDialogWrapper from './wrappers/RejectDialogWrapper';
import type { RejectionReason } from '../../src/types';

test.describe('RejectDialog', () => {
  test('confirm button is disabled until a reason is selected', async ({ mount, page }) => {
    await mount(
      <RejectDialogWrapper rejectExternalId="EXT001">
        <RejectDialog />
      </RejectDialogWrapper>,
    );
    const confirmBtn = page.getByRole('button', { name: 'Yes, Reject' });
    await expect(confirmBtn).toBeDisabled();
  });

  test('selecting a reason enables the confirm button and calls executeReject with the reason', async ({
    mount,
    page,
  }) => {
    const calls: RejectionReason[] = [];
    await mount(
      <RejectDialogWrapper
        rejectExternalId="EXT001"
        onExecuteReject={(reason: RejectionReason) => { calls.push(reason); }}>
        <RejectDialog />
      </RejectDialogWrapper>,
    );
    await page.getByText('False positive').click();
    const confirmBtn = page.getByRole('button', { name: 'Yes, Reject' });
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click();
    expect(calls).toEqual(['false_positive']);
  });

  test('cancel resets selection', async ({ mount, page }) => {
    let cancelled = false;
    await mount(
      <RejectDialogWrapper
        rejectExternalId="EXT001"
        onCancelReject={() => { cancelled = true; }}>
        <RejectDialog />
      </RejectDialogWrapper>,
    );
    await page.getByText('False positive').click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    expect(cancelled).toBe(true);
  });
});

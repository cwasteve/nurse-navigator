import { test, expect } from '@playwright/experimental-ct-react';
import RejectDialog from '../../src/components/RejectDialog';

test.describe('RejectDialog', () => {
  test('confirm button is disabled until a reason is selected', async ({ mount, page }) => {
    await mount(
      <RejectDialog
        open={true}
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    const confirmBtn = page.getByRole('button', { name: 'Yes, Reject' });
    await expect(confirmBtn).toBeDisabled();
  });

  test('selecting a reason enables the confirm button and calls onConfirm with the reason', async ({ mount, page }) => {
    let confirmedReason = '';
    await mount(
      <RejectDialog
        open={true}
        onConfirm={(reason) => { confirmedReason = reason; }}
        onCancel={() => {}}
      />,
    );
    // Select the first reason
    await page.getByText('False positive').click();
    const confirmBtn = page.getByRole('button', { name: 'Yes, Reject' });
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click();
    expect(confirmedReason).toBe('false_positive');
  });

  test('cancel resets selection', async ({ mount, page }) => {
    let cancelled = false;
    await mount(
      <RejectDialog
        open={true}
        onConfirm={() => {}}
        onCancel={() => { cancelled = true; }}
      />,
    );
    await page.getByText('False positive').click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    expect(cancelled).toBe(true);
  });
});

import { test, expect } from '@playwright/experimental-ct-react';
import ConfirmDialog from '../../src/components/ConfirmDialog';

test.describe('ConfirmDialog', () => {
  test('renders title and message', async ({ mount, page }) => {
    await mount(
      <ConfirmDialog
        open={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    // Radix portals render outside the component — query from page
    await expect(page.getByText('Confirm Action')).toBeVisible();
    await expect(page.getByText('Are you sure?')).toBeVisible();
  });

  test('shows note field when showNoteField is true', async ({ mount, page }) => {
    await mount(
      <ConfirmDialog
        open={true}
        title="Test"
        message="msg"
        onConfirm={() => {}}
        onCancel={() => {}}
        showNoteField
        noteValue=""
        onNoteChange={() => {}}
      />,
    );
    await expect(page.getByRole('textbox')).toBeVisible();
  });

  test('hides note field when showNoteField is false', async ({ mount, page }) => {
    await mount(
      <ConfirmDialog
        open={true}
        title="Test"
        message="msg"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    await expect(page.getByRole('textbox')).toHaveCount(0);
  });

  test('confirm calls onConfirm', async ({ mount, page }) => {
    let confirmed = false;
    await mount(
      <ConfirmDialog
        open={true}
        title="Test"
        message="msg"
        onConfirm={() => { confirmed = true; }}
        onCancel={() => {}}
      />,
    );
    await page.getByRole('button', { name: 'Confirm' }).click();
    expect(confirmed).toBe(true);
  });

  test('cancel calls onCancel', async ({ mount, page }) => {
    let cancelled = false;
    await mount(
      <ConfirmDialog
        open={true}
        title="Test"
        message="msg"
        onConfirm={() => {}}
        onCancel={() => { cancelled = true; }}
      />,
    );
    await page.getByRole('button', { name: 'Cancel' }).click();
    expect(cancelled).toBe(true);
  });

  test('confirmedRef guard prevents cancel from also firing on confirm', async ({ mount, page }) => {
    let confirmCount = 0;
    let cancelCount = 0;
    await mount(
      <ConfirmDialog
        open={true}
        title="Test"
        message="msg"
        onConfirm={() => { confirmCount++; }}
        onCancel={() => { cancelCount++; }}
      />,
    );
    await page.getByRole('button', { name: 'Confirm' }).click();
    // Small wait to ensure all handlers have fired
    await page.waitForTimeout(100);
    expect(confirmCount).toBe(1);
    expect(cancelCount).toBe(0);
  });
});

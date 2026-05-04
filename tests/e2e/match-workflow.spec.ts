import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('text=Unreviewed');
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open('nurse-navigator', 1);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    for (const name of Array.from(db.objectStoreNames)) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(name, 'readwrite');
        const store = tx.objectStore(name);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }
    db.close();
  });
  await page.reload();
  await page.waitForSelector('text=Unreviewed');
});

test('confirm a match via CompareModal inline action and undo it back to unreviewed', async ({ page }) => {
  // Click Compare on the first row to open CompareModal
  const firstCompare = page.locator('table tbody tr').first().getByRole('button', { name: 'Compare' });
  await firstCompare.click();
  await expect(page.getByText('Compare Records')).toBeVisible();

  // Click Confirm — fires immediately, no second button needed
  await page.getByLabel('Choose action').getByText('Confirm').click();

  // Modal auto-closes on action
  await expect(page.getByText('Compare Records')).not.toBeVisible();

  // Navigate to Confirmed tab
  await page.getByRole('button', { name: /Confirmed/ }).click();

  // Verify the match appears in the Confirmed tab
  const confirmedRows = page.locator('table tbody tr');
  await expect(confirmedRows).not.toHaveCount(0);

  // Click Compare on the confirmed row to reopen the modal
  await confirmedRows.first().getByRole('button', { name: 'Compare' }).click();

  // Undo the confirmation — direct button, modal auto-closes
  await page.getByRole('button', { name: /Undo/ }).click();
  await expect(page.getByText('Compare Records')).not.toBeVisible();

  // Navigate back to Unreviewed tab and verify the match is back
  await page.getByRole('button', { name: /Unreviewed/ }).click();
  const unreviewedRows = page.locator('table tbody tr');
  await expect(unreviewedRows).not.toHaveCount(0);
});

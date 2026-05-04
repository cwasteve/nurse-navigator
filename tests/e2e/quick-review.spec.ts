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

test('select matches, quick review, and verify summary', async ({ page }) => {
  // Select 3 checkboxes in the pending tab
  const checkboxes = page.locator('table tbody tr input[type="checkbox"]');
  await checkboxes.nth(0).check();
  await checkboxes.nth(1).check();
  await checkboxes.nth(2).check();

  // Verify selection count
  await expect(page.getByText('3 selected')).toBeVisible();

  // Click Quick Review
  await page.getByRole('button', { name: /Quick Review/ }).click();

  // Quick Review modal should open showing "1 of 3"
  await expect(page.getByText('1 of 3')).toBeVisible();

  // Confirm the first — Confirm fires immediately, auto-advances
  await page.getByLabel('Choose action').getByText('Confirm').click();

  // Wait for transition, then verify "2 of 3"
  await expect(page.getByText('2 of 3')).toBeVisible();

  // Skip the second
  await page.getByRole('button', { name: /Skip/ }).click();

  // Should move to 3 of 3
  await expect(page.getByText('3 of 3')).toBeVisible();

  // Flag the third for follow-up — select Follow Up radio, then click Flag button
  await page.getByLabel('Choose action').getByText('Needs Follow Up').click();
  await page.getByRole('button', { name: 'Flag for Follow Up' }).click();

  // Summary screen should appear
  await expect(page.getByText('Review Complete')).toBeVisible();

  // Close the modal
  await page.getByRole('button', { name: 'Done' }).click();
});

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

test('flag for follow up with note, add note in follow-up, then confirm — no secondary dialogs', async ({ page }) => {
  // Open the first match via Compare button
  await page.locator('table tbody tr').first().getByRole('button', { name: 'Compare' }).click();
  await expect(page.getByText('Compare Records')).toBeVisible();

  // Select Follow Up from the action selector (click the label text)
  await page.getByLabel('Choose action').getByText('Needs Follow Up').click();

  // Add an optional note in the action form
  await page.getByPlaceholder(/Add an optional note/i).fill('Need to verify DOB');

  // Click Flag for Follow Up — no second dialog, modal auto-closes
  await page.getByRole('button', { name: 'Flag for Follow Up' }).click();
  await expect(page.getByText('Compare Records')).not.toBeVisible();

  // Navigate to Follow Up tab
  await page.getByRole('button', { name: /Needs Follow Up/ }).click();

  // Verify the flagged match is there
  const followUpRows = page.locator('table tbody tr');
  await expect(followUpRows).not.toHaveCount(0);

  // Open the match via Compare button
  await followUpRows.first().getByRole('button', { name: 'Compare' }).click();
  await expect(page.getByText('Compare Records')).toBeVisible();

  // The NoteInput for ongoing notes should be visible
  const noteInput = page.getByPlaceholder('Add a note...');
  await expect(noteInput).toBeVisible();
  await noteInput.fill('Verified DOB with patient');
  await page.getByRole('button', { name: 'Add Note' }).click();

  // Verify note appears immediately (no stale data)
  await expect(page.getByText('Verified DOB with patient')).toBeVisible();

  // Now confirm from the follow-up state — Confirm fires immediately
  await page.getByLabel('Choose action').getByText('Confirm').click();
  await expect(page.getByText('Compare Records')).not.toBeVisible();
});

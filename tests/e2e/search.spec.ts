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

test('search for a patient and open compare modal from suggestion', async ({ page }) => {
  // Type a query into the search bar
  const searchInput = page.getByRole('combobox');
  await searchInput.fill('Avila');

  // Suggestions should appear
  const suggestions = page.locator('#search-listbox li button');
  await expect(suggestions.first()).toBeVisible();

  // Click the first suggestion
  await suggestions.first().click();

  // CompareModal should open
  await expect(page.getByText('Compare Records')).toBeVisible();

  // Close the modal so we can check the search bar
  await page.keyboard.press('Escape');
  await expect(page.getByText('Compare Records')).not.toBeVisible();

  // Search should have been cleared
  await expect(page.getByRole('combobox')).toHaveValue('');
});

test('clear search with X button', async ({ page }) => {
  const searchInput = page.getByRole('combobox');
  await searchInput.fill('Smith');

  // Click the clear button
  await page.getByRole('button', { name: 'Clear search' }).click();

  // Search input should be empty
  await expect(searchInput).toHaveValue('');
});

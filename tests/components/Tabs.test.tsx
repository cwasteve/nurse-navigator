import { test, expect } from '@playwright/experimental-ct-react';
import Tabs from '../../src/components/Tabs';
import type { MatchStatus } from '../../src/types';

const counts: Record<MatchStatus, number> = {
  pending: 10,
  confirmed: 5,
  rejected: 2,
  follow_up: 3,
};

test.describe('Tabs', () => {
  test('renders 4 tabs with labels and counts', async ({ mount }) => {
    const component = await mount(
      <Tabs activeTab="pending" onTabChange={() => {}} counts={counts} />,
    );
    const buttons = component.getByRole('button');
    await expect(buttons).toHaveCount(4);
    await expect(component.getByRole('button', { name: /Unreviewed/ })).toBeVisible();
    await expect(component.getByRole('button', { name: /Confirmed/ })).toBeVisible();
    await expect(component.getByRole('button', { name: /Rejected/ })).toBeVisible();
    await expect(component.getByRole('button', { name: /Needs Follow Up/ })).toBeVisible();
  });

  test('click fires onTabChange with the correct key', async ({ mount }) => {
    let changed = '';
    const component = await mount(
      <Tabs activeTab="pending" onTabChange={(key) => { changed = key; }} counts={counts} />,
    );
    await component.getByRole('button', { name: /Confirmed/ }).click();
    expect(changed).toBe('confirmed');
  });
});

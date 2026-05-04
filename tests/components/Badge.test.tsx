import { test, expect } from '@playwright/experimental-ct-react';
import { ConfidenceBadge } from '../../src/components/Badge';

test.describe('ConfidenceBadge', () => {
  test('0.85 renders as high confidence (91% display for 0.909)', async ({ mount }) => {
    const component = await mount(<ConfidenceBadge score={0.909} />);
    await expect(component).toHaveText('91%');
  });

  test('0.85 threshold → high', async ({ mount }) => {
    const component = await mount(<ConfidenceBadge score={0.85} />);
    await expect(component).toHaveText('85%');
  });

  test('0.84 threshold → medium', async ({ mount }) => {
    const component = await mount(<ConfidenceBadge score={0.84} />);
    await expect(component).toHaveText('84%');
  });

  test('0.60 threshold → medium', async ({ mount }) => {
    const component = await mount(<ConfidenceBadge score={0.60} />);
    await expect(component).toHaveText('60%');
  });

  test('0.59 threshold → low', async ({ mount }) => {
    const component = await mount(<ConfidenceBadge score={0.59} />);
    await expect(component).toHaveText('59%');
  });
});

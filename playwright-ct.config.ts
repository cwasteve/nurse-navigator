import { defineConfig, devices } from '@playwright/experimental-ct-react';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  testDir: './tests/components',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 10_000,
  use: {
    ctViteConfig: {
      plugins: [
        react({ include: /\.(jsx|tsx|mdx)$/ }),
        tailwindcss(),
      ],
    },
    ...devices['Desktop Chrome'],
  },
});

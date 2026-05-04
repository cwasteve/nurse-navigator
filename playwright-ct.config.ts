import { defineConfig, devices } from '@playwright/experimental-ct-react';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  testDir: './tests/components',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  use: {
    ctViteConfig: {
      plugins: [react(), tailwindcss()],
    },
    ...devices['Desktop Chrome'],
  },
});

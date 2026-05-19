import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Unmount components and reset DOM between tests
afterEach(() => {
  cleanup();
});

import { server } from '@/mocks/node';
import { afterAll, afterEach, beforeAll } from 'vitest';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// OL needs ResizeObserver in jsdom
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// make it available globally
(globalThis as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
  ResizeObserver;

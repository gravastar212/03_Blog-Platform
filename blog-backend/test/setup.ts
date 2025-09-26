// Jest setup file for global test configuration
import 'reflect-metadata';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeValidDate(): R;
    }
  }
}

// Custom Jest matcher for date validation
expect.extend({
  toBeValidDate(received: any) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    if (pass) {
      return {
        message: () => `expected ${String(received)} not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${String(received)} to be a valid date`,
        pass: false,
      };
    }
  },
});

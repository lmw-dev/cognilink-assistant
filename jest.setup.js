// Add custom jest matchers for testing-library
require('@testing-library/jest-dom');

// Mock crypto module for Node.js environment
const crypto = require('crypto');

Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => crypto.randomUUID(),
    getRandomValues: (arr) => crypto.getRandomValues(arr),
    subtle: {
      digest: async (algorithm, data) => {
        const hash = crypto.createHash(algorithm.replace('-', '').toLowerCase());
        hash.update(data);
        return hash.digest();
      },
    },
  },
});

// Mock TextEncoder and TextDecoder for Node.js environment
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder; 
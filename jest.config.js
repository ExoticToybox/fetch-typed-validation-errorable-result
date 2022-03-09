/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts-esm',
  // preset: 'ts-jest/presets/default-esm',
  // globals: {
  //   'ts-jest': {
  //     tsconfig: '<rootDir>/tsconfig.json',
  //     useESM: true,
  //   },
  // },
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/setup-tests.ts'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(data-uri-to-buffer|formdata-polyfill|fetch-blob|node-fetch)/)',
  ],
};

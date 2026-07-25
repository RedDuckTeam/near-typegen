/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  // Resolve workspace packages to their sources so tests run against src
  // without requiring a build step.
  moduleNameMapper: {
    '^@neargen-js/core$': '<rootDir>/packages/core/src/index.ts',
    '^@neargen-js/utils$': '<rootDir>/packages/utils/src/index.ts',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          target: 'es6',
          module: 'commonjs',
          strict: true,
          esModuleInterop: true,
          experimentalDecorators: true,
          // Generating declarations is pointless (and slow) for tests.
          declaration: false,
        },
      },
    ],
  },
};

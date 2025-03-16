const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/app/\\[locale\\]/\\(authenticated\\)/(.*)$': '<rootDir>/app/[locale]/(authenticated)/$1',
    '^@/app/\\[locale\\]/\\(onboarding\\)/(.*)$': '<rootDir>/app/[locale]/(onboarding)/$1',
    '^@/app/\\[locale\\]/\\(portal\\)/(.*)$': '<rootDir>/app/[locale]/(portal)/$1',
    '^@/app/\\[locale\\]/(.*)$': '<rootDir>/app/[locale]/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/components/forms/(.*)$': '<rootDir>/components/forms/$1',
    '^@/components/ui/(.*)$': '<rootDir>/components/ui/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/data/(.*)$': '<rootDir>/data/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/contexts/(.*)$': '<rootDir>/contexts/$1',
    '^@/(.*)$': '<rootDir>/$1'
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '.*\\.d\\.ts$',
    '.*/mocks\\.ts$'
  ],
  moduleDirectories: ['node_modules', '<rootDir>'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$'
  ],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  roots: ['<rootDir>']
};

module.exports = createJestConfig(customJestConfig); 
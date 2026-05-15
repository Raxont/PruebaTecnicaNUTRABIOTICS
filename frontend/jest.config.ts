/**
 * jest.config.ts
 * Configuración de Jest para el frontend Next.js (TypeScript)
 *
 * Requiere:
 *   npm install -D jest jest-environment-jsdom @testing-library/react \
 *                  @testing-library/jest-dom @testing-library/user-event \
 *                  ts-jest @types/jest
 */

import type { Config } from 'jest';

const config: Config = {
  // Usa el transformer de TypeScript y JSX propio de Next.js
  preset: 'ts-jest',

  // Simula un navegador (necesario para localStorage y DOM)
  testEnvironment: 'jest-environment-jsdom',

  // Alias @/ → src/  (igual que tsconfig paths)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Archivos que se ejecutan antes de cada suite
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Patrones donde buscar tests
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Extensiones que Jest resolverá
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Cobertura mínima recomendada
  coverageThreshold: {
    global: {
      branches:   70,
      functions:  70,
      lines:      70,
      statements: 70,
    },
  },
};

export default config;
import '@testing-library/jest-dom'
import { setupServer } from 'msw/node'
import { handlers } from './__tests__/setup/mocks'

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.REDIS_URL = 'redis://localhost:6379'

// Mock window.matchMedia for DarkModeToggle component
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: query === '(prefers-color-scheme: dark)' ? false : true,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
})

// Setup MSW server
export const server = setupServer(...handlers)

// Enable API mocking before all tests
beforeAll(() => server.listen())

// Reset handlers between tests
afterEach(() => server.resetHandlers())

// Disable API mocking after all tests
afterAll(() => server.close())

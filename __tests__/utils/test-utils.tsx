import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'

// Mock session data
const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  },
  expires: '2024-12-31T23:59:59.999Z',
}

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider session={mockSession}>
      {children}
    </SessionProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Mock Prisma client
export const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  executionHistory: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}

// Mock fetch responses
export const mockFetch = (response: unknown, status = 200) => {
  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => response,
  })
}

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  ...overrides,
})

export const createMockExecution = (overrides = {}) => ({
  id: 'test-execution-id',
  userId: 'test-user-id',
  code: 'print("Hello, World!")',
  requirements: 'requests==2.31.0',
  status: 'SUCCESS',
  logs: 'Hello, World!\n',
  inputFile: null,
  outputFile: null,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  completedAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
})

export * from '@testing-library/react'
export { customRender as render }

// Simple test to ensure this file is recognized as a test file
describe('Test Utilities', () => {
  it('should export test utilities', () => {
    expect(createMockUser).toBeDefined()
    expect(createMockExecution).toBeDefined()
    expect(mockPrisma).toBeDefined()
  })
})

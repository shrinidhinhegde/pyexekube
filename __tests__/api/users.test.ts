jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, init: { status?: number } = {}) => ({
      status: init.status ?? 200,
      json: async () => body,
    }),
  },
  NextRequest: class {},
}))

import type { NextRequest } from 'next/server'

import { prisma } from '@/lib/prisma'
import { GET, POST, PUT, DELETE } from '@/app/api/users/route'
import { createMockUser } from '../utils/test-utils'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

function createRequest(url: string, body?: unknown): NextRequest {
  return {
    url,
    json: async () => body,
  } as unknown as NextRequest
}

describe('Users API routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('returns all users when no filters provided', async () => {
      const mockUsers = [createMockUser()]
      mockPrisma.user.findMany.mockResolvedValue(mockUsers as any)

      const response = await GET(createRequest('https://example.com/api/users'))
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toEqual({ users: mockUsers })
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        include: {
          _count: {
            select: { executions: true },
          },
        },
        orderBy: { email: 'asc' },
      })
    })

    it('returns a single user when userId provided', async () => {
      const mockUser = createMockUser()
      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any)

      const response = await GET(createRequest('https://example.com/api/users?userId=123'))
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toEqual({ user: mockUser })
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        include: {
          executions: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      })
    })

    it('returns 404 when user not found by id', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const response = await GET(createRequest('https://example.com/api/users?userId=missing'))
      const body = await response.json()

      expect(response.status).toBe(404)
      expect(body).toEqual({ error: 'User not found' })
    })

    it('handles database errors', async () => {
      mockPrisma.user.findMany.mockRejectedValue(new Error('Database error'))

      const response = await GET(createRequest('https://example.com/api/users'))
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body).toEqual({ error: 'Failed to fetch users' })
    })
  })

  describe('POST', () => {
    it('returns 400 when email missing', async () => {
      const response = await POST(createRequest('https://example.com/api/users', {}))
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body).toEqual({ error: 'Missing required field: email' })
    })

    it('returns 409 when user already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser() as any)

      const response = await POST(
        createRequest('https://example.com/api/users', { email: 'test@example.com' }),
      )
      const body = await response.json()

      expect(response.status).toBe(409)
      expect(body).toEqual({ error: 'User with this email already exists' })
    })

    it('creates a new user', async () => {
      const mockUser = createMockUser()
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue(mockUser as any)

      const response = await POST(
        createRequest('https://example.com/api/users', { email: mockUser.email }),
      )
      const body = await response.json()

      expect(response.status).toBe(201)
      expect(body).toEqual({ user: mockUser })
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { email: mockUser.email },
      })
    })

    it('handles unexpected errors', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('boom'))

      const response = await POST(
        createRequest('https://example.com/api/users', { email: 'test@example.com' }),
      )
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body).toEqual({ error: 'Failed to create user' })
    })
  })

  describe('PUT', () => {
    it('returns 400 when id missing', async () => {
      const response = await PUT(createRequest('https://example.com/api/users', {}))
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body).toEqual({ error: 'Missing required field: id' })
    })

    it('returns 409 when email taken by another user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(createMockUser() as any)

      const response = await PUT(
        createRequest('https://example.com/api/users', {
          id: 'user-1',
          email: 'existing@example.com',
        }),
      )
      const body = await response.json()

      expect(response.status).toBe(409)
      expect(body).toEqual({ error: 'Email already taken by another user' })
    })

    it('updates user successfully', async () => {
      const mockUser = createMockUser({ email: 'updated@example.com' })
      mockPrisma.user.findFirst.mockResolvedValue(null)
      mockPrisma.user.update.mockResolvedValue(mockUser as any)

      const response = await PUT(
        createRequest('https://example.com/api/users', {
          id: 'user-1',
          email: 'updated@example.com',
        }),
      )
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toEqual({ user: mockUser })
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { email: 'updated@example.com' },
      })
    })

    it('handles not found errors', async () => {
      const error = new Error('Record to update not found')
      mockPrisma.user.findFirst.mockResolvedValue(null)
      mockPrisma.user.update.mockRejectedValue(error)

      const response = await PUT(
        createRequest('https://example.com/api/users', {
          id: 'missing',
          email: 'test@example.com',
        }),
      )
      const body = await response.json()

      expect(response.status).toBe(404)
      expect(body).toEqual({ error: 'User not found' })
    })

    it('handles other errors', async () => {
      const error = new Error('Boom')
      mockPrisma.user.findFirst.mockResolvedValue(null)
      mockPrisma.user.update.mockRejectedValue(error)

      const response = await PUT(
        createRequest('https://example.com/api/users', {
          id: 'user-1',
          email: 'test@example.com',
        }),
      )
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body).toEqual({ error: 'Failed to update user' })
    })
  })

  describe('DELETE', () => {
    it('returns 400 when id missing', async () => {
      const response = await DELETE(createRequest('https://example.com/api/users', {}))
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body).toEqual({ error: 'Missing required field: id' })
    })

    it('returns 404 when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const response = await DELETE(
        createRequest('https://example.com/api/users', { id: 'missing' }),
      )
      const body = await response.json()

      expect(response.status).toBe(404)
      expect(body).toEqual({ error: 'User not found' })
    })

    it('deletes user successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(createMockUser() as any)
      mockPrisma.user.delete.mockResolvedValue(undefined as any)

      const response = await DELETE(
        createRequest('https://example.com/api/users', { id: 'user-1' }),
      )
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toEqual({ success: true })
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      })
    })
  })
})
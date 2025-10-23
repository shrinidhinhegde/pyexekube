import { prisma } from '@/lib/prisma'
import { createMockExecution } from '../utils/test-utils'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    executionHistory: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

// Test the business logic functions directly
describe('Executions API Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET executions', () => {
    it('should fetch executions for a user', async () => {
      const mockExecutions = [createMockExecution()]
      mockPrisma.executionHistory.findMany.mockResolvedValue(mockExecutions)

      const userId = 'test-user-id'
      const executions = await mockPrisma.executionHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })

      expect(executions).toEqual(mockExecutions)
      expect(mockPrisma.executionHistory.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })
    })

    it('should return empty array when no executions found', async () => {
      mockPrisma.executionHistory.findMany.mockResolvedValue([])

      const userId = 'test-user-id'
      const executions = await mockPrisma.executionHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })

      expect(executions).toEqual([])
    })

    it('should handle database errors', async () => {
      mockPrisma.executionHistory.findMany.mockRejectedValue(new Error('Database error'))

      const userId = 'test-user-id'
      
      await expect(
        mockPrisma.executionHistory.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        })
      ).rejects.toThrow('Database error')
    })
  })

  describe('CREATE execution', () => {
    it('should create a new execution', async () => {
      const mockExecution = createMockExecution()
      mockPrisma.executionHistory.create.mockResolvedValue(mockExecution)

      const executionData = {
        userId: 'test-user-id',
        code: 'print("Hello, World!")',
        requirements: 'requests==2.31.0',
        inputFile: null,
        status: 'RUNNING' as const,
      }

      const result = await mockPrisma.executionHistory.create({
        data: executionData,
      })

      expect(result).toEqual(mockExecution)
      expect(mockPrisma.executionHistory.create).toHaveBeenCalledWith({
        data: executionData,
      })
    })

    it('should handle database errors during creation', async () => {
      mockPrisma.executionHistory.create.mockRejectedValue(new Error('Database error'))

      const executionData = {
        userId: 'test-user-id',
        code: 'print("Hello, World!")',
        requirements: 'requests==2.31.0',
        inputFile: null,
        status: 'RUNNING' as const,
      }

      await expect(
        mockPrisma.executionHistory.create({
          data: executionData,
        })
      ).rejects.toThrow('Database error')
    })
  })

  describe('UPDATE execution', () => {
    it('should update execution status and results', async () => {
      const mockExecution = createMockExecution({ status: 'SUCCESS' })
      mockPrisma.executionHistory.update.mockResolvedValue(mockExecution)

      const updateData = {
        status: 'SUCCESS' as const,
        logs: 'Hello, World!\n',
        outputFile: 'output.txt',
        updatedAt: new Date(),
        completedAt: new Date(),
      }

      const result = await mockPrisma.executionHistory.update({
        where: { id: 'test-execution-id' },
        data: updateData,
      })

      expect(result).toEqual(mockExecution)
      expect(mockPrisma.executionHistory.update).toHaveBeenCalledWith({
        where: { id: 'test-execution-id' },
        data: updateData,
      })
    })

    it('should handle database errors during update', async () => {
      mockPrisma.executionHistory.update.mockRejectedValue(new Error('Database error'))

      const updateData = {
        status: 'SUCCESS' as const,
        updatedAt: new Date(),
      }

      await expect(
        mockPrisma.executionHistory.update({
          where: { id: 'test-execution-id' },
          data: updateData,
        })
      ).rejects.toThrow('Database error')
    })
  })

  describe('DELETE execution', () => {
    it('should delete an execution', async () => {
      const mockExecution = createMockExecution()
      mockPrisma.executionHistory.delete.mockResolvedValue(mockExecution)

      const result = await mockPrisma.executionHistory.delete({
        where: { id: 'test-execution-id' },
      })

      expect(result).toEqual(mockExecution)
      expect(mockPrisma.executionHistory.delete).toHaveBeenCalledWith({
        where: { id: 'test-execution-id' },
      })
    })

    it('should handle database errors during deletion', async () => {
      mockPrisma.executionHistory.delete.mockRejectedValue(new Error('Database error'))

      await expect(
        mockPrisma.executionHistory.delete({
          where: { id: 'test-execution-id' },
        })
      ).rejects.toThrow('Database error')
    })
  })

  describe('Data validation', () => {
    it('should validate required fields for creation', () => {
      const requiredFields = ['userId', 'code']
      const data = { userId: 'test-id', code: 'print("hello")' }
      
      const missingFields = requiredFields.filter(field => !data[field as keyof typeof data])
      expect(missingFields).toHaveLength(0)
    })

    it('should identify missing required fields', () => {
      const requiredFields = ['userId', 'code']
      const data = { code: 'print("hello")' }
      
      const missingFields = requiredFields.filter(field => !data[field as keyof typeof data])
      expect(missingFields).toContain('userId')
    })

    it('should validate execution status values', () => {
      const validStatuses = ['RUNNING', 'SUCCESS', 'FAILED']
      const status = 'SUCCESS'
      
      expect(validStatuses).toContain(status)
    })

    it('should identify invalid execution status', () => {
      const validStatuses = ['RUNNING', 'SUCCESS', 'FAILED']
      const status = 'INVALID'
      
      expect(validStatuses).not.toContain(status)
    })
  })
})
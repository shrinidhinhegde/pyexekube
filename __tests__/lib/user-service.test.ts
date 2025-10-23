import { UserService } from '@/lib/user-service'
import { prisma } from '@/lib/prisma'
import { createMockUser } from '../utils/test-utils'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockUser = createMockUser()
      mockPrisma.user.create.mockResolvedValue(mockUser)

      const userData = { email: 'test@example.com' }
      const result = await UserService.createUser(userData)

      expect(result).toEqual(mockUser)
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { email: 'test@example.com' },
      })
    })

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed')
      mockPrisma.user.create.mockRejectedValue(error)

      const userData = { email: 'test@example.com' }

      await expect(UserService.createUser(userData)).rejects.toThrow('Database connection failed')
    })
  })

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = createMockUser()
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await UserService.getUserById('test-user-id')

      expect(result).toEqual(mockUser)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
      })
    })

    it('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await UserService.getUserById('non-existent-id')

      expect(result).toBeNull()
    })
  })

  describe('getUserByEmail', () => {
    it('should return user when found by email', async () => {
      const mockUser = createMockUser()
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await UserService.getUserByEmail('test@example.com')

      expect(result).toEqual(mockUser)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      })
    })

    it('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await UserService.getUserByEmail('nonexistent@example.com')

      expect(result).toBeNull()
    })
  })

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        createMockUser({ id: 'user-1', email: 'user1@example.com' }),
        createMockUser({ id: 'user-2', email: 'user2@example.com' }),
      ]
      mockPrisma.user.findMany.mockResolvedValue(mockUsers)

      const result = await UserService.getAllUsers()

      expect(result).toEqual(mockUsers)
      expect(mockPrisma.user.findMany).toHaveBeenCalled()
    })

    it('should return empty array when no users exist', async () => {
      mockPrisma.user.findMany.mockResolvedValue([])

      const result = await UserService.getAllUsers()

      expect(result).toEqual([])
    })
  })

  describe('updateUser', () => {
    it('should update user with provided data', async () => {
      const mockUser = createMockUser({ email: 'updated@example.com' })
      mockPrisma.user.update.mockResolvedValue(mockUser)

      const updateData = { email: 'updated@example.com' }
      const result = await UserService.updateUser('test-user-id', updateData)

      expect(result).toEqual(mockUser)
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
        data: { email: 'updated@example.com' },
      })
    })

    it('should handle partial updates', async () => {
      const mockUser = createMockUser()
      mockPrisma.user.update.mockResolvedValue(mockUser)

      const updateData = { email: 'newemail@example.com' }
      await UserService.updateUser('test-user-id', updateData)

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
        data: { email: 'newemail@example.com' },
      })
    })
  })

  describe('deleteUser', () => {
    it('should delete user and return deleted user', async () => {
      const mockUser = createMockUser()
      mockPrisma.user.delete.mockResolvedValue(mockUser)

      const result = await UserService.deleteUser('test-user-id')

      expect(result).toEqual(mockUser)
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
      })
    })

    it('should handle deletion errors', async () => {
      const error = new Error('User not found')
      mockPrisma.user.delete.mockRejectedValue(error)

      await expect(UserService.deleteUser('non-existent-id')).rejects.toThrow('User not found')
    })
  })
})

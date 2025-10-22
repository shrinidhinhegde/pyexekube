import { prisma } from '@/lib/prisma'

export interface CreateUserData {
  email: string
}

export interface User {
  id: string
  email: string
}

export class UserService {
  static async createUser(data: CreateUserData): Promise<User> {
    return await prisma.user.create({
      data: {
        email: data.email,
      },
    })
  }

  static async getUserById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    })
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    })
  }

  static async getAllUsers(): Promise<User[]> {
    return await prisma.user.findMany()
  }

  static async updateUser(id: string, data: Partial<CreateUserData>): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data,
    })
  }

  static async deleteUser(id: string): Promise<User> {
    return await prisma.user.delete({
      where: { id },
    })
  }
}

import { UserService } from '@/services/user.service'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

describe('Password reset functions', () => {
  const prisma = new PrismaClient()
  let userId: number
  let resetToken: string

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'reset-test@example.com' } })
    const user = await prisma.user.create({
      data: {
        fullName: 'Reset Test',
        email: 'reset-test@example.com',
        password: await bcrypt.hash('oldpass123', 10),
        role: 'USER',
      }
    })
    userId = user.id
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'reset-test@example.com' } })
    await prisma.$disconnect()
  })

  it('sets and finds reset token', async () => {
    const token = 'test-reset-token';
    const expires = new Date(Date.now() + 60*60*1000)
    await UserService.setResetToken(userId, token, expires)
    const user = await UserService.findByResetToken(token)
    expect(user).toBeTruthy()
    expect(user?.resetToken).toBe(token)
    resetToken = token
  })

  it('updates password and clears token', async () => {
    const newPassword = await bcrypt.hash('newSecretPassword', 10)
    await UserService.updatePasswordAndClearToken(userId, newPassword)
    const user = await prisma.user.findUnique({ where: { id: userId } })
    expect(user?.password).toBe(newPassword)
    expect(user?.resetToken).toBeNull()
    expect(user?.resetTokenExpires).toBeNull()
  })
});


import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@/generated/prisma'
import { createTokenPair } from '@/lib/jwt'
import { UserRole } from '@/types/auth'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Email and password are required' 
          } 
        },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_CREDENTIALS', 
            message: 'Invalid email or password' 
          } 
        },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_CREDENTIALS', 
            message: 'Invalid email or password' 
          } 
        },
        { status: 401 }
      )
    }

    // Create tokens
    const tokens = createTokenPair(user.id, user.email, user.role as UserRole)

    // Return user data and tokens
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return NextResponse.json({
      success: true,
      data: {
        user: userData,
        tokens,
      },
      message: 'Login successful',
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Internal server error' 
        } 
      },
      { status: 500 }
    )
  }
}
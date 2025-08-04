import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { verifyRefreshToken, createTokenPair } from '@/lib/jwt'
import { UserRole } from '@/types/auth'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'MISSING_TOKEN', 
            message: 'Refresh token required' 
          } 
        },
        { status: 400 }
      )
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken)

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'USER_NOT_FOUND', 
            message: 'User not found' 
          } 
        },
        { status: 404 }
      )
    }

    // Create new token pair
    const tokens = createTokenPair(user.id, user.email, user.role as UserRole)

    return NextResponse.json({
      success: true,
      data: { tokens },
      message: 'Token refreshed successfully',
    })

  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INVALID_TOKEN', 
          message: 'Invalid or expired refresh token' 
        } 
      },
      { status: 401 }
    )
  }
}
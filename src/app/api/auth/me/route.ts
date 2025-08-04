import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { verifyAccessToken } from '@/lib/jwt'
import { UserRole } from '@/types/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'MISSING_TOKEN', 
            message: 'Authorization token required' 
          } 
        },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify token
    const payload = verifyAccessToken(token)

    // Find user to ensure they still exist
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

    // Return user data
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
      data: { user: userData },
      message: 'User information retrieved successfully',
    })

  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INVALID_TOKEN', 
          message: 'Invalid or expired token' 
        } 
      },
      { status: 401 }
    )
  }
}
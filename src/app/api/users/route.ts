import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (role) {
      where.role = role
    }

    // Get users from database
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Get total count
    const total = await prisma.user.count({ where })

    // Transform users to include status (since it's not in the schema, we'll mock it)
    const usersWithStatus = users.map(user => ({
      ...user,
      status: 'active', // Mock status since it's not in the schema
      lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Mock last login
    }))

    return NextResponse.json({
      success: true,
      data: {
        users: usersWithStatus,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      },
      message: 'Users retrieved successfully',
    })
  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve users',
        },
      },
      { status: 500 }
    )
  }
}
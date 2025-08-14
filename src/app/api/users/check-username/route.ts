import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const checkUsernameSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
})

// POST /api/users/check-username - Check if username is available
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username } = checkUsernameSchema.parse(body)

    // Check if username exists in database
    const existingUser = await prisma.user.findUnique({
      where: { username: username.toLowerCase() }
    })

    const isAvailable = !existingUser

    return NextResponse.json({ 
      username,
      available: isAvailable,
      message: isAvailable ? 'Username is available' : 'Username is already taken'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid username format', 
        details: error.errors 
      }, { status: 400 })
    }
    console.error('Check username error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
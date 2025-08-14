import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, PermissionService } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const packageSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().min(10).max(500),
  price: z.number().min(5).max(100000),
  deliveryDays: z.number().min(1).max(90),
  revisions: z.number().min(0).max(10),
  features: z.array(z.string()).min(1).max(20),
})

const createGigSchema = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(100).max(2000),
  deliverables: z.array(z.string()).min(1).max(10),
  packages: z.array(packageSchema).min(1).max(3),
  gallery: z.array(z.string()).max(10).default([]),
  tags: z.array(z.string()).max(10).default([]),
  categoryId: z.string(),
})

const updateGigSchema = z.object({
  title: z.string().min(10).max(100).optional(),
  description: z.string().min(100).max(2000).optional(),
  deliverables: z.array(z.string()).min(1).max(10).optional(),
  packages: z.array(packageSchema).min(1).max(3).optional(),
  gallery: z.array(z.string()).max(10).optional(),
  tags: z.array(z.string()).max(10).optional(),
  categoryId: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'INACTIVE']).optional(),
})

const getGigsQuerySchema = z.object({
  category: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  freelancer: z.string().optional(),
  deliveryTime: z.string().optional(),
  rating: z.string().optional(),
  page: z.string().default('1'),
  limit: z.string().default('12'),
  sortBy: z.enum(['createdAt', 'price', 'rating', 'orderCount', 'viewCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// GET /api/gigs - Get gigs with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = getGigsQuerySchema.parse({
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      freelancer: searchParams.get('freelancer') || undefined,
      deliveryTime: searchParams.get('deliveryTime') || undefined,
      rating: searchParams.get('rating') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '12',
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    })

    const page = parseInt(query.page)
    const limit = Math.min(parseInt(query.limit), 50)
    const skip = (page - 1) * limit

    const where: any = {}

    // Only show active gigs by default
    if (query.status) {
      where.status = query.status
    } else {
      where.status = 'ACTIVE'
    }

    if (query.category) {
      where.categoryId = query.category
    }

    if (query.freelancer) {
      where.freelancerId = query.freelancer
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { tags: { has: query.search } },
      ]
    }

    if (query.rating) {
      where.rating = { gte: parseFloat(query.rating) }
    }

    // Build orderBy
    const orderBy: any = {}
    if (query.sortBy === 'price') {
      // For price sorting, we'll sort by the first package price
      orderBy.packages = 'asc'
    } else {
      orderBy[query.sortBy] = query.sortOrder
    }

    const [gigs, total] = await Promise.all([
      prisma.gig.findMany({
        where,
        include: {
          freelancer: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
              rating: true,
              isVerified: true,
              totalEarned: true,
              completedJobs: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
          _count: {
            select: {
              reviews: true,
              payments: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.gig.count({ where }),
    ])

    // Calculate derived fields for each gig
    const processedGigs = gigs.map(gig => {
      const packages = gig.packages as any[]
      const minPrice = packages.length > 0 ? Math.min(...packages.map(p => p.price)) : 0
      const maxPrice = packages.length > 0 ? Math.max(...packages.map(p => p.price)) : 0
      const minDelivery = packages.length > 0 ? Math.min(...packages.map(p => p.deliveryDays)) : 0

      return {
        ...gig,
        minPrice,
        maxPrice,
        minDelivery,
        reviewCount: gig._count.reviews,
        totalOrders: gig._count.payments,
      }
    })

    // Apply additional filters on processed data if needed
    let filteredGigs = processedGigs
    
    if (query.minPrice) {
      filteredGigs = filteredGigs.filter(gig => gig.minPrice >= parseFloat(query.minPrice!))
    }
    
    if (query.maxPrice) {
      filteredGigs = filteredGigs.filter(gig => gig.maxPrice <= parseFloat(query.maxPrice!))
    }

    if (query.deliveryTime) {
      filteredGigs = filteredGigs.filter(gig => gig.minDelivery <= parseInt(query.deliveryTime!))
    }

    // Sort by price if requested
    if (query.sortBy === 'price') {
      filteredGigs.sort((a, b) => {
        const aPrice = query.sortOrder === 'asc' ? a.minPrice : a.maxPrice
        const bPrice = query.sortOrder === 'asc' ? b.minPrice : b.maxPrice
        return query.sortOrder === 'asc' ? aPrice - bPrice : bPrice - aPrice
      })
    }

    return NextResponse.json({
      gigs: filteredGigs,
      pagination: {
        page,
        limit,
        total: filteredGigs.length,
        pages: Math.ceil(filteredGigs.length / limit),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Get gigs error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/gigs - Create new gig (freelancer only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!PermissionService.canManageGigs(session.user.role)) {
      return NextResponse.json({ error: 'Only freelancers can create gigs' }, { status: 403 })
    }

    const body = await request.json()
    const gigData = createGigSchema.parse(body)

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: gigData.categoryId },
    })

    if (!category || !category.isActive) {
      return NextResponse.json({ error: 'Invalid or inactive category' }, { status: 400 })
    }

    // Check freelancer's gig limits (max 10 active gigs)
    const activeGigsCount = await prisma.gig.count({
      where: {
        freelancerId: session.user.id,
        status: 'ACTIVE'
      }
    })

    if (activeGigsCount >= 10) {
      return NextResponse.json({ error: 'Maximum active gigs limit reached (10)' }, { status: 400 })
    }

    // Validate packages structure
    const packages = gigData.packages
    
    // Ensure packages are in ascending price order
    for (let i = 1; i < packages.length; i++) {
      if (packages[i].price <= packages[i-1].price) {
        return NextResponse.json({ error: 'Package prices must be in ascending order' }, { status: 400 })
      }
    }

    const gig = await prisma.gig.create({
      data: {
        ...gigData,
        freelancerId: session.user.id,
        packages: packages, // Store as JSON
      },
      include: {
        freelancer: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            rating: true,
            isVerified: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    })

    // Calculate derived fields
    const minPrice = Math.min(...packages.map(p => p.price))
    const maxPrice = Math.max(...packages.map(p => p.price))
    const minDelivery = Math.min(...packages.map(p => p.deliveryDays))

    return NextResponse.json(
      { 
        gig: {
          ...gig,
          minPrice,
          maxPrice,
          minDelivery,
          reviewCount: 0,
          totalOrders: 0,
        }
      }, 
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Create gig error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
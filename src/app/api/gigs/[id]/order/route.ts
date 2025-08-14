import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const orderGigSchema = z.object({
  packageIndex: z.number().min(0).max(2),
  packageData: z.object({
    name: z.string(),
    price: z.number().min(1),
    deliveryDays: z.number().min(1),
    features: z.array(z.string()),
  }),
})

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const gigId = params.id
    const body = await request.json()
    const { packageIndex, packageData } = orderGigSchema.parse(body)

    // Get gig details
    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      include: {
        freelancer: {
          select: {
            id: true,
            name: true,
            username: true,
            walletAddress: true,
          },
        },
      },
    })

    if (!gig) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
    }

    // Check if gig is active
    if (gig.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Gig is not available for ordering' }, { status: 400 })
    }

    // Check if user is trying to order their own gig
    if (gig.freelancerId === session.user.id) {
      return NextResponse.json({ error: 'Cannot order your own gig' }, { status: 400 })
    }

    // Get current user details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        username: true,
        walletAddress: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Validate package exists in gig
    const gigPackages = gig.packages as any[]
    if (!gigPackages[packageIndex] || gigPackages[packageIndex].price !== packageData.price) {
      return NextResponse.json({ error: 'Invalid package selection' }, { status: 400 })
    }

    // Create the order
    const result = await prisma.$transaction(async (tx) => {
      // Create gig order (using JobApplication model for now - in a real app you'd have a separate GigOrder model)
      const order = await tx.jobApplication.create({
        data: {
          freelancerId: gig.freelancerId,
          gigId: gigId,
          coverLetter: `Gig order: ${packageData.name} package`,
          proposedBudget: packageData.price,
          estimatedDays: packageData.deliveryDays,
          attachments: [],
          isAccepted: true, // Auto-accept gig orders
        },
      })

      // Create payment in escrow
      const payment = await tx.payment.create({
        data: {
          amount: packageData.price,
          currency: 'USDC',
          status: 'ESCROW',
          fromUserId: session.user.id,
          toUserId: gig.freelancerId,
          gigId: gigId,
          escrowAddress: `escrow_${Date.now()}_${Math.random().toString(36).substring(2)}`, // Mock escrow address
        },
      })

      // Update gig order count
      await tx.gig.update({
        where: { id: gigId },
        data: {
          orderCount: {
            increment: 1,
          },
        },
      })

      // Create notifications
      await Promise.all([
        // Notify freelancer of new order
        tx.notification.create({
          data: {
            title: 'New Gig Order!',
            message: `${user.name} ordered your "${gig.title}" gig (${packageData.name} package)`,
            type: 'GIG_ORDER',
            userId: gig.freelancerId,
            data: {
              gigId,
              orderId: order.id,
              packageName: packageData.name,
              amount: packageData.price,
            },
          },
        }),
        // Notify buyer of successful order
        tx.notification.create({
          data: {
            title: 'Order Confirmed',
            message: `Your order for "${gig.title}" has been confirmed. ${gig.freelancer.name} will start working on it.`,
            type: 'ORDER_CONFIRMATION',
            userId: session.user.id,
            data: {
              gigId,
              orderId: order.id,
              packageName: packageData.name,
              amount: packageData.price,
            },
          },
        }),
      ])

      return { order, payment }
    })

    return NextResponse.json({
      success: true,
      orderId: result.order.id,
      paymentId: result.payment.id,
      message: 'Gig order created successfully',
      order: {
        id: result.order.id,
        gigTitle: gig.title,
        freelancerName: gig.freelancer.name,
        packageName: packageData.name,
        amount: packageData.price,
        deliveryDays: packageData.deliveryDays,
        status: 'IN_PROGRESS',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating gig order:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
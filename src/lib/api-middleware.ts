import { NextRequest, NextResponse } from 'next/server'

// CORS configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' ? '*' : 'https://taskfi.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

// Rate limiting storage (in production use Redis)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>()

// Simple rate limiting: 100 requests per minute per IP
export function rateLimit(request: NextRequest): boolean {
  const ip = request.ip || 'unknown'
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 100

  const current = rateLimitMap.get(ip)
  
  if (!current || now - current.timestamp > windowMs) {
    rateLimitMap.set(ip, { count: 1, timestamp: now })
    return true
  }
  
  if (current.count >= maxRequests) {
    return false
  }
  
  current.count++
  return true
}

// Standard error response wrapper
export function createErrorResponse(error: string, status: number = 400) {
  return NextResponse.json(
    { 
      error, 
      timestamp: new Date().toISOString(),
      status 
    }, 
    { status }
  )
}

// Standard success response wrapper
export function createSuccessResponse(data: any, status: number = 200) {
  return NextResponse.json(
    {
      ...data,
      timestamp: new Date().toISOString(),
      status: 'success'
    },
    { 
      status,
      headers: corsHeaders
    }
  )
}

// CORS preflight handler
export function handleCors(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { 
      status: 200, 
      headers: corsHeaders 
    })
  }
  return null
}

// API middleware wrapper
export function withMiddleware(handler: Function) {
  return async (request: NextRequest, context: any) => {
    // Handle CORS preflight
    const corsResponse = handleCors(request)
    if (corsResponse) return corsResponse

    // Rate limiting
    if (!rateLimit(request)) {
      return createErrorResponse('Rate limit exceeded', 429)
    }

    try {
      const response = await handler(request, context)
      
      // Add CORS headers to response
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      
      return response
    } catch (error: any) {
      console.error('API Error:', error)
      return createErrorResponse(
        error.message || 'Internal server error', 
        error.status || 500
      )
    }
  }
}
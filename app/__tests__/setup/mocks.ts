import { http, HttpResponse } from 'msw'

// Mock API responses for testing
export const handlers = [
  // Auth Sign Up endpoint
  http.post('/api/auth/signup', async ({ request }) => {
    const body = await request.json() as { email?: string; password?: string }

    // Validate required fields
    if (!body.email || !body.password) {
      return HttpResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate password length
    if (body.password.length < 6) {
      return HttpResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Success response
    return HttpResponse.json(
      {
        user: { id: 'user-123', email: body.email },
        session: null,
      },
      { status: 201 }
    )
  }),

  // Auth Login endpoint
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email?: string; password?: string }

    // Validate required fields
    if (!body.email || !body.password) {
      return HttpResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Mock invalid credentials
    if (body.email === 'invalid@example.com') {
      return HttpResponse.json(
        { error: 'Invalid login credentials' },
        { status: 401 }
      )
    }

    // Success response with session
    return HttpResponse.json(
      {
        user: { id: 'user-123', email: body.email },
        session: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        },
      },
      { status: 200 }
    )
  }),

  // Auth Logout endpoint
  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true }, { status: 200 })
  }),

  // Health check endpoint
  http.get('/api/health', () => {
    return HttpResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          redis: { status: 'up' },
          supabase: { status: 'up' },
          app: { status: 'up' },
        },
      },
      { status: 200 }
    )
  }),
]

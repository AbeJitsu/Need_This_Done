import { describe, it, expect } from 'vitest'

describe('POST /api/auth/login', () => {
  it('should successfully login with valid credentials', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    })

    expect(response.status).toBe(200)
    const data = await response.json() as { session: { access_token: string } }
    expect(data.session).toBeDefined()
    expect(data.session.access_token).toBe('test-access-token')
  })

  it('should return 401 for invalid credentials', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid@example.com',
        password: 'password123',
      }),
    })

    expect(response.status).toBe(401)
  })

  it('should return 400 when email is missing', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'password123' }),
    })

    expect(response.status).toBe(400)
  })

  it('should return 400 when password is missing', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    expect(response.status).toBe(400)
  })

  it('should include session tokens in response', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    })

    const data = await response.json() as {
      session: { access_token: string; refresh_token: string; expires_at: number }
    }
    expect(data.session.access_token).toBeDefined()
    expect(data.session.refresh_token).toBeDefined()
    expect(data.session.expires_at).toBeGreaterThan(Math.floor(Date.now() / 1000))
  })
})

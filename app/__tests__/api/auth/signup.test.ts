import { describe, it, expect } from 'vitest'

describe('POST /api/auth/signup', () => {
  it('should successfully create a user with valid email and password', async () => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    })

    expect(response.status).toBe(201)
    const data = await response.json() as { user: { email: string } }
    expect(data.user.email).toBe('test@example.com')
  })

  it('should return 400 when email is missing', async () => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'password123' }),
    })

    expect(response.status).toBe(400)
  })

  it('should return 400 when password is missing', async () => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    expect(response.status).toBe(400)
  })

  it('should return 400 when password is too short', async () => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'pass',
      }),
    })

    expect(response.status).toBe(400)
    const data = await response.json() as { error: string }
    expect(data.error).toContain('at least 6 characters')
  })
})

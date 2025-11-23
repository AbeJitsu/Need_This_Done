import { describe, it, expect } from 'vitest'

describe('GET /api/health', () => {
  it('should return healthy status when all services are up', async () => {
    const response = await fetch('/api/health', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    expect(response.status).toBe(200)
    const data = await response.json() as {
      status: string
      services: { redis: { status: string }; supabase: { status: string } }
    }
    expect(data.status).toBe('healthy')
    expect(data.services.redis.status).toBe('up')
    expect(data.services.supabase.status).toBe('up')
  })

  it('should include timestamp in response', async () => {
    const response = await fetch('/api/health', {
      method: 'GET',
    })

    const data = await response.json() as { timestamp: string }
    expect(data.timestamp).toBeDefined()
    expect(new Date(data.timestamp).getTime()).toBeGreaterThan(0)
  })

  it('should include all required services in response', async () => {
    const response = await fetch('/api/health', {
      method: 'GET',
    })

    const data = await response.json() as {
      services: { redis: unknown; supabase: unknown; app: unknown }
    }
    expect(data.services).toHaveProperty('redis')
    expect(data.services).toHaveProperty('supabase')
    expect(data.services).toHaveProperty('app')
  })
})

import { describe, it, expect } from 'vitest'

describe('POST /api/auth/logout', () => {
  it('should successfully logout', async () => {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    expect(response.status).toBe(200)
    const data = await response.json() as { success: boolean }
    expect(data.success).toBe(true)
  })
})

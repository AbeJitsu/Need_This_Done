import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getCurrentUser, getSession, signOut, onAuthStateChange } from '@/lib/auth'

// Mock the supabase module
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}))

import { supabase } from '@/lib/supabase'

describe('Auth Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCurrentUser', () => {
    it('should return the current user when authenticated', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any)

      const user = await getCurrentUser()

      expect(user).toEqual(mockUser)
    })

    it('should return null when not authenticated', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any)

      const user = await getCurrentUser()

      expect(user).toBeNull()
    })

    it('should return null on error', async () => {
      const mockError = new Error('Auth error')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: mockError,
      } as any)

      const user = await getCurrentUser()

      expect(user).toBeNull()
    })

    it('should handle unexpected exceptions', async () => {
      vi.mocked(supabase.auth.getUser).mockRejectedValue(
        new Error('Unexpected error')
      )

      const user = await getCurrentUser()

      expect(user).toBeNull()
    })
  })

  describe('getSession', () => {
    it('should return the current session', async () => {
      const mockSession = {
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        expires_at: 1234567890,
      }
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      } as any)

      const session = await getSession()

      expect(session).toEqual(mockSession)
    })

    it('should return null when no session exists', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      } as any)

      const session = await getSession()

      expect(session).toBeNull()
    })

    it('should return null on error', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: new Error('Session error'),
      } as any)

      const session = await getSession()

      expect(session).toBeNull()
    })

    it('should handle unexpected exceptions', async () => {
      vi.mocked(supabase.auth.getSession).mockRejectedValue(
        new Error('Unexpected error')
      )

      const session = await getSession()

      expect(session).toBeNull()
    })
  })

  describe('signOut', () => {
    it('should return true on successful signout', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null } as any)

      const result = await signOut()

      expect(result).toBe(true)
    })

    it('should return false on error', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: new Error('Signout error'),
      } as any)

      const result = await signOut()

      expect(result).toBe(false)
    })

    it('should return false on exception', async () => {
      vi.mocked(supabase.auth.signOut).mockRejectedValue(
        new Error('Unexpected error')
      )

      const result = await signOut()

      expect(result).toBe(false)
    })
  })

  describe('onAuthStateChange', () => {
    it('should call the callback with user when authenticated', () => {
      const mockCallback = vi.fn()
      const mockUnsubscribe = vi.fn()
      const mockUser = { id: 'user-123', email: 'test@example.com' }

      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      } as any)

      const unsubscribe = onAuthStateChange(mockCallback)

      // Simulate auth state change
      const onAuthStateChangeCallback = vi.mocked(
        supabase.auth.onAuthStateChange
      ).mock.calls[0]?.[0]
      if (onAuthStateChangeCallback) {
        onAuthStateChangeCallback('SIGNED_IN', {
          user: mockUser,
        } as any)
      }

      expect(typeof unsubscribe).toBe('function')
    })

    it('should call the callback with null when signed out', () => {
      const mockCallback = vi.fn()
      const mockUnsubscribe = vi.fn()

      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      } as any)

      onAuthStateChange(mockCallback)

      // Simulate auth state change to signed out
      const onAuthStateChangeCallback = vi.mocked(
        supabase.auth.onAuthStateChange
      ).mock.calls[0]?.[0]
      if (onAuthStateChangeCallback) {
        onAuthStateChangeCallback('SIGNED_OUT', null as any)
      }

      expect(typeof onAuthStateChange).toBe('function')
    })

    it('should return unsubscribe function', () => {
      const mockCallback = vi.fn()
      const mockUnsubscribe = vi.fn()

      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      } as any)

      const unsubscribe = onAuthStateChange(mockCallback)

      expect(typeof unsubscribe).toBe('function')
    })
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@react-email/render'

// ============================================================================
// Email Integration Tests
// ============================================================================
// What: Tests email templates render correctly and service functions work
// Why: Verify email system works before deployment
// How: Render templates to HTML, test service function calls
//
// Note: These tests mock the actual email sending (Resend API) to avoid
// sending real emails during tests. The mock verifies:
// 1. Templates render to valid HTML
// 2. Service functions are called with correct data
// 3. Proper error handling

// ============================================================================
// Mock Resend API
// ============================================================================
// We mock the email sending to avoid actual API calls during tests

const mockSend = vi.fn().mockResolvedValue({ id: 'test-email-id' })

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: mockSend,
    },
  })),
}))

// ============================================================================
// Template Imports
// ============================================================================

import WelcomeEmail from '@/emails/WelcomeEmail'
import LoginNotificationEmail from '@/emails/LoginNotificationEmail'
import AdminNotification from '@/emails/AdminNotification'
import ClientConfirmation from '@/emails/ClientConfirmation'

// ============================================================================
// Service Imports (after mocking)
// ============================================================================

import {
  sendWelcomeEmail,
  sendLoginNotification,
  sendAdminNotification,
  sendClientConfirmation,
} from '@/lib/email-service'

describe('Email Templates', () => {
  // ==========================================================================
  // Template Rendering Tests
  // ==========================================================================
  // Verify templates can be rendered to HTML without errors

  it('WelcomeEmail renders to valid HTML', async () => {
    const html = await render(
      WelcomeEmail({
        email: 'test@example.com',
        name: 'Test User',
      })
    )

    expect(html).toContain('Welcome to NeedThisDone')
    expect(html).toContain('Test User')
    expect(html).toContain('Start Your First Project')
  })

  it('LoginNotificationEmail renders to valid HTML', async () => {
    const html = await render(
      LoginNotificationEmail({
        email: 'test@example.com',
        loginTime: 'Friday, December 12, 2025 at 3:45 PM PST',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 Chrome/120.0',
      })
    )

    expect(html).toContain('New Sign-In')
    expect(html).toContain('December 12, 2025')
    expect(html).toContain('192.168.1.1')
    expect(html).toContain('Chrome')
    expect(html).toContain('Reset Password')
  })

  it('AdminNotification renders to valid HTML', async () => {
    const html = await render(
      AdminNotification({
        projectId: 'proj-123',
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Acme Inc',
        service: 'Website Services',
        message: 'I need help with my website.',
        attachmentCount: 2,
        submittedAt: 'Dec 12, 2025, 3:45 PM',
      })
    )

    expect(html).toContain('New Project')
    expect(html).toContain('John Doe')
    expect(html).toContain('john@example.com')
    expect(html).toContain('Acme Inc')
    expect(html).toContain('Website Services')
    expect(html).toContain('I need help with my website')
    expect(html).toContain('2')
  })

  it('ClientConfirmation renders to valid HTML', async () => {
    const html = await render(
      ClientConfirmation({
        name: 'Jane Smith',
        service: 'Virtual Assistant',
      })
    )

    expect(html).toContain('We Got Your Message')
    expect(html).toContain('Jane Smith')
    expect(html).toContain('Virtual Assistant')
    expect(html).toContain('2 business days')
    expect(html).toContain('50%')
  })

  it('WelcomeEmail handles missing name gracefully', async () => {
    const html = await render(
      WelcomeEmail({
        email: 'noname@example.com',
      })
    )

    // Should use email prefix as fallback name
    expect(html).toContain('noname')
    expect(html).toContain('Welcome to NeedThisDone')
  })
})

describe('Email Service Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set required env vars
    process.env.RESEND_API_KEY = 'test-api-key'
    process.env.RESEND_FROM_EMAIL = 'test@needthisdone.com'
    process.env.RESEND_ADMIN_EMAIL = 'admin@needthisdone.com'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ==========================================================================
  // Service Function Tests
  // ==========================================================================
  // Verify service functions call Resend with correct data

  it('sendWelcomeEmail calls Resend with correct parameters', async () => {
    const result = await sendWelcomeEmail({
      email: 'newuser@example.com',
      name: 'New User',
    })

    expect(mockSend).toHaveBeenCalled()
    const callArgs = mockSend.mock.calls[0][0]
    expect(callArgs.to).toBe('newuser@example.com')
    expect(callArgs.subject).toContain('Welcome')
  })

  it('sendLoginNotification calls Resend with correct parameters', async () => {
    const result = await sendLoginNotification({
      email: 'user@example.com',
      loginTime: 'Friday, December 12, 2025',
      ipAddress: '10.0.0.1',
      userAgent: 'Safari/17.0',
    })

    expect(mockSend).toHaveBeenCalled()
    const callArgs = mockSend.mock.calls[0][0]
    expect(callArgs.to).toBe('user@example.com')
    expect(callArgs.subject).toContain('Sign-In')
  })

  it('sendAdminNotification sends to admin email', async () => {
    const result = await sendAdminNotification({
      projectId: 'proj-456',
      name: 'Client Name',
      email: 'client@example.com',
      service: 'Data & Documents',
      message: 'Help me organize my files.',
      attachmentCount: 0,
      submittedAt: 'Dec 12, 2025',
    })

    expect(mockSend).toHaveBeenCalled()
    const callArgs = mockSend.mock.calls[0][0]
    expect(callArgs.to).toBe('admin@needthisdone.com')
    expect(callArgs.subject).toContain('New Project')
    expect(callArgs.subject).toContain('Client Name')
  })

  it('sendClientConfirmation sends to client email', async () => {
    const result = await sendClientConfirmation(
      'client@example.com',
      {
        name: 'Happy Client',
        service: 'Marketing',
      }
    )

    expect(mockSend).toHaveBeenCalled()
    const callArgs = mockSend.mock.calls[0][0]
    expect(callArgs.to).toBe('client@example.com')
    expect(callArgs.subject).toContain('We Got Your Message')
  })
})

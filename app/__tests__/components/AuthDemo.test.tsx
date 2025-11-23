import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthDemo from '@/components/AuthDemo'

// Mock the AuthContext
vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    signOut: vi.fn(),
  })),
}))

describe('AuthDemo Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render authentication form when not authenticated', () => {
    render(<AuthDemo />)

    expect(screen.getByText('Real Authentication Working')).toBeInTheDocument()
    expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument()
  })

  it('should render the component without errors', () => {
    render(<AuthDemo />)
    // Component should render successfully
    expect(screen.getByText('Real Authentication Working')).toBeInTheDocument()
  })

  it('should have signup and login mode buttons', () => {
    render(<AuthDemo />)

    const signUpButton = screen.getByRole('button', { name: 'Sign Up' })
    const signInButton = screen.getByRole('button', { name: 'Sign In' })

    expect(signUpButton).toBeInTheDocument()
    expect(signInButton).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(<AuthDemo />)

    const submitButton = screen.getByRole('button', { name: /Create Account/ })

    // Submit button should be disabled when fields are empty
    expect(submitButton).toBeDisabled()

    // Fill only email
    const emailInput = screen.getByLabelText(/Email Address/)
    await user.type(emailInput, 'test@example.com')
    expect(submitButton).toBeDisabled()

    // Fill password
    const passwordInput = screen.getByLabelText(/Password/)
    await user.type(passwordInput, 'password123')
    expect(submitButton).not.toBeDisabled()
  })

  it('should handle signup submission', async () => {
    const user = userEvent.setup()
    render(<AuthDemo />)

    const emailInput = screen.getByLabelText(/Email Address/)
    const passwordInput = screen.getByLabelText(/Password/)
    const submitButton = screen.getByRole('button', { name: /Create Account/ })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Account created/)).toBeInTheDocument()
    })
  })

  it('should allow user to switch to login mode and fill form', async () => {
    const user = userEvent.setup()
    render(<AuthDemo />)

    // Get all Sign In buttons
    const signInButtons = screen.getAllByRole('button', { name: 'Sign In' })
    const signInModeButton = signInButtons.find(btn => {
      const parent = btn.closest('[class*="flex-1"]')
      return parent !== null
    })

    if (signInModeButton) {
      await user.click(signInModeButton)
    }

    const emailInput = screen.getByLabelText(/Email Address/)
    const passwordInput = screen.getByLabelText(/Password/)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    // Form should be fillable
    expect((emailInput as HTMLInputElement).value).toBe('test@example.com')
    expect((passwordInput as HTMLInputElement).value).toBe('password123')
  })

  it('should clear form fields after successful signup', async () => {
    const user = userEvent.setup()
    render(<AuthDemo />)

    const emailInput = screen.getByLabelText(/Email Address/) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/Password/) as HTMLInputElement
    const submitButton = screen.getByRole('button', { name: /Create Account/ })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(emailInput.value).toBe('')
      expect(passwordInput.value).toBe('')
    })
  })
})

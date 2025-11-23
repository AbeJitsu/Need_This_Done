import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DarkModeToggle from '@/components/DarkModeToggle'

describe('DarkModeToggle Component', () => {
  beforeEach(() => {
    // Clear localStorage and reset HTML classes before each test
    localStorage.clear()
    document.documentElement.classList.remove('dark', 'light')
  })

  it('should render the toggle button', async () => {
    render(<DarkModeToggle />)

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  it('should read dark mode from localStorage', async () => {
    localStorage.setItem('darkMode', 'true')

    render(<DarkModeToggle />)

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  it('should read light mode from localStorage', async () => {
    localStorage.setItem('darkMode', 'false')

    render(<DarkModeToggle />)

    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true)
    })
  })

  it('should toggle dark mode when button is clicked', async () => {
    localStorage.setItem('darkMode', 'false')
    const user = userEvent.setup()

    render(<DarkModeToggle />)

    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true)
    })

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  it('should persist dark mode preference to localStorage', async () => {
    localStorage.setItem('darkMode', 'false')
    const user = userEvent.setup()

    render(<DarkModeToggle />)

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      expect(localStorage.getItem('darkMode')).toBe('true')
    })
  })

  it('should have correct aria-label for light mode', async () => {
    localStorage.setItem('darkMode', 'true')

    render(<DarkModeToggle />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode')
    })
  })

  it('should have correct aria-label for dark mode', async () => {
    localStorage.setItem('darkMode', 'false')

    render(<DarkModeToggle />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')
    })
  })

  it('should meet accessibility standards', async () => {
    localStorage.setItem('darkMode', 'true')

    render(<DarkModeToggle />)

    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toHaveClass('min-h-[44px]')
      expect(button).toHaveClass('min-w-[44px]')
    })
  })
})

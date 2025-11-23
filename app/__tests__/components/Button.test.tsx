import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '@/components/Button'

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should render all semantic variants', () => {
    const variants = ['primary', 'secondary', 'success', 'danger', 'warning', 'ghost'] as const

    variants.forEach((variant) => {
      const { unmount } = render(<Button variant={variant}>{variant}</Button>)
      expect(screen.getByText(variant)).toBeInTheDocument()
      unmount()
    })
  })

  it('should render all size options', () => {
    const sizes = ['sm', 'md', 'lg'] as const

    sizes.forEach((size) => {
      const { unmount } = render(<Button size={size}>{size}</Button>)
      expect(screen.getByText(size)).toBeInTheDocument()
      unmount()
    })
  })

  it('should render as link when href is provided', () => {
    render(<Button href="/test">Link button</Button>)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/test')
  })

  it('should render as button by default', () => {
    render(<Button>Regular button</Button>)
    const button = screen.getByRole('button')
    expect(button.tagName).toBe('BUTTON')
  })

  it('should handle onClick events', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button')
    await userEvent.click(button)

    expect(handleClick).toHaveBeenCalled()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled button</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should not trigger onClick when disabled', async () => {
    const handleClick = vi.fn()
    render(
      <Button disabled onClick={handleClick}>
        Disabled button
      </Button>
    )

    const button = screen.getByRole('button')
    await userEvent.click(button)

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should meet minimum accessibility standards', () => {
    const { container } = render(<Button>Accessible button</Button>)
    const button = container.querySelector('button')

    // Check that button has accessibility class for minimum dimensions (44px)
    expect(button).toHaveClass('min-h-[44px]')
    expect(button).toHaveClass('min-w-[44px]')
  })

  it('should render as disabled link', () => {
    render(
      <Button href="/test" disabled>
        Disabled link
      </Button>
    )
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })
})

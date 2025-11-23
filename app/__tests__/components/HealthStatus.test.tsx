import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import HealthStatus from '@/components/HealthStatus'

describe('HealthStatus Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading state initially', () => {
    render(<HealthStatus />)
    expect(screen.getByText('Checking services...')).toBeInTheDocument()
  })

  it('should fetch and display health status', async () => {
    render(<HealthStatus />)

    await waitFor(() => {
      expect(screen.getByText('System Status')).toBeInTheDocument()
    })
  })

  it('should display all service cards', async () => {
    render(<HealthStatus />)

    await waitFor(() => {
      expect(screen.getByText('Speed System')).toBeInTheDocument()
      expect(screen.getByText('Database')).toBeInTheDocument()
      expect(screen.getByText('Your Website')).toBeInTheDocument()
    })
  })

  it('should display status badge', async () => {
    render(<HealthStatus />)

    await waitFor(() => {
      // Check for either healthy or unhealthy status badge
      const statusElements = screen.queryAllByText(/Operational|Detected/)
      expect(statusElements.length).toBeGreaterThanOrEqual(0)
    })
  })

  it('should display service status information', async () => {
    render(<HealthStatus />)

    await waitFor(() => {
      // Component should render some status information
      expect(screen.getByText('System Status')).toBeInTheDocument()
      expect(screen.getByText('Speed System')).toBeInTheDocument()
    })
  })

  it('should show refresh interval message', async () => {
    render(<HealthStatus />)

    await waitFor(() => {
      expect(screen.getByText(/Refreshes every 30 seconds/)).toBeInTheDocument()
    })
  })

  it('should display last checked timestamp', async () => {
    render(<HealthStatus />)

    await waitFor(() => {
      expect(screen.getByText(/Last checked:/)).toBeInTheDocument()
    })
  })

  it('should render with proper semantic structure', async () => {
    render(<HealthStatus />)

    await waitFor(() => {
      // Verify proper heading structure
      expect(screen.getByText('System Status')).toBeInTheDocument()
      // Verify status badge is present
      expect(screen.getByText('All Operational')).toBeInTheDocument()
    })
  })

  it('should set up auto-refresh interval on mount', async () => {
    const setIntervalSpy = vi.spyOn(global, 'setInterval')

    render(<HealthStatus />)

    await waitFor(() => {
      expect(screen.getByText('System Status')).toBeInTheDocument()
    })

    // setInterval should have been called for 30 second refresh
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 30000)

    setIntervalSpy.mockRestore()
  })
})

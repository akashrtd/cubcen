import { render, screen } from '@testing-library/react'
import { DashboardLayout } from '../layout/dashboard-layout'
import { DashboardCard } from '../cards/dashboard-card'
import { DashboardGrid, GridItem } from '../grid/dashboard-grid'
import { ChartWrapper } from '../charts/chart-wrapper'

describe('Dashboard Infrastructure', () => {
  describe('DashboardLayout', () => {
    it('renders with children', () => {
      render(
        <DashboardLayout>
          <div>Test content</div>
        </DashboardLayout>
      )

      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('renders with header, sidebar, and footer', () => {
      render(
        <DashboardLayout
          header={<div>Header</div>}
          sidebar={<div>Sidebar</div>}
          footer={<div>Footer</div>}
        >
          <div>Main content</div>
        </DashboardLayout>
      )

      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getByText('Sidebar')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
      expect(screen.getByText('Main content')).toBeInTheDocument()
    })
  })

  describe('DashboardCard', () => {
    it('renders with title and metric', () => {
      render(
        <DashboardCard
          title="Test Card"
          metric={{ value: 100, unit: 'items' }}
        />
      )

      expect(screen.getByText('Test Card')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.getByText('items')).toBeInTheDocument()
    })

    it('shows loading state', () => {
      const { container } = render(<DashboardCard loading />)

      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('shows error state', () => {
      render(<DashboardCard error="Test error" />)

      expect(screen.getByText('Test error')).toBeInTheDocument()
    })
  })

  describe('DashboardGrid', () => {
    it('renders grid with items', () => {
      render(
        <DashboardGrid>
          <GridItem>
            <div>Grid item 1</div>
          </GridItem>
          <GridItem>
            <div>Grid item 2</div>
          </GridItem>
        </DashboardGrid>
      )

      expect(screen.getByText('Grid item 1')).toBeInTheDocument()
      expect(screen.getByText('Grid item 2')).toBeInTheDocument()
    })
  })

  describe('ChartWrapper', () => {
    it('shows loading state', () => {
      render(<ChartWrapper type="line" data={{ datasets: [] }} loading />)

      expect(screen.getByText(/loading chart/i)).toBeInTheDocument()
    })

    it('shows error state', () => {
      render(
        <ChartWrapper type="line" data={{ datasets: [] }} error="Chart error" />
      )

      expect(screen.getByText('Chart error')).toBeInTheDocument()
    })

    it('shows placeholder when not loading or error', () => {
      render(<ChartWrapper type="line" data={{ datasets: [] }} />)

      expect(
        screen.getByText(/chart component for line will be implemented/i)
      ).toBeInTheDocument()
    })
  })
})

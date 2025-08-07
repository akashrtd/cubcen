import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { DashboardGrid, GridItem } from '../dashboard-grid'

expect.extend(toHaveNoViolations)

describe('DashboardGrid', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(
        <DashboardGrid>
          <div>Grid Item 1</div>
          <div>Grid Item 2</div>
        </DashboardGrid>
      )

      expect(screen.getByText('Grid Item 1')).toBeInTheDocument()
      expect(screen.getByText('Grid Item 2')).toBeInTheDocument()

      const grid = document.querySelector('.dashboard-grid')
      expect(grid).toBeInTheDocument()
      expect(grid).toHaveClass('grid')
    })

    it('applies custom className', () => {
      render(
        <DashboardGrid className="custom-grid-class">
          <div>Content</div>
        </DashboardGrid>
      )

      const grid = document.querySelector('.dashboard-grid')
      expect(grid).toHaveClass('custom-grid-class')
    })

    it('applies custom gap', () => {
      render(
        <DashboardGrid gap={32}>
          <div>Content</div>
        </DashboardGrid>
      )

      const grid = document.querySelector('.dashboard-grid')
      expect(grid).toHaveStyle({ '--dashboard-grid-gap': '32px' })
    })
  })

  describe('Responsive Configuration', () => {
    it('applies default responsive columns', () => {
      render(
        <DashboardGrid>
          <div>Content</div>
        </DashboardGrid>
      )

      const grid = document.querySelector('.dashboard-grid')
      expect(grid).toHaveStyle({
        '--dashboard-grid-columns-mobile': '1',
        '--dashboard-grid-columns-tablet': '6',
        '--dashboard-grid-columns-desktop': '12',
      })
    })

    it('applies custom responsive columns', () => {
      render(
        <DashboardGrid
          responsive={{
            mobile: 2,
            tablet: 4,
            desktop: 8,
          }}
        >
          <div>Content</div>
        </DashboardGrid>
      )

      const grid = document.querySelector('.dashboard-grid')
      expect(grid).toHaveStyle({
        '--dashboard-grid-columns-mobile': '2',
        '--dashboard-grid-columns-tablet': '4',
        '--dashboard-grid-columns-desktop': '8',
      })
    })

    it('applies responsive grid template classes', () => {
      render(
        <DashboardGrid>
          <div>Content</div>
        </DashboardGrid>
      )

      const grid = document.querySelector('.dashboard-grid')
      expect(grid).toHaveClass(
        '[grid-template-columns:repeat(var(--dashboard-grid-columns-mobile),1fr)]',
        'md:[grid-template-columns:repeat(var(--dashboard-grid-columns-tablet),1fr)]',
        'lg:[grid-template-columns:repeat(var(--dashboard-grid-columns-desktop),1fr)]'
      )
    })
  })

  describe('Grid Properties', () => {
    it('applies autoFlow property', () => {
      render(
        <DashboardGrid autoFlow="column">
          <div>Content</div>
        </DashboardGrid>
      )

      const grid = document.querySelector('.dashboard-grid')
      expect(grid).toHaveStyle({ gridAutoFlow: 'column' })
    })

    it('applies alignItems property', () => {
      render(
        <DashboardGrid alignItems="center">
          <div>Content</div>
        </DashboardGrid>
      )

      const grid = document.querySelector('.dashboard-grid')
      expect(grid).toHaveStyle({ alignItems: 'center' })
    })

    it('applies justifyItems property', () => {
      render(
        <DashboardGrid justifyItems="center">
          <div>Content</div>
        </DashboardGrid>
      )

      const grid = document.querySelector('.dashboard-grid')
      expect(grid).toHaveStyle({ justifyItems: 'center' })
    })
  })

  describe('Accessibility', () => {
    it('meets WCAG accessibility standards', async () => {
      const { container } = render(
        <DashboardGrid>
          <div>Grid Item 1</div>
          <div>Grid Item 2</div>
          <div>Grid Item 3</div>
        </DashboardGrid>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})

describe('GridItem', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(
        <GridItem>
          <div>Grid Item Content</div>
        </GridItem>
      )

      expect(screen.getByText('Grid Item Content')).toBeInTheDocument()

      const item = document.querySelector('.dashboard-grid-item')
      expect(item).toBeInTheDocument()
      expect(item).toHaveClass('col-span-1')
    })

    it('applies custom className', () => {
      render(
        <GridItem className="custom-item-class">
          <div>Content</div>
        </GridItem>
      )

      const item = document.querySelector('.dashboard-grid-item')
      expect(item).toHaveClass('custom-item-class')
    })
  })

  describe('Column Span', () => {
    it('applies numeric column span', () => {
      render(
        <GridItem colSpan={4}>
          <div>Content</div>
        </GridItem>
      )

      const item = document.querySelector('.dashboard-grid-item')
      expect(item).toHaveClass('col-span-4')
    })

    it('applies responsive column span', () => {
      render(
        <GridItem
          colSpan={{
            mobile: 1,
            tablet: 3,
            desktop: 6,
          }}
        >
          <div>Content</div>
        </GridItem>
      )

      const item = document.querySelector('.dashboard-grid-item')
      expect(item).toHaveClass('col-span-1', 'md:col-span-3', 'lg:col-span-6')
    })

    it('limits column span to maximum values', () => {
      render(
        <GridItem
          colSpan={{
            mobile: 5, // Should be limited to 1
            tablet: 10, // Should be limited to 6
            desktop: 20, // Should be limited to 12
          }}
        >
          <div>Content</div>
        </GridItem>
      )

      const item = document.querySelector('.dashboard-grid-item')
      expect(item).toHaveClass('col-span-1', 'md:col-span-6', 'lg:col-span-12')
    })
  })

  describe('Row Span', () => {
    it('applies numeric row span', () => {
      render(
        <GridItem rowSpan={2}>
          <div>Content</div>
        </GridItem>
      )

      const item = document.querySelector('.dashboard-grid-item')
      expect(item).toHaveClass('row-span-2')
    })

    it('does not apply row span for value of 1', () => {
      render(
        <GridItem rowSpan={1}>
          <div>Content</div>
        </GridItem>
      )

      const item = document.querySelector('.dashboard-grid-item')
      expect(item).not.toHaveClass('row-span-1')
    })

    it('applies responsive row span', () => {
      render(
        <GridItem
          rowSpan={{
            mobile: 2,
            tablet: 3,
            desktop: 4,
          }}
        >
          <div>Content</div>
        </GridItem>
      )

      const item = document.querySelector('.dashboard-grid-item')
      expect(item).toHaveClass('row-span-2', 'md:row-span-3', 'lg:row-span-4')
    })

    it('limits row span to maximum values', () => {
      render(
        <GridItem
          rowSpan={{
            mobile: 10, // Should be limited to 6
            tablet: 15, // Should be limited to 6
            desktop: 20, // Should be limited to 6
          }}
        >
          <div>Content</div>
        </GridItem>
      )

      const item = document.querySelector('.dashboard-grid-item')
      expect(item).toHaveClass('row-span-6', 'md:row-span-6', 'lg:row-span-6')
    })
  })

  describe('Order', () => {
    it('applies numeric order', () => {
      render(
        <GridItem order={3}>
          <div>Content</div>
        </GridItem>
      )

      const item = document.querySelector('.dashboard-grid-item')
      expect(item).toHaveClass('order-3')
    })

    it('applies responsive order', () => {
      render(
        <GridItem
          order={{
            mobile: 1,
            tablet: 2,
            desktop: 3,
          }}
        >
          <div>Content</div>
        </GridItem>
      )

      const item = document.querySelector('.dashboard-grid-item')
      expect(item).toHaveClass('order-1', 'md:order-2', 'lg:order-3')
    })

    it('limits order to maximum values', () => {
      render(
        <GridItem
          order={{
            mobile: 20, // Should be limited to 12
            tablet: 25, // Should be limited to 12
            desktop: 30, // Should be limited to 12
          }}
        >
          <div>Content</div>
        </GridItem>
      )

      const item = document.querySelector('.dashboard-grid-item')
      expect(item).toHaveClass('order-12', 'md:order-12', 'lg:order-12')
    })

    it('does not apply order classes when order is undefined', () => {
      render(
        <GridItem>
          <div>Content</div>
        </GridItem>
      )

      const item = document.querySelector('.dashboard-grid-item')
      expect(item?.className).not.toMatch(/order-/)
    })
  })

  describe('Priority', () => {
    it('applies default medium priority', () => {
      render(
        <GridItem>
          <div>Content</div>
        </GridItem>
      )

      const item = document.querySelector('.dashboard-grid-item')
      expect(item).toHaveClass('dashboard-grid-item-priority-medium')
    })

    it('applies low priority', () => {
      render(
        <GridItem priority="low">
          <div>Content</div>
        </GridItem>
      )

      const item = document.querySelector('.dashboard-grid-item')
      expect(item).toHaveClass('dashboard-grid-item-priority-low')
    })

    it('applies high priority', () => {
      render(
        <GridItem priority="high">
          <div>Content</div>
        </GridItem>
      )

      const item = document.querySelector('.dashboard-grid-item')
      expect(item).toHaveClass('dashboard-grid-item-priority-high')
    })

    it('applies critical priority', () => {
      render(
        <GridItem priority="critical">
          <div>Content</div>
        </GridItem>
      )

      const item = document.querySelector('.dashboard-grid-item')
      expect(item).toHaveClass('dashboard-grid-item-priority-critical')
    })
  })

  describe('Complex Layouts', () => {
    it('handles multiple responsive properties together', () => {
      render(
        <GridItem
          colSpan={{ mobile: 1, tablet: 2, desktop: 4 }}
          rowSpan={{ mobile: 1, tablet: 2, desktop: 3 }}
          order={{ mobile: 2, tablet: 1, desktop: 3 }}
          priority="high"
        >
          <div>Complex Item</div>
        </GridItem>
      )

      const item = document.querySelector('.dashboard-grid-item')
      expect(item).toHaveClass(
        'dashboard-grid-item-priority-high',
        'col-span-1',
        'md:col-span-2',
        'lg:col-span-4',
        'md:row-span-2',
        'lg:row-span-3',
        'order-2',
        'md:order-1',
        'lg:order-3'
      )
    })

    it('handles partial responsive configurations', () => {
      render(
        <GridItem
          colSpan={{ desktop: 6 }}
          rowSpan={{ tablet: 2 }}
          order={{ mobile: 1 }}
        >
          <div>Partial Config</div>
        </GridItem>
      )

      const item = document.querySelector('.dashboard-grid-item')
      expect(item).toHaveClass('lg:col-span-6', 'md:row-span-2', 'order-1')
    })
  })

  describe('Accessibility', () => {
    it('meets WCAG accessibility standards', async () => {
      const { container } = render(
        <GridItem colSpan={4} rowSpan={2} order={1} priority="high">
          <div>Accessible Grid Item</div>
        </GridItem>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})

describe('DashboardGrid with GridItems', () => {
  it('renders complete grid layout', () => {
    render(
      <DashboardGrid>
        <GridItem colSpan={4} priority="critical">
          <div>Critical Item</div>
        </GridItem>
        <GridItem colSpan={4} priority="high">
          <div>High Priority Item</div>
        </GridItem>
        <GridItem colSpan={4} priority="medium">
          <div>Medium Priority Item</div>
        </GridItem>
        <GridItem colSpan={6} priority="low">
          <div>Low Priority Item</div>
        </GridItem>
      </DashboardGrid>
    )

    expect(screen.getByText('Critical Item')).toBeInTheDocument()
    expect(screen.getByText('High Priority Item')).toBeInTheDocument()
    expect(screen.getByText('Medium Priority Item')).toBeInTheDocument()
    expect(screen.getByText('Low Priority Item')).toBeInTheDocument()

    const grid = document.querySelector('.dashboard-grid')
    const items = document.querySelectorAll('.dashboard-grid-item')

    expect(grid).toBeInTheDocument()
    expect(items).toHaveLength(4)
  })

  it('handles responsive card layout (3 cards per row on desktop, 2 on tablet, 1 on mobile)', () => {
    render(
      <DashboardGrid>
        <GridItem colSpan={{ mobile: 1, tablet: 3, desktop: 4 }}>
          <div>Card 1</div>
        </GridItem>
        <GridItem colSpan={{ mobile: 1, tablet: 3, desktop: 4 }}>
          <div>Card 2</div>
        </GridItem>
        <GridItem colSpan={{ mobile: 1, tablet: 3, desktop: 4 }}>
          <div>Card 3</div>
        </GridItem>
      </DashboardGrid>
    )

    const items = document.querySelectorAll('.dashboard-grid-item')

    items.forEach(item => {
      expect(item).toHaveClass('col-span-1', 'md:col-span-3', 'lg:col-span-4')
    })
  })

  it('meets WCAG accessibility standards for complete layout', async () => {
    const { container } = render(
      <DashboardGrid responsive={{ mobile: 1, tablet: 2, desktop: 3 }} gap={24}>
        <GridItem colSpan={1} priority="critical">
          <div role="region" aria-label="Critical metrics">
            <h2>Critical Metrics</h2>
            <p>Important data here</p>
          </div>
        </GridItem>
        <GridItem colSpan={1} priority="high">
          <div role="region" aria-label="High priority data">
            <h2>High Priority</h2>
            <p>Important information</p>
          </div>
        </GridItem>
        <GridItem colSpan={1} priority="medium">
          <div role="region" aria-label="Standard metrics">
            <h2>Standard Metrics</h2>
            <p>Regular data</p>
          </div>
        </GridItem>
      </DashboardGrid>
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

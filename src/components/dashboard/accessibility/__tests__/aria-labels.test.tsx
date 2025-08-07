import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  ariaLabels,
  useAriaLabels,
  AriaDescription,
  LiveRegion,
  AccessibleElement,
  generateChartAriaLabel,
  generateTableCellAriaLabel,
  generateFormFieldAriaLabel,
  generateNavigationAriaLabel,
} from '../aria-labels'

describe('ariaLabels utility', () => {
  describe('card labels', () => {
    it('generates interactive card label', () => {
      const label = ariaLabels.card.interactive('Sales Dashboard')
      expect(label).toBe('Sales Dashboard card, interactive')
    })

    it('generates loading card label', () => {
      const label = ariaLabels.card.loading('Analytics')
      expect(label).toBe('Analytics card loading')
    })

    it('generates error card label', () => {
      const label = ariaLabels.card.error('Revenue', 'Failed to load data')
      expect(label).toBe('Revenue card error: Failed to load data')
    })

    it('generates metric card label', () => {
      const label = ariaLabels.card.metric('Total Sales', 1500, 'USD', 'up')
      expect(label).toBe('Total Sales: 1500 USD, trend up')
    })
  })

  describe('chart labels', () => {
    it('generates chart container label', () => {
      const label = ariaLabels.chart.container('bar', 'Monthly Revenue')
      expect(label).toBe('bar chart showing Monthly Revenue')
    })

    it('generates interactive chart label', () => {
      const label = ariaLabels.chart.interactive('line')
      expect(label).toBe(
        'Interactive line chart. Use arrow keys to navigate, Enter to select'
      )
    })

    it('generates chart element label', () => {
      const label = ariaLabels.chart.element('bar', 'January', 1000, 0, 12)
      expect(label).toBe('bar element 1 of 12: January, value 1000')
    })

    it('generates legend label', () => {
      const label = ariaLabels.chart.legend('Revenue', true)
      expect(label).toBe('Legend item: Revenue, active')
    })
  })

  describe('navigation labels', () => {
    it('generates skip link label', () => {
      const label = ariaLabels.navigation.skip('main content')
      expect(label).toBe('Skip to main content')
    })

    it('generates toggle label', () => {
      const label = ariaLabels.navigation.toggle(true, 'sidebar')
      expect(label).toBe('Collapse sidebar')
    })

    it('generates current page label', () => {
      const label = ariaLabels.navigation.current('Dashboard')
      expect(label).toBe('Current page: Dashboard')
    })
  })

  describe('form labels', () => {
    it('generates required field label', () => {
      const label = ariaLabels.form.required('Email Address')
      expect(label).toBe('Email Address, required')
    })

    it('generates invalid field label', () => {
      const label = ariaLabels.form.invalid(
        'Password',
        'Must be at least 8 characters'
      )
      expect(label).toBe('Password, invalid: Must be at least 8 characters')
    })

    it('generates search label', () => {
      const label = ariaLabels.form.search('products')
      expect(label).toBe('Search products')
    })
  })

  describe('table labels', () => {
    it('generates table container label', () => {
      const label = ariaLabels.table.container('User List', 25)
      expect(label).toBe('Data table: User List, 25 rows')
    })

    it('generates sortable column label', () => {
      const label = ariaLabels.table.sortable('Name', 'asc')
      expect(label).toBe('Sort by Name, currently sorted ascending')
    })

    it('generates row label', () => {
      const label = ariaLabels.table.row(2, 10, true)
      expect(label).toBe('Row 3 of 10, selected')
    })
  })

  describe('status labels', () => {
    it('generates loading status', () => {
      const label = ariaLabels.status.loading('user data')
      expect(label).toBe('Loading user data')
    })

    it('generates progress status', () => {
      const label = ariaLabels.status.progress(3, 5, 'Upload')
      expect(label).toBe('Upload: 3 of 5 complete')
    })
  })
})

describe('useAriaLabels hook', () => {
  function TestComponent() {
    const labels = useAriaLabels()
    return <div>{labels.card.interactive('Test Card')}</div>
  }

  it('provides aria labels through hook', () => {
    render(<TestComponent />)
    expect(screen.getByText('Test Card card, interactive')).toBeInTheDocument()
  })
})

describe('AriaDescription component', () => {
  it('renders description with correct attributes', () => {
    render(
      <AriaDescription id="test-desc">
        This is a description for screen readers
      </AriaDescription>
    )

    const description = document.getElementById('test-desc')
    expect(description).toBeInTheDocument()
    expect(description).toHaveClass('sr-only')
    expect(description).toHaveAttribute('role', 'text')
    expect(description).toHaveTextContent(
      'This is a description for screen readers'
    )
  })

  it('applies custom className', () => {
    render(
      <AriaDescription id="test-desc" className="custom-class">
        Description text
      </AriaDescription>
    )

    const description = document.getElementById('test-desc')
    expect(description).toHaveClass('sr-only', 'custom-class')
  })
})

describe('LiveRegion component', () => {
  it('renders with default polite priority', () => {
    render(
      <LiveRegion>
        <span>Live update</span>
      </LiveRegion>
    )

    const region = screen.getByText('Live update').parentElement
    expect(region).toHaveAttribute('aria-live', 'polite')
    expect(region).toHaveAttribute('aria-atomic', 'true')
    expect(region).toHaveAttribute('aria-relevant', 'all')
    expect(region).toHaveAttribute('role', 'status')
  })

  it('renders with assertive priority', () => {
    render(
      <LiveRegion priority="assertive">
        <span>Urgent update</span>
      </LiveRegion>
    )

    const region = screen.getByText('Urgent update').parentElement
    expect(region).toHaveAttribute('aria-live', 'assertive')
    expect(region).toHaveAttribute('role', 'alert')
  })

  it('applies custom attributes', () => {
    render(
      <LiveRegion atomic={false} relevant="additions">
        <span>Custom update</span>
      </LiveRegion>
    )

    const region = screen.getByText('Custom update').parentElement
    expect(region).toHaveAttribute('aria-atomic', 'false')
    expect(region).toHaveAttribute('aria-relevant', 'additions')
  })
})

describe('AccessibleElement component', () => {
  it('adds aria-label to child element', () => {
    render(
      <AccessibleElement label="Custom button label">
        <button>Click me</button>
      </AccessibleElement>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Custom button label')
  })

  it('adds description with generated ID', () => {
    render(
      <AccessibleElement description="This button performs an action">
        <button id="test-button">Action</button>
      </AccessibleElement>
    )

    const button = screen.getByRole('button')
    const descriptionId = button.getAttribute('aria-describedby')

    expect(descriptionId).toBeTruthy()
    expect(document.getElementById(descriptionId!)).toHaveTextContent(
      'This button performs an action'
    )
  })

  it('adds multiple ARIA attributes', () => {
    render(
      <AccessibleElement
        role="menuitem"
        expanded={true}
        selected={false}
        disabled={false}
        required={true}
        invalid={false}
        current="page"
      >
        <div>Menu item</div>
      </AccessibleElement>
    )

    const element = screen.getByText('Menu item')
    expect(element).toHaveAttribute('role', 'menuitem')
    expect(element).toHaveAttribute('aria-expanded', 'true')
    expect(element).toHaveAttribute('aria-selected', 'false')
    expect(element).toHaveAttribute('aria-disabled', 'false')
    expect(element).toHaveAttribute('aria-required', 'true')
    expect(element).toHaveAttribute('aria-invalid', 'false')
    expect(element).toHaveAttribute('aria-current', 'page')
  })

  it('preserves existing ARIA attributes when not overridden', () => {
    render(
      <AccessibleElement label="New label">
        <button aria-describedby="existing-desc">Button</button>
      </AccessibleElement>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'New label')
    expect(button).toHaveAttribute('aria-describedby', 'existing-desc')
  })
})

describe('utility functions', () => {
  describe('generateChartAriaLabel', () => {
    it('generates label with all properties', () => {
      const element = { label: 'Q1 Sales', value: 1500, x: 'January', y: 1500 }
      const label = generateChartAriaLabel(element, 0, 4, 'bar')

      expect(label).toBe('bar element 1 of 4: Q1 Sales, value 1500')
    })

    it('generates label with y value when no value', () => {
      const element = { label: 'Data Point', y: 250, x: 'Feb' }
      const label = generateChartAriaLabel(element, 1, 5, 'line')

      expect(label).toBe(
        'line element 2 of 5: Data Point, y value 250, x value Feb'
      )
    })

    it('generates label with data property', () => {
      const element = { data: 'Custom data' }
      const label = generateChartAriaLabel(element, 2, 3, 'pie')

      expect(label).toBe('pie element 3 of 3, data Custom data')
    })
  })

  describe('generateTableCellAriaLabel', () => {
    it('generates comprehensive cell label', () => {
      const label = generateTableCellAriaLabel('John Doe', 'Name', 0, 1)
      expect(label).toBe('Name: John Doe, row 1, column 2')
    })
  })

  describe('generateFormFieldAriaLabel', () => {
    it('generates label with all properties', () => {
      const label = generateFormFieldAriaLabel(
        'Email',
        true,
        true,
        'Invalid email format',
        'Enter your work email'
      )
      expect(label).toBe(
        'Email, required, invalid: Invalid email format. Enter your work email'
      )
    })

    it('generates simple label', () => {
      const label = generateFormFieldAriaLabel('Username')
      expect(label).toBe('Username')
    })
  })

  describe('generateNavigationAriaLabel', () => {
    it('generates navigation label with page info', () => {
      const label = generateNavigationAriaLabel('Dashboard', 5, 0)
      expect(label).toBe('Current page: Dashboard, page 1 of 5')
    })

    it('generates simple navigation label', () => {
      const label = generateNavigationAriaLabel('Settings')
      expect(label).toBe('Current page: Settings')
    })
  })
})

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  KeyboardNavigation,
  useFocusManagement,
  FocusTrap,
} from '../keyboard-navigation'

describe('KeyboardNavigation', () => {
  it('renders children correctly', () => {
    render(
      <KeyboardNavigation>
        <div>Test content</div>
      </KeyboardNavigation>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders skip links when provided', () => {
    const skipLinks = [
      { href: '#main', label: 'Skip to main content' },
      { href: '#nav', label: 'Skip to navigation' },
    ]

    render(
      <KeyboardNavigation skipLinks={skipLinks}>
        <div>Content</div>
      </KeyboardNavigation>
    )

    // Skip links should be present but visually hidden
    expect(screen.getByText('Skip to main content')).toBeInTheDocument()
    expect(screen.getByText('Skip to navigation')).toBeInTheDocument()
  })

  it('handles escape key when onEscape is provided', async () => {
    const user = userEvent.setup()
    const onEscape = jest.fn()

    render(
      <KeyboardNavigation onEscape={onEscape}>
        <button>Test button</button>
      </KeyboardNavigation>
    )

    const button = screen.getByRole('button')
    button.focus()

    await user.keyboard('{Escape}')
    expect(onEscape).toHaveBeenCalled()
  })

  it('traps focus when trapFocus is enabled', async () => {
    const user = userEvent.setup()

    render(
      <KeyboardNavigation trapFocus>
        <button>First button</button>
        <button>Second button</button>
      </KeyboardNavigation>
    )

    const firstButton = screen.getByText('First button')
    const secondButton = screen.getByText('Second button')

    firstButton.focus()
    expect(firstButton).toHaveFocus()

    // Tab to second button
    await user.tab()
    expect(secondButton).toHaveFocus()

    // Tab should wrap to first button
    await user.tab()
    expect(firstButton).toHaveFocus()

    // Shift+Tab should go to last button
    await user.tab({ shift: true })
    expect(secondButton).toHaveFocus()
  })

  it('handles chart navigation with arrow keys', async () => {
    const user = userEvent.setup()

    render(
      <KeyboardNavigation>
        <div data-chart-container>
          <button data-chart-element>Element 1</button>
          <button data-chart-element>Element 2</button>
          <button data-chart-element>Element 3</button>
        </div>
      </KeyboardNavigation>
    )

    const firstElement = screen.getByText('Element 1')
    const secondElement = screen.getByText('Element 2')
    const thirdElement = screen.getByText('Element 3')

    firstElement.focus()
    expect(firstElement).toHaveFocus()

    // Arrow right should move to next element
    await user.keyboard('{ArrowRight}')
    expect(secondElement).toHaveFocus()

    // Arrow down should also move to next element
    await user.keyboard('{ArrowDown}')
    expect(thirdElement).toHaveFocus()

    // Arrow left should move to previous element
    await user.keyboard('{ArrowLeft}')
    expect(secondElement).toHaveFocus()

    // Arrow up should also move to previous element
    await user.keyboard('{ArrowUp}')
    expect(firstElement).toHaveFocus()
  })

  it('sets initial focus when initialFocus is provided', () => {
    render(
      <KeyboardNavigation initialFocus="#target-button">
        <button>Other button</button>
        <button id="target-button">Target button</button>
      </KeyboardNavigation>
    )

    expect(screen.getByText('Target button')).toHaveFocus()
  })

  it('restores focus when restoreFocus is enabled', () => {
    const initialButton = document.createElement('button')
    initialButton.textContent = 'Initial button'
    document.body.appendChild(initialButton)
    initialButton.focus()

    const { unmount } = render(
      <KeyboardNavigation restoreFocus>
        <button>Test button</button>
      </KeyboardNavigation>
    )

    // Focus should be on the test button initially
    expect(screen.getByText('Test button')).toHaveFocus()

    // After unmounting, focus should be restored
    unmount()
    expect(initialButton).toHaveFocus()

    document.body.removeChild(initialButton)
  })
})

describe('useFocusManagement', () => {
  function TestComponent() {
    const { setFocus, restoreFocus, moveFocus } = useFocusManagement()

    return (
      <div>
        <button
          onClick={() =>
            setFocus(document.getElementById('target') as HTMLElement)
          }
        >
          Set Focus
        </button>
        <button onClick={restoreFocus}>Restore Focus</button>
        <button onClick={() => moveFocus('next')}>Move Next</button>
        <button onClick={() => moveFocus('previous')}>Move Previous</button>
        <button id="target">Target</button>
      </div>
    )
  }

  it('sets focus programmatically', async () => {
    const user = userEvent.setup()
    render(<TestComponent />)

    const setFocusButton = screen.getByText('Set Focus')
    const targetButton = screen.getByText('Target')

    await user.click(setFocusButton)
    expect(targetButton).toHaveFocus()
  })

  it('moves focus to next element', async () => {
    const user = userEvent.setup()
    render(<TestComponent />)

    const moveNextButton = screen.getByText('Move Next')
    const restoreButton = screen.getByText('Restore Focus')

    moveNextButton.focus()
    await user.click(moveNextButton)
    expect(restoreButton).toHaveFocus()
  })

  it('moves focus to previous element', async () => {
    const user = userEvent.setup()
    render(<TestComponent />)

    const movePreviousButton = screen.getByText('Move Previous')
    const moveNextButton = screen.getByText('Move Next')

    movePreviousButton.focus()
    await user.click(movePreviousButton)
    expect(moveNextButton).toHaveFocus()
  })
})

describe('FocusTrap', () => {
  it('traps focus when active', async () => {
    const user = userEvent.setup()

    render(
      <FocusTrap active>
        <button>First</button>
        <button>Second</button>
      </FocusTrap>
    )

    const firstButton = screen.getByText('First')
    const secondButton = screen.getByText('Second')

    firstButton.focus()
    expect(firstButton).toHaveFocus()

    await user.tab()
    expect(secondButton).toHaveFocus()

    await user.tab()
    expect(firstButton).toHaveFocus()
  })

  it('does not trap focus when inactive', async () => {
    const user = userEvent.setup()

    render(
      <div>
        <button>Outside</button>
        <FocusTrap active={false}>
          <button>Inside</button>
        </FocusTrap>
        <button>After</button>
      </div>
    )

    const outsideButton = screen.getByText('Outside')
    const insideButton = screen.getByText('Inside')
    const afterButton = screen.getByText('After')

    outsideButton.focus()
    expect(outsideButton).toHaveFocus()

    await user.tab()
    expect(insideButton).toHaveFocus()

    await user.tab()
    expect(afterButton).toHaveFocus()
  })

  it('calls onEscape when escape key is pressed', async () => {
    const user = userEvent.setup()
    const onEscape = jest.fn()

    render(
      <FocusTrap active onEscape={onEscape}>
        <button>Test</button>
      </FocusTrap>
    )

    const button = screen.getByText('Test')
    button.focus()

    await user.keyboard('{Escape}')
    expect(onEscape).toHaveBeenCalled()
  })

  it('sets initial focus when initialFocus is provided', () => {
    render(
      <FocusTrap active initialFocus="#initial">
        <button>Other</button>
        <button id="initial">Initial</button>
      </FocusTrap>
    )

    expect(screen.getByText('Initial')).toHaveFocus()
  })
})

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  FocusManagement,
  useFocusManagement,
  ModalFocusManager,
  SkipLinks,
} from '../focus-management'

describe('FocusManagement', () => {
  it('renders children correctly', () => {
    render(
      <FocusManagement>
        <div>Test content</div>
      </FocusManagement>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('sets focus on mount when focusOnMount is true', async () => {
    render(
      <FocusManagement focusOnMount>
        <button>First button</button>
        <button>Second button</button>
      </FocusManagement>
    )

    await waitFor(() => {
      expect(screen.getByText('First button')).toHaveFocus()
    })
  })

  it('sets focus using focusSelector', async () => {
    render(
      <FocusManagement focusOnMount focusSelector="#target">
        <button>First button</button>
        <button id="target">Target button</button>
      </FocusManagement>
    )

    await waitFor(() => {
      expect(screen.getByText('Target button')).toHaveFocus()
    })
  })

  it('sets focus when autoFocus is true', async () => {
    render(
      <FocusManagement autoFocus>
        <input placeholder="Test input" />
        <button>Test button</button>
      </FocusManagement>
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Test input')).toHaveFocus()
    })
  })

  it('restores focus when component unmounts', async () => {
    const initialButton = document.createElement('button')
    initialButton.textContent = 'Initial button'
    document.body.appendChild(initialButton)
    initialButton.focus()

    const { unmount } = render(
      <FocusManagement focusOnMount>
        <button>Test button</button>
      </FocusManagement>
    )

    await waitFor(() => {
      expect(screen.getByText('Test button')).toHaveFocus()
    })

    unmount()

    await waitFor(() => {
      expect(initialButton).toHaveFocus()
    })

    document.body.removeChild(initialButton)
  })

  it('ignores disabled elements', async () => {
    render(
      <FocusManagement focusOnMount>
        <button disabled>Disabled button</button>
        <button>Enabled button</button>
      </FocusManagement>
    )

    await waitFor(() => {
      expect(screen.getByText('Enabled button')).toHaveFocus()
    })
  })

  it('ignores hidden elements', async () => {
    render(
      <FocusManagement focusOnMount>
        <button style={{ display: 'none' }}>Hidden button</button>
        <button>Visible button</button>
      </FocusManagement>
    )

    await waitFor(() => {
      expect(screen.getByText('Visible button')).toHaveFocus()
    })
  })
})

describe('useFocusManagement hook', () => {
  function TestComponent() {
    const { pushFocus, popFocus, clearFocusHistory, focusFirst, focusLast } =
      useFocusManagement()

    return (
      <div>
        <button
          onClick={() =>
            pushFocus(document.getElementById('target1') as HTMLElement)
          }
        >
          Push Focus 1
        </button>
        <button
          onClick={() =>
            pushFocus(document.getElementById('target2') as HTMLElement)
          }
        >
          Push Focus 2
        </button>
        <button onClick={popFocus}>Pop Focus</button>
        <button onClick={clearFocusHistory}>Clear History</button>
        <button onClick={() => focusFirst()}>Focus First</button>
        <button onClick={() => focusLast()}>Focus Last</button>
        <button id="target1">Target 1</button>
        <button id="target2">Target 2</button>
      </div>
    )
  }

  it('pushes and pops focus correctly', async () => {
    const user = userEvent.setup()
    render(<TestComponent />)

    const pushButton1 = screen.getByText('Push Focus 1')
    const pushButton2 = screen.getByText('Push Focus 2')
    const popButton = screen.getByText('Pop Focus')
    const target1 = screen.getByText('Target 1')
    const target2 = screen.getByText('Target 2')

    // Push focus to target 1
    await user.click(pushButton1)
    expect(target1).toHaveFocus()

    // Push focus to target 2
    await user.click(pushButton2)
    expect(target2).toHaveFocus()

    // Pop focus should return to target 1
    await user.click(popButton)
    expect(target1).toHaveFocus()

    // Pop focus again should return to push button 2
    await user.click(popButton)
    expect(pushButton2).toHaveFocus()
  })

  it('clears focus history', async () => {
    const user = userEvent.setup()
    render(<TestComponent />)

    const pushButton1 = screen.getByText('Push Focus 1')
    const clearButton = screen.getByText('Clear History')
    const popButton = screen.getByText('Pop Focus')
    const target1 = screen.getByText('Target 1')

    // Push focus to target 1
    await user.click(pushButton1)
    expect(target1).toHaveFocus()

    // Clear history
    await user.click(clearButton)

    // Pop focus should do nothing since history is cleared
    await user.click(popButton)
    expect(clearButton).toHaveFocus() // Should remain on clear button
  })

  it('focuses first and last elements', async () => {
    const user = userEvent.setup()
    render(<TestComponent />)

    const focusFirstButton = screen.getByText('Focus First')
    const focusLastButton = screen.getByText('Focus Last')
    const firstButton = screen.getByText('Push Focus 1')
    const lastButton = screen.getByText('Target 2')

    // Focus first element
    await user.click(focusFirstButton)
    expect(firstButton).toHaveFocus()

    // Focus last element
    await user.click(focusLastButton)
    expect(lastButton).toHaveFocus()
  })
})

describe('ModalFocusManager', () => {
  it('manages focus when modal opens and closes', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()

    const initialButton = document.createElement('button')
    initialButton.textContent = 'Initial button'
    document.body.appendChild(initialButton)
    initialButton.focus()

    const { rerender } = render(
      <ModalFocusManager isOpen={false} onClose={onClose}>
        <button>Modal button</button>
      </ModalFocusManager>
    )

    // Modal should not be rendered when closed
    expect(screen.queryByText('Modal button')).not.toBeInTheDocument()

    // Open modal
    rerender(
      <ModalFocusManager isOpen={true} onClose={onClose}>
        <button>Modal button</button>
      </ModalFocusManager>
    )

    // Modal should be rendered and focused
    await waitFor(() => {
      expect(screen.getByText('Modal button')).toHaveFocus()
    })

    // Close modal
    rerender(
      <ModalFocusManager isOpen={false} onClose={onClose}>
        <button>Modal button</button>
      </ModalFocusManager>
    )

    // Focus should be restored to initial button
    await waitFor(() => {
      expect(initialButton).toHaveFocus()
    })

    document.body.removeChild(initialButton)
  })

  it('calls onClose when escape is pressed', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()

    render(
      <ModalFocusManager isOpen={true} onClose={onClose}>
        <button>Modal button</button>
      </ModalFocusManager>
    )

    const modalButton = screen.getByText('Modal button')
    modalButton.focus()

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('sets initial focus using initialFocus selector', async () => {
    render(
      <ModalFocusManager isOpen={true} initialFocus="#initial">
        <button>Other button</button>
        <button id="initial">Initial button</button>
      </ModalFocusManager>
    )

    await waitFor(() => {
      expect(screen.getByText('Initial button')).toHaveFocus()
    })
  })

  it('sets final focus using finalFocus selector', async () => {
    const finalButton = document.createElement('button')
    finalButton.id = 'final'
    finalButton.textContent = 'Final button'
    document.body.appendChild(finalButton)

    const { rerender } = render(
      <ModalFocusManager isOpen={true} finalFocus="#final">
        <button>Modal button</button>
      </ModalFocusManager>
    )

    // Close modal
    rerender(
      <ModalFocusManager isOpen={false} finalFocus="#final">
        <button>Modal button</button>
      </ModalFocusManager>
    )

    await waitFor(() => {
      expect(finalButton).toHaveFocus()
    })

    document.body.removeChild(finalButton)
  })
})

describe('SkipLinks', () => {
  it('renders skip links correctly', () => {
    const links = [
      { href: '#main', label: 'Skip to main content' },
      { href: '#nav', label: 'Skip to navigation' },
    ]

    render(<SkipLinks links={links} />)

    expect(screen.getByText('Skip to main content')).toBeInTheDocument()
    expect(screen.getByText('Skip to navigation')).toBeInTheDocument()
  })

  it('handles skip link clicks', async () => {
    const user = userEvent.setup()

    // Create target elements
    const mainElement = document.createElement('main')
    mainElement.id = 'main'
    mainElement.tabIndex = -1
    document.body.appendChild(mainElement)

    const links = [{ href: '#main', label: 'Skip to main content' }]

    render(<SkipLinks links={links} />)

    const skipLink = screen.getByText('Skip to main content')

    // Mock scrollIntoView
    const scrollIntoViewMock = jest.fn()
    mainElement.scrollIntoView = scrollIntoViewMock

    await user.click(skipLink)

    expect(mainElement).toHaveFocus()
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' })

    document.body.removeChild(mainElement)
  })

  it('applies custom className', () => {
    const links = [{ href: '#main', label: 'Skip to main' }]

    render(<SkipLinks links={links} className="custom-class" />)

    const container = screen.getByText('Skip to main').closest('.skip-links')
    expect(container).toHaveClass('custom-class')
  })
})

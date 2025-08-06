import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { jest } from '@jest/globals'
import {
  ProgressiveLoader,
  createSkeletonVariant,
  useProgressiveLoading,
} from '../progressive-loader'

// Mock timers
jest.useFakeTimers()

const TestComponent = ({ message }: { message: string }) => (
  <div data-testid="test-component">{message}</div>
)

const customStages = [
  {
    name: 'structure',
    duration: 100,
    skeleton: <div data-testid="structure-skeleton">Loading structure...</div>,
  },
  {
    name: 'content',
    duration: 200,
    skeleton: <div data-testid="content-skeleton">Loading content...</div>,
  },
  {
    name: 'details',
    duration: 150,
    skeleton: <div data-testid="details-skeleton">Loading details...</div>,
  },
]

describe('ProgressiveLoader', () => {
  beforeEach(() => {
    jest.clearAllTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.useFakeTimers()
  })

  it('should show first stage skeleton initially', () => {
    render(
      <ProgressiveLoader stages={customStages}>
        <TestComponent message="Final content" />
      </ProgressiveLoader>
    )

    expect(screen.getByTestId('structure-skeleton')).toBeInTheDocument()
    expect(screen.getByText('Loading structure...')).toBeInTheDocument()
    expect(screen.queryByTestId('test-component')).not.toBeInTheDocument()
  })

  it('should progress through all stages', async () => {
    const onStageComplete = jest.fn()
    const onAllStagesComplete = jest.fn()

    render(
      <ProgressiveLoader
        stages={customStages}
        onStageComplete={onStageComplete}
        onAllStagesComplete={onAllStagesComplete}
      >
        <TestComponent message="Final content" />
      </ProgressiveLoader>
    )

    // Initial stage
    expect(screen.getByTestId('structure-skeleton')).toBeInTheDocument()

    // Progress to stage 1 (content)
    await act(async () => {
      jest.advanceTimersByTime(100)
    })

    await waitFor(() => {
      expect(screen.getByTestId('content-skeleton')).toBeInTheDocument()
    })
    expect(onStageComplete).toHaveBeenCalledWith(1)

    // Progress to stage 2 (details)
    await act(async () => {
      jest.advanceTimersByTime(200)
    })

    await waitFor(() => {
      expect(screen.getByTestId('details-skeleton')).toBeInTheDocument()
    })
    expect(onStageComplete).toHaveBeenCalledWith(2)

    // Complete all stages
    await act(async () => {
      jest.advanceTimersByTime(150)
    })

    await waitFor(() => {
      expect(screen.getByTestId('test-component')).toBeInTheDocument()
    })
    expect(screen.getByText('Final content')).toBeInTheDocument()
    expect(onAllStagesComplete).toHaveBeenCalled()
  })

  it('should apply priority-based timing adjustments', async () => {
    const onStageComplete = jest.fn()

    render(
      <ProgressiveLoader
        stages={customStages}
        priority="critical"
        onStageComplete={onStageComplete}
      >
        <TestComponent message="Critical content" />
      </ProgressiveLoader>
    )

    // Critical priority should have 0.5x multiplier (50ms instead of 100ms)
    act(() => {
      jest.advanceTimersByTime(50)
    })

    await waitFor(() => {
      expect(onStageComplete).toHaveBeenCalledWith(1)
    })
  })

  it('should handle high priority timing', async () => {
    const onStageComplete = jest.fn()

    render(
      <ProgressiveLoader
        stages={customStages}
        priority="high"
        onStageComplete={onStageComplete}
      >
        <TestComponent message="High priority content" />
      </ProgressiveLoader>
    )

    // High priority should have 0.7x multiplier (70ms instead of 100ms)
    act(() => {
      jest.advanceTimersByTime(70)
    })

    await waitFor(() => {
      expect(onStageComplete).toHaveBeenCalledWith(1)
    })
  })

  it('should handle low priority timing', async () => {
    const onStageComplete = jest.fn()

    render(
      <ProgressiveLoader
        stages={customStages}
        priority="low"
        onStageComplete={onStageComplete}
      >
        <TestComponent message="Low priority content" />
      </ProgressiveLoader>
    )

    // Low priority should have 1.3x multiplier (130ms instead of 100ms)
    act(() => {
      jest.advanceTimersByTime(130)
    })

    await waitFor(() => {
      expect(onStageComplete).toHaveBeenCalledWith(1)
    })
  })

  it('should handle stages with delays', async () => {
    const stagesWithDelay = [
      {
        name: 'delayed',
        duration: 100,
        delay: 50,
        skeleton: <div data-testid="delayed-skeleton">Delayed loading...</div>,
      },
    ]

    const onStageComplete = jest.fn()

    render(
      <ProgressiveLoader
        stages={stagesWithDelay}
        onStageComplete={onStageComplete}
      >
        <TestComponent message="Delayed content" />
      </ProgressiveLoader>
    )

    // Should not complete until duration + delay
    act(() => {
      jest.advanceTimersByTime(100)
    })

    expect(onStageComplete).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(50)
    })

    await waitFor(() => {
      expect(screen.getByTestId('test-component')).toBeInTheDocument()
    })
  })

  it('should apply correct CSS classes', () => {
    const { container } = render(
      <ProgressiveLoader
        stages={customStages}
        priority="high"
        className="custom-class"
      >
        <TestComponent message="Content" />
      </ProgressiveLoader>
    )

    const loader = container.firstChild as HTMLElement
    expect(loader).toHaveClass('progressive-loader')
    expect(loader).toHaveClass('progressive-loader-stage-0')
    expect(loader).toHaveClass('progressive-loader-priority-high')
    expect(loader).toHaveClass('custom-class')
  })

  it('should have proper accessibility attributes', () => {
    render(
      <ProgressiveLoader stages={customStages}>
        <TestComponent message="Content" />
      </ProgressiveLoader>
    )

    const loader = screen.getByRole('status')
    expect(loader).toHaveAttribute('aria-label', 'Loading content - stage 1 of 3')
  })
})

describe('createSkeletonVariant', () => {
  it('should create card skeleton variant', () => {
    const skeleton = createSkeletonVariant({ type: 'card', height: 300 })
    const { container } = render(<div>{skeleton}</div>)
    
    expect(container.querySelector('.dashboard-card-skeleton')).toBeInTheDocument()
  })

  it('should create chart skeleton variant', () => {
    const skeleton = createSkeletonVariant({ type: 'chart', height: 400 })
    const { container } = render(<div>{skeleton}</div>)
    
    expect(container.querySelector('.dashboard-card-skeleton')).toBeInTheDocument()
  })

  it('should create table skeleton variant', () => {
    const skeleton = createSkeletonVariant({ 
      type: 'table', 
      rows: 5, 
      columns: 3 
    })
    const { container } = render(<div>{skeleton}</div>)
    
    expect(container.querySelector('.dashboard-card-skeleton')).toBeInTheDocument()
  })

  it('should create metric skeleton variant', () => {
    const skeleton = createSkeletonVariant({ type: 'metric' })
    const { container } = render(<div>{skeleton}</div>)
    
    expect(container.querySelector('.dashboard-card-skeleton')).toBeInTheDocument()
  })

  it('should create custom skeleton variant', () => {
    const customSkeleton = <div data-testid="custom-skeleton">Custom</div>
    const skeleton = createSkeletonVariant({ 
      type: 'custom', 
      customSkeleton 
    })
    const { container } = render(<div>{skeleton}</div>)
    
    expect(container.querySelector('[data-testid="custom-skeleton"]')).toBeInTheDocument()
  })

  it('should fallback to default skeleton for unknown types', () => {
    const skeleton = createSkeletonVariant({ type: 'unknown' as any })
    const { container } = render(<div>{skeleton}</div>)
    
    expect(container.querySelector('.dashboard-card-skeleton')).toBeInTheDocument()
  })
})

describe('useProgressiveLoading', () => {
  const TestHookComponent = ({ 
    stages, 
    options = {} 
  }: { 
    stages: any[], 
    options?: any 
  }) => {
    const { currentStage, isComplete, currentSkeleton, reset } = useProgressiveLoading(stages, options)
    
    return (
      <div>
        <div data-testid="current-stage">{currentStage}</div>
        <div data-testid="is-complete">{isComplete.toString()}</div>
        <div data-testid="current-skeleton">{currentSkeleton}</div>
        <button onClick={reset} data-testid="reset-button">Reset</button>
      </div>
    )
  }

  it('should progress through stages', async () => {
    const onStageComplete = jest.fn()
    const onAllStagesComplete = jest.fn()

    render(
      <TestHookComponent
        stages={customStages}
        options={{
          onStageComplete,
          onAllStagesComplete,
        }}
      />
    )

    expect(screen.getByTestId('current-stage')).toHaveTextContent('0')
    expect(screen.getByTestId('is-complete')).toHaveTextContent('false')

    // Progress through stages
    act(() => {
      jest.advanceTimersByTime(100)
    })

    await waitFor(() => {
      expect(screen.getByTestId('current-stage')).toHaveTextContent('1')
    })
    expect(onStageComplete).toHaveBeenCalledWith(1)

    act(() => {
      jest.advanceTimersByTime(200)
    })

    await waitFor(() => {
      expect(screen.getByTestId('current-stage')).toHaveTextContent('2')
    })

    act(() => {
      jest.advanceTimersByTime(150)
    })

    await waitFor(() => {
      expect(screen.getByTestId('is-complete')).toHaveTextContent('true')
    })
    expect(onAllStagesComplete).toHaveBeenCalled()
  })

  it('should reset loading state', async () => {
    render(<TestHookComponent stages={customStages} />)

    // Progress to completion
    act(() => {
      jest.advanceTimersByTime(450) // Total duration
    })

    await waitFor(() => {
      expect(screen.getByTestId('is-complete')).toHaveTextContent('true')
    })

    // Reset
    act(() => {
      screen.getByTestId('reset-button').click()
    })

    expect(screen.getByTestId('current-stage')).toHaveTextContent('0')
    expect(screen.getByTestId('is-complete')).toHaveTextContent('false')
  })
})
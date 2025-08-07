import React, { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface ProgressiveLoaderProps {
  children: React.ReactNode
  stages?: LoadingStage[]
  className?: string
  onStageComplete?: (stage: number) => void
  onAllStagesComplete?: () => void
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

interface LoadingStage {
  name: string
  duration: number
  skeleton: React.ReactNode
  delay?: number
}

interface SkeletonVariant {
  type: 'card' | 'chart' | 'table' | 'metric' | 'custom'
  height?: number
  rows?: number
  columns?: number
  customSkeleton?: React.ReactNode
}

// Default loading stages for different content types
const DEFAULT_STAGES: LoadingStage[] = [
  {
    name: 'structure',
    duration: 200,
    skeleton: <StructureSkeleton />,
  },
  {
    name: 'content',
    duration: 300,
    skeleton: <ContentSkeleton />,
  },
  {
    name: 'details',
    duration: 200,
    skeleton: <DetailsSkeleton />,
  },
]

function StructureSkeleton() {
  return (
    <Card className="dashboard-card-skeleton">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-32 w-full rounded" />
      </CardContent>
    </Card>
  )
}

function ContentSkeleton() {
  return (
    <Card className="dashboard-card-skeleton">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline space-x-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        <Skeleton className="h-24 w-full rounded" />
      </CardContent>
    </Card>
  )
}

function DetailsSkeleton() {
  return (
    <Card className="dashboard-card-skeleton">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-6 w-6 rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline space-x-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-20 w-full rounded" />
      </CardContent>
    </Card>
  )
}

export function ProgressiveLoader({
  children,
  stages = DEFAULT_STAGES,
  className,
  onStageComplete,
  onAllStagesComplete,
  priority = 'medium',
}: ProgressiveLoaderProps) {
  const [currentStage, setCurrentStage] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  // Priority-based stage duration multiplier
  const getPriorityMultiplier = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 0.5
      case 'high':
        return 0.7
      case 'medium':
        return 1
      case 'low':
        return 1.3
      default:
        return 1
    }
  }

  const progressToNextStage = useCallback(() => {
    if (currentStage < stages.length - 1) {
      const nextStage = currentStage + 1
      setCurrentStage(nextStage)
      onStageComplete?.(nextStage)
    } else if (!isComplete) {
      setIsComplete(true)
      onAllStagesComplete?.()
    }
  }, [
    currentStage,
    stages.length,
    isComplete,
    onStageComplete,
    onAllStagesComplete,
  ])

  useEffect(() => {
    if (isComplete) return

    const stage = stages[currentStage]
    if (!stage) return

    const multiplier = getPriorityMultiplier(priority)
    const duration = stage.duration * multiplier
    const delay = stage.delay || 0

    const timer = setTimeout(() => {
      progressToNextStage()
    }, duration + delay)

    return () => clearTimeout(timer)
  }, [currentStage, stages, priority, progressToNextStage, isComplete])

  if (isComplete) {
    return (
      <div className={cn('progressive-loader-complete', className)}>
        {children}
      </div>
    )
  }

  const currentStageSkeleton = stages[currentStage]?.skeleton || (
    <StructureSkeleton />
  )

  return (
    <div
      className={cn(
        'progressive-loader',
        `progressive-loader-stage-${currentStage}`,
        `progressive-loader-priority-${priority}`,
        className
      )}
      role="status"
      aria-label={`Loading content - stage ${currentStage + 1} of ${stages.length}`}
    >
      {currentStageSkeleton}
    </div>
  )
}

// Skeleton generator for different content types
export function createSkeletonVariant(
  variant: SkeletonVariant
): React.ReactNode {
  switch (variant.type) {
    case 'card':
      return <CardSkeleton height={variant.height} />
    case 'chart':
      return <ChartSkeleton height={variant.height} />
    case 'table':
      return <TableSkeleton rows={variant.rows} columns={variant.columns} />
    case 'metric':
      return <MetricSkeleton />
    case 'custom':
      return variant.customSkeleton || <StructureSkeleton />
    default:
      return <StructureSkeleton />
  }
}

function CardSkeleton({ height = 200 }: { height?: number }) {
  return (
    <Card
      className="dashboard-card-skeleton"
      style={{ minHeight: `${height}px` }}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-32 w-full rounded" />
      </CardContent>
    </Card>
  )
}

function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <Card className="dashboard-card-skeleton">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div
            className="flex justify-between items-end"
            style={{ height: `${height}px` }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className="w-8"
                style={{ height: `${Math.random() * 80 + 20}%` }}
              />
            ))}
          </div>
          <div className="flex justify-center space-x-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TableSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number
  columns?: number
}) {
  return (
    <Card className="dashboard-card-skeleton">
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Table header */}
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
          {/* Table rows */}
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 w-full" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function MetricSkeleton() {
  return (
    <Card className="dashboard-card-skeleton">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline space-x-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for creating custom progressive loading sequences
export function useProgressiveLoading(
  stages: LoadingStage[],
  options: {
    priority?: 'low' | 'medium' | 'high' | 'critical'
    onStageComplete?: (stage: number) => void
    onAllStagesComplete?: () => void
  } = {}
) {
  const [currentStage, setCurrentStage] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const progressToNextStage = useCallback(() => {
    if (currentStage < stages.length - 1) {
      const nextStage = currentStage + 1
      setCurrentStage(nextStage)
      options.onStageComplete?.(nextStage)
    } else if (!isComplete) {
      setIsComplete(true)
      options.onAllStagesComplete?.()
    }
  }, [currentStage, stages.length, isComplete, options])

  const reset = useCallback(() => {
    setCurrentStage(0)
    setIsComplete(false)
  }, [])

  return {
    currentStage,
    isComplete,
    progressToNextStage,
    reset,
    currentSkeleton: stages[currentStage]?.skeleton,
  }
}

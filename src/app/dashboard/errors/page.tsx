'use client'

import React from 'react'
import { ErrorLogViewer } from '@/components/errors/error-log-viewer'
import { ErrorPatterns } from '@/components/errors/error-patterns'
import { SystemHealthIndicators } from '@/components/errors/system-health-indicators'
import { TaskRetryPanel } from '@/components/errors/task-retry-panel'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function ErrorsPage() {
  return (
    <ProtectedRoute requiredResource="errors">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Error Handling & Recovery
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor system errors, detect patterns, and manage recovery
              operations
            </p>
          </div>
        </div>

        {/* System Health Overview */}
        {/* <SystemHealthIndicators /> */}

        {/* Error Patterns and Task Retry */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ErrorPatterns />
          <TaskRetryPanel />
        </div>

        {/* Error Log Viewer */}
        <ErrorLogViewer />
      </div>
    </ProtectedRoute>
  )
}

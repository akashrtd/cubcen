// WebSocket Types for Cubcen Real-time Communication
// Defines event types and data structures for Socket.io integration

export interface ServerToClientEvents {
  // Agent status updates
  'agent:status': (data: AgentStatusUpdate) => void
  'agent:health': (data: AgentHealthUpdate) => void
  'agent:connected': (data: AgentConnectedEvent) => void
  'agent:disconnected': (data: AgentDisconnectedEvent) => void

  // Task progress and completion
  'task:created': (data: TaskCreatedEvent) => void
  'task:started': (data: TaskStartedEvent) => void
  'task:progress': (data: TaskProgressEvent) => void
  'task:completed': (data: TaskCompletedEvent) => void
  'task:failed': (data: TaskFailedEvent) => void
  'task:cancelled': (data: TaskCancelledEvent) => void

  // Error and alert notifications
  'error:agent': (data: AgentErrorEvent) => void
  'error:task': (data: TaskErrorEvent) => void
  'error:platform': (data: PlatformErrorEvent) => void
  'alert:critical': (data: CriticalAlertEvent) => void
  'alert:warning': (data: WarningAlertEvent) => void
  'alert:info': (data: InfoAlertEvent) => void

  // Workflow events
  'workflow:statusChange': (data: WorkflowStatusChangeEvent) => void
  'workflow:progress': (data: WorkflowProgressEvent) => void
  'error:workflow': (data: WorkflowErrorEvent) => void

  // System notifications
  'system:maintenance': (data: MaintenanceEvent) => void
  'system:health': (data: SystemHealthEvent) => void

  // Authentication events
  'auth:token_expired': () => void
  'auth:session_invalid': () => void
}

export interface ClientToServerEvents {
  // Authentication
  'auth:authenticate': (
    token: string,
    callback: (success: boolean, error?: string) => void
  ) => void

  // Subscriptions
  'subscribe:agents': (agentIds?: string[]) => void
  'subscribe:tasks': (taskIds?: string[]) => void
  'subscribe:platforms': (platformIds?: string[]) => void
  'unsubscribe:agents': (agentIds?: string[]) => void
  'unsubscribe:tasks': (taskIds?: string[]) => void
  'unsubscribe:platforms': (platformIds?: string[]) => void

  // Heartbeat
  ping: (callback: (timestamp: number) => void) => void
}

export interface InterServerEvents {
  // For future multi-server setup
  'broadcast:agent_status': (data: AgentStatusUpdate) => void
  'broadcast:task_update': (data: TaskProgressEvent) => void
}

export interface SocketData {
  userId: string
  userRole: string
  subscriptions: {
    agents: Set<string>
    tasks: Set<string>
    platforms: Set<string>
  }
  authenticated: boolean
  connectedAt: Date
}

// Event data interfaces
export interface AgentStatusUpdate {
  agentId: string
  status: 'active' | 'inactive' | 'error' | 'maintenance'
  timestamp: Date
  metadata?: Record<string, unknown>
}

export interface AgentHealthUpdate {
  agentId: string
  health: {
    status: 'healthy' | 'unhealthy' | 'degraded'
    lastCheck: Date
    responseTime?: number
    errorCount?: number
    details?: Record<string, unknown>
  }
}

export interface AgentConnectedEvent {
  agentId: string
  platformId: string
  timestamp: Date
}

export interface AgentDisconnectedEvent {
  agentId: string
  platformId: string
  reason: string
  timestamp: Date
}

export interface TaskCreatedEvent {
  taskId: string
  agentId: string
  type: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  scheduledAt: Date
  createdBy: string
}

export interface TaskStartedEvent {
  taskId: string
  agentId: string
  startedAt: Date
  estimatedDuration?: number
}

export interface TaskProgressEvent {
  taskId: string
  agentId: string
  progress: {
    percentage: number
    currentStep: string
    totalSteps: number
    completedSteps: number
    message?: string
  }
  timestamp: Date
}

export interface TaskCompletedEvent {
  taskId: string
  agentId: string
  completedAt: Date
  duration: number
  result?: Record<string, unknown>
  success: boolean
}

export interface TaskFailedEvent {
  taskId: string
  agentId: string
  failedAt: Date
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  retryCount: number
  willRetry: boolean
}

export interface TaskCancelledEvent {
  taskId: string
  agentId: string
  cancelledAt: Date
  cancelledBy: string
  reason: string
}

export interface AgentErrorEvent {
  agentId: string
  platformId: string
  error: {
    code: string
    message: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    details?: Record<string, unknown>
  }
  timestamp: Date
}

export interface TaskErrorEvent {
  taskId: string
  agentId: string
  error: {
    code: string
    message: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    details?: Record<string, unknown>
  }
  timestamp: Date
}

export interface PlatformErrorEvent {
  platformId: string
  error: {
    code: string
    message: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    details?: Record<string, unknown>
  }
  timestamp: Date
  affectedAgents: string[]
}

export interface CriticalAlertEvent {
  id: string
  title: string
  message: string
  source: 'agent' | 'task' | 'platform' | 'system'
  sourceId: string
  timestamp: Date
  requiresAction: boolean
  actionUrl?: string
}

export interface WarningAlertEvent {
  id: string
  title: string
  message: string
  source: 'agent' | 'task' | 'platform' | 'system'
  sourceId: string
  timestamp: Date
}

export interface InfoAlertEvent {
  id: string
  title: string
  message: string
  source: 'agent' | 'task' | 'platform' | 'system'
  sourceId: string
  timestamp: Date
}

export interface MaintenanceEvent {
  id: string
  title: string
  message: string
  startTime: Date
  endTime: Date
  affectedServices: string[]
}

export interface SystemHealthEvent {
  timestamp: Date
  status: 'healthy' | 'degraded' | 'unhealthy'
  metrics: {
    cpu: number
    memory: number
    activeConnections: number
    activeAgents: number
    runningTasks: number
    errorRate: number
  }
}

export interface WorkflowStatusChangeEvent {
  executionId: string
  status: string
  metadata?: Record<string, unknown>
  timestamp: Date
}

export interface WorkflowProgressEvent {
  executionId: string
  progress: {
    totalSteps: number
    completedSteps: number
    currentStep?: string
    percentage: number
  }
  timestamp: Date
}

export interface WorkflowErrorEvent {
  executionId: string
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  timestamp: Date
}

// Connection status types
export interface ConnectionInfo {
  socketId: string
  userId: string
  userRole: string
  connectedAt: Date
  lastActivity: Date
  subscriptions: {
    agents: string[]
    tasks: string[]
    platforms: string[]
  }
}

// WebSocket authentication result
export interface AuthResult {
  success: boolean
  userId?: string
  userRole?: string
  error?: string
}

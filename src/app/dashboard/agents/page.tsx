import { AgentMonitoringDashboard } from '@/components/agents/agent-monitoring-dashboard'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function AgentsPage() {
  return (
    <ProtectedRoute requiredResource="agents">
      <AgentMonitoringDashboard />
    </ProtectedRoute>
  )
}

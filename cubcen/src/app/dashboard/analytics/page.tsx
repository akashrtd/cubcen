import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          View comprehensive analytics and performance metrics for your AI agents.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Analytics Dashboard
          </CardTitle>
          <CardDescription>
            This page will contain comprehensive analytics and reporting functionality.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">
              Analytics dashboard will be implemented in task 16.
            </p>
            <Badge variant="secondary" className="mt-4 bg-cubcen-secondary text-white">
              Task 16
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckSquare, Plus } from 'lucide-react'

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track task execution across all your agents.
          </p>
        </div>
        <Button className="bg-cubcen-primary hover:bg-cubcen-primary-hover">
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckSquare className="mr-2 h-5 w-5" />
            Task Management
          </CardTitle>
          <CardDescription>
            This page will contain the kanban board for task visualization as implemented in task 15.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">
              Kanban board for task management will be implemented in the next task.
            </p>
            <Badge variant="secondary" className="mt-4 bg-cubcen-secondary text-white">
              Task 15
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
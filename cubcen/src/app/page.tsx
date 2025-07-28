import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-cubcen-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Cubcen</h1>
            </div>
            <Badge variant="secondary" className="bg-cubcen-secondary text-white">
              MVP
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            AI Agent Management Platform
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Centralized platform to manage, monitor, and orchestrate AI agents from various automation platforms including n8n, Make.com, and more.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-cubcen-primary rounded"></div>
                <span>Multi-Platform Integration</span>
              </CardTitle>
              <CardDescription>
                Connect and manage AI agents from n8n, Make.com, Zapier, and other automation platforms
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-cubcen-secondary rounded"></div>
                <span>Real-time Monitoring</span>
              </CardTitle>
              <CardDescription>
                Monitor agent status, track progress, and receive instant alerts for critical events
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-cubcen-primary-light rounded"></div>
                <span>Task Scheduling</span>
              </CardTitle>
              <CardDescription>
                Schedule and automate workflows with advanced retry logic and error handling
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Ready to streamline your AI agent management?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full bg-cubcen-primary hover:bg-cubcen-primary-hover">
                  Launch Dashboard
                </Button>
                <Button variant="outline" className="w-full">
                  View Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 Cubcen. AI Agent Management Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
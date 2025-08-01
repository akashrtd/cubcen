"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentList = AgentList;
const react_1 = require("react");
const badge_1 = require("@/components/ui/badge");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const input_1 = require("@/components/ui/input");
const select_1 = require("@/components/ui/select");
const table_1 = require("@/components/ui/table");
const progress_1 = require("@/components/ui/progress");
const skeleton_1 = require("@/components/ui/skeleton");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
const statusConfig = {
    ACTIVE: {
        label: 'Active',
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        icon: lucide_react_1.CheckCircle,
        description: 'Agent is running normally'
    },
    INACTIVE: {
        label: 'Inactive',
        color: 'bg-gray-500',
        textColor: 'text-gray-700',
        bgColor: 'bg-gray-50',
        icon: lucide_react_1.Clock,
        description: 'Agent is not currently active'
    },
    ERROR: {
        label: 'Error',
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        icon: lucide_react_1.AlertCircle,
        description: 'Agent has encountered an error'
    },
    MAINTENANCE: {
        label: 'Maintenance',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        icon: lucide_react_1.Wrench,
        description: 'Agent is under maintenance'
    }
};
const healthConfig = {
    healthy: {
        label: 'Healthy',
        color: 'bg-cubcen-primary',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50'
    },
    degraded: {
        label: 'Degraded',
        color: 'bg-cubcen-secondary',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50'
    },
    unhealthy: {
        label: 'Unhealthy',
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50'
    }
};
const platformConfig = {
    N8N: {
        label: 'n8n',
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50'
    },
    MAKE: {
        label: 'Make.com',
        color: 'bg-purple-500',
        textColor: 'text-purple-700',
        bgColor: 'bg-purple-50'
    },
    ZAPIER: {
        label: 'Zapier',
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-50'
    }
};
function AgentList({ agents, loading = false, onRefresh, onViewAgent, onConfigureAgent, className }) {
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [statusFilter, setStatusFilter] = (0, react_1.useState)('all');
    const [platformFilter, setPlatformFilter] = (0, react_1.useState)('all');
    const [healthFilter, setHealthFilter] = (0, react_1.useState)('all');
    const [sortBy, setSortBy] = (0, react_1.useState)('name');
    const [sortOrder, setSortOrder] = (0, react_1.useState)('asc');
    const filteredAndSortedAgents = agents
        .filter(agent => {
        const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.platform.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
        const matchesPlatform = platformFilter === 'all' || agent.platform.type === platformFilter;
        const matchesHealth = healthFilter === 'all' || agent.healthStatus.status === healthFilter;
        return matchesSearch && matchesStatus && matchesPlatform && matchesHealth;
    })
        .sort((a, b) => {
        let aValue;
        let bValue;
        switch (sortBy) {
            case 'name':
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
            case 'status':
                aValue = a.status;
                bValue = b.status;
                break;
            case 'platform':
                aValue = a.platform.name.toLowerCase();
                bValue = b.platform.name.toLowerCase();
                break;
            case 'health':
                aValue = a.healthStatus.status;
                bValue = b.healthStatus.status;
                break;
            case 'lastCheck':
                aValue = new Date(a.healthStatus.lastCheck).getTime();
                bValue = new Date(b.healthStatus.lastCheck).getTime();
                break;
            default:
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
        }
        if (aValue < bValue)
            return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue)
            return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        }
        else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };
    const formatLastCheck = (date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1)
            return 'Just now';
        if (minutes < 60)
            return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24)
            return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };
    const getHealthProgress = (health) => {
        if (health.status === 'healthy')
            return 100;
        if (health.status === 'degraded')
            return 60;
        return 20;
    };
    if (loading) {
        return (<card_1.Card className={className}>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center">
            <lucide_react_1.Bot className="mr-2 h-5 w-5"/>
            Agent Monitoring
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row gap-4">
              <skeleton_1.Skeleton className="h-9 flex-1"/>
              <skeleton_1.Skeleton className="h-9 w-32"/>
              <skeleton_1.Skeleton className="h-9 w-32"/>
              <skeleton_1.Skeleton className="h-9 w-32"/>
            </div>
            
            
            <div className="space-y-2">
              <skeleton_1.Skeleton className="h-10 w-full"/>
              {Array.from({ length: 5 }).map((_, i) => (<skeleton_1.Skeleton key={i} className="h-16 w-full"/>))}
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<card_1.Card className={className}>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <card_1.CardTitle className="flex items-center">
            <lucide_react_1.Bot className="mr-2 h-5 w-5 text-cubcen-primary"/>
            Agent Monitoring
            <badge_1.Badge variant="secondary" className="ml-2 bg-cubcen-secondary text-white">
              {filteredAndSortedAgents.length} agents
            </badge_1.Badge>
          </card_1.CardTitle>
          <button_1.Button variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="hover:bg-cubcen-primary hover:text-white">
            <lucide_react_1.RefreshCw className={(0, utils_1.cn)("h-4 w-4 mr-2", loading && "animate-spin")}/>
            Refresh
          </button_1.Button>
        </div>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
              <input_1.Input placeholder="Search agents..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
            </div>
            
            <select_1.Select value={statusFilter} onValueChange={setStatusFilter}>
              <select_1.SelectTrigger className="w-full sm:w-32" aria-label="Filter by status">
                <lucide_react_1.Filter className="h-4 w-4 mr-2"/>
                <select_1.SelectValue placeholder="Status"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">All Status</select_1.SelectItem>
                <select_1.SelectItem value="ACTIVE">Active</select_1.SelectItem>
                <select_1.SelectItem value="INACTIVE">Inactive</select_1.SelectItem>
                <select_1.SelectItem value="ERROR">Error</select_1.SelectItem>
                <select_1.SelectItem value="MAINTENANCE">Maintenance</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
            
            <select_1.Select value={platformFilter} onValueChange={setPlatformFilter}>
              <select_1.SelectTrigger className="w-full sm:w-32" aria-label="Filter by platform">
                <select_1.SelectValue placeholder="Platform"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">All Platforms</select_1.SelectItem>
                <select_1.SelectItem value="N8N">n8n</select_1.SelectItem>
                <select_1.SelectItem value="MAKE">Make.com</select_1.SelectItem>
                <select_1.SelectItem value="ZAPIER">Zapier</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
            
            <select_1.Select value={healthFilter} onValueChange={setHealthFilter}>
              <select_1.SelectTrigger className="w-full sm:w-32" aria-label="Filter by health">
                <lucide_react_1.Activity className="h-4 w-4 mr-2"/>
                <select_1.SelectValue placeholder="Health"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">All Health</select_1.SelectItem>
                <select_1.SelectItem value="healthy">Healthy</select_1.SelectItem>
                <select_1.SelectItem value="degraded">Degraded</select_1.SelectItem>
                <select_1.SelectItem value="unhealthy">Unhealthy</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          
          <div className="rounded-md border">
            <table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('name')}>
                    <div className="flex items-center">
                      Agent Name
                      {sortBy === 'name' && (<span className="ml-1 text-cubcen-primary">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>)}
                    </div>
                  </table_1.TableHead>
                  <table_1.TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('platform')}>
                    <div className="flex items-center">
                      Platform
                      {sortBy === 'platform' && (<span className="ml-1 text-cubcen-primary">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>)}
                    </div>
                  </table_1.TableHead>
                  <table_1.TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('status')}>
                    <div className="flex items-center">
                      Status
                      {sortBy === 'status' && (<span className="ml-1 text-cubcen-primary">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>)}
                    </div>
                  </table_1.TableHead>
                  <table_1.TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('health')}>
                    <div className="flex items-center">
                      Health
                      {sortBy === 'health' && (<span className="ml-1 text-cubcen-primary">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>)}
                    </div>
                  </table_1.TableHead>
                  <table_1.TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('lastCheck')}>
                    <div className="flex items-center">
                      Last Check
                      {sortBy === 'lastCheck' && (<span className="ml-1 text-cubcen-primary">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>)}
                    </div>
                  </table_1.TableHead>
                  <table_1.TableHead>Actions</table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {filteredAndSortedAgents.length === 0 ? (<table_1.TableRow>
                    <table_1.TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <lucide_react_1.Bot className="h-12 w-12 text-muted-foreground mb-2"/>
                        <p className="text-muted-foreground">
                          {searchTerm || statusFilter !== 'all' || platformFilter !== 'all' || healthFilter !== 'all'
                ? 'No agents match your filters'
                : 'No agents found'}
                        </p>
                      </div>
                    </table_1.TableCell>
                  </table_1.TableRow>) : (filteredAndSortedAgents.map((agent) => {
            const statusInfo = statusConfig[agent.status];
            const healthInfo = healthConfig[agent.healthStatus.status];
            const platformInfo = platformConfig[agent.platform.type];
            const StatusIcon = statusInfo.icon;
            return (<table_1.TableRow key={agent.id} className="hover:bg-muted/50">
                        <table_1.TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium text-foreground">{agent.name}</div>
                            {agent.description && (<div className="text-sm text-muted-foreground truncate max-w-xs">
                                {agent.description}
                              </div>)}
                            <div className="flex flex-wrap gap-1 mt-1">
                              {agent.capabilities.slice(0, 2).map((capability) => (<badge_1.Badge key={capability} variant="outline" className="text-xs bg-cubcen-secondary-light text-cubcen-secondary-hover">
                                  {capability}
                                </badge_1.Badge>))}
                              {agent.capabilities.length > 2 && (<badge_1.Badge variant="outline" className="text-xs">
                                  +{agent.capabilities.length - 2}
                                </badge_1.Badge>)}
                            </div>
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <badge_1.Badge className={(0, utils_1.cn)("text-white", platformInfo.color)}>
                            {platformInfo.label}
                          </badge_1.Badge>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <div className="flex items-center space-x-2">
                            <StatusIcon className={(0, utils_1.cn)("h-4 w-4", statusInfo.textColor)}/>
                            <badge_1.Badge variant="outline" className={(0, utils_1.cn)(statusInfo.textColor, statusInfo.bgColor, "border-current")}>
                              {statusInfo.label}
                            </badge_1.Badge>
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <badge_1.Badge className={(0, utils_1.cn)("text-white text-xs", healthInfo.color)}>
                                {healthInfo.label}
                              </badge_1.Badge>
                              {agent.healthStatus.responseTime && (<span className="text-xs text-muted-foreground">
                                  {agent.healthStatus.responseTime}ms
                                </span>)}
                            </div>
                            <progress_1.Progress value={getHealthProgress(agent.healthStatus)} className="h-1 w-16"/>
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatLastCheck(agent.healthStatus.lastCheck)}
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <div className="flex items-center space-x-2">
                            <button_1.Button variant="ghost" size="sm" onClick={() => onViewAgent?.(agent)} className="hover:bg-cubcen-primary hover:text-white">
                              <lucide_react_1.Eye className="h-4 w-4"/>
                            </button_1.Button>
                            <button_1.Button variant="ghost" size="sm" onClick={() => onConfigureAgent?.(agent)} className="hover:bg-cubcen-secondary hover:text-white">
                              <lucide_react_1.Settings className="h-4 w-4"/>
                            </button_1.Button>
                          </div>
                        </table_1.TableCell>
                      </table_1.TableRow>);
        }))}
              </table_1.TableBody>
            </table_1.Table>
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
//# sourceMappingURL=agent-list.jsx.map
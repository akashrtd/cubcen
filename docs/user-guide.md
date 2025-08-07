# Cubcen User Guide

Welcome to Cubcen, your centralized AI agent management platform! This guide will help you get started with managing, monitoring, and orchestrating AI agents across multiple automation platforms.

## Table of Contents

- [Getting Started](#getting-started)
- [Dashboard Overview](#dashboard-overview)
- [Managing Agents](#managing-agents)
- [Task Management](#task-management)
- [Analytics and Reporting](#analytics-and-reporting)
- [Platform Integrations](#platform-integrations)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Getting Started

### First Login

1. **Access Cubcen**: Navigate to your Cubcen instance URL
2. **Login**: Use your provided credentials to log in
3. **Dashboard**: You'll be taken to the main dashboard showing your agent overview

### Initial Setup

#### 1. Connect Your First Platform

Before you can manage agents, you need to connect at least one automation platform:

1. Go to **Settings** → **Platform Connections**
2. Click **Add Platform**
3. Choose your platform type (n8n, Make.com, etc.)
4. Enter your platform credentials:
   - **n8n**: Base URL and API Key
   - **Make.com**: Client ID and Client Secret
5. Click **Test Connection** to verify
6. Save the configuration

#### 2. Agent Discovery

Once connected, Cubcen will automatically discover your agents:

1. Go to **Agents** → **Discovery**
2. Click **Refresh Discovery** to scan for new agents
3. Review discovered agents and their metadata
4. Enable monitoring for agents you want to track

#### 3. Set Up Notifications

Configure how you want to receive alerts:

1. Go to **Settings** → **Notifications**
2. Configure email settings (SMTP)
3. Set up Slack integration (optional)
4. Choose notification preferences for different event types

## Dashboard Overview

The Cubcen dashboard provides a comprehensive view of your AI agent ecosystem with enhanced navigation and functionality:

### Navigation Menu

The dashboard includes the following main sections:

- **Dashboard**: Main overview with key metrics and system status
- **Agents**: Manage and monitor your AI agents
- **Tasks**: Kanban-style task management board
- **Analytics**: Comprehensive performance analytics and reporting
- **Errors**: Error monitoring and management system
- **Platforms**: Automation platform connection management
- **Users**: User account and permission management (Admin only)
- **Settings**: Personal preferences and account settings

### Key Metrics Cards

- **Active Agents**: Number of currently running agents
- **Tasks Today**: Tasks executed in the last 24 hours
- **Success Rate**: Percentage of successful task executions
- **Error Rate**: Percentage of failed executions
- **Platform Health**: Status of connected automation platforms

### Real-Time Status

- **Agent Status Grid**: Visual representation of all agents with color-coded status
- **Recent Activity**: Live feed of agent activities and status changes
- **System Health**: Overall platform health indicators
- **Error Alerts**: Real-time error notifications and alerts

### Quick Actions

- **Create Task**: Schedule a new task for execution
- **View Errors**: Jump to error management interface
- **Generate Report**: Create analytics reports
- **Platform Status**: Check external platform connectivity
- **User Management**: Manage user accounts and permissions (Admin only)

## Managing Agents

### Agent List View

The agent list provides a comprehensive overview of all your agents:

**Columns:**

- **Name**: Agent display name
- **Platform**: Source platform (n8n, Make.com, etc.)
- **Status**: Current operational status
- **Last Activity**: When the agent last executed
- **Success Rate**: Historical success percentage
- **Actions**: Quick action buttons

**Status Indicators:**

- 🟢 **Active**: Agent is running and healthy
- 🟡 **Idle**: Agent is available but not currently executing
- 🔴 **Error**: Agent has encountered an error
- ⚫ **Offline**: Agent is not responding
- 🔵 **Maintenance**: Agent is in maintenance mode

### Agent Details

Click on any agent to view detailed information:

#### Overview Tab

- Agent metadata and configuration
- Current status and health metrics
- Platform-specific information
- Recent execution history

#### Performance Tab

- Execution time trends
- Success/failure rates over time
- Resource usage metrics
- Performance comparisons

#### Configuration Tab

- Agent settings and parameters
- Environment variables
- Scheduling configuration
- Notification preferences

#### Logs Tab

- Real-time log streaming
- Historical log search
- Error log filtering
- Export log data

### Agent Actions

**Start/Stop Agent**

- Manually start or stop agent execution
- Useful for maintenance or troubleshooting

**Restart Agent**

- Restart a problematic agent
- Clears temporary issues and resets state

**Edit Configuration**

- Modify agent settings
- Update scheduling parameters
- Change notification preferences

**View Logs**

- Access detailed execution logs
- Filter by time range or log level
- Export logs for analysis

## Task Management

### Kanban Board View

Cubcen provides a visual kanban board for task management:

**Columns:**

- **Pending**: Tasks waiting to be executed
- **In Progress**: Currently executing tasks
- **Completed**: Successfully finished tasks
- **Failed**: Tasks that encountered errors

### Task Cards

Each task card displays:

- Task name and description
- Assigned agent
- Priority level (Low, Medium, High, Critical)
- Scheduled execution time
- Current status and progress

### Creating Tasks

1. Click **Create Task** button
2. Fill in task details:
   - **Name**: Descriptive task name
   - **Agent**: Select target agent
   - **Priority**: Set execution priority
   - **Schedule**: Choose when to execute
   - **Parameters**: Provide task-specific data
3. Click **Create** to schedule the task

### Task Scheduling Options

**Immediate Execution**

- Task runs as soon as possible
- Useful for urgent operations

**Scheduled Execution**

- Set specific date and time
- Good for planned maintenance or reports

**Recurring Tasks**

- Set up repeating schedules
- Options: Hourly, Daily, Weekly, Monthly
- Cron expression support for complex schedules

### Task Monitoring

**Real-Time Updates**

- Task status updates automatically
- Progress indicators show completion percentage
- Live log streaming during execution

**Task History**

- View all historical task executions
- Filter by agent, status, or date range
- Export task data for analysis

## Analytics and Reporting

### Enhanced Analytics Dashboard

The completely redesigned analytics dashboard provides comprehensive insights into your agent ecosystem:

#### Key Performance Indicators (KPIs)

- **Total Executions**: Number of tasks executed with trend indicators
- **Average Response Time**: Mean execution duration with performance targets
- **Success Rate**: Percentage of successful executions with historical comparison
- **Error Rate**: Percentage of failed executions with severity breakdown
- **Uptime**: Agent availability percentage with SLA tracking
- **Platform Health**: Overall health status of connected platforms

#### Interactive Performance Charts

- **Execution Trends**: Task volume over time with customizable date ranges
- **Response Time Trends**: Performance changes with threshold alerts
- **Success Rate Trends**: Reliability metrics with goal tracking
- **Agent Comparison**: Relative performance analysis with benchmarking
- **Error Distribution**: Error types and frequency analysis
- **Resource Usage**: System resource consumption patterns

#### Advanced Error Analysis

- **Error Patterns**: Common failure types with root cause analysis
- **Error Frequency**: Error occurrence rates with trend analysis
- **Error Resolution Time**: Time to fix issues with SLA tracking
- **Top Error Sources**: Most problematic agents with impact assessment
- **Error Correlation**: Relationship between errors and system events
- **Predictive Alerts**: AI-powered error prediction and prevention

#### Real-Time Monitoring

- **Live Metrics**: Real-time KPI updates with auto-refresh
- **Alert System**: Configurable alerts for threshold breaches
- **Performance Notifications**: Instant notifications for critical issues
- **Dashboard Customization**: Personalized dashboard layouts

### Custom Reports

Create tailored reports for your needs:

1. Go to **Analytics** → **Reports**
2. Click **Create Report**
3. Configure report parameters:
   - **Date Range**: Select time period
   - **Agents**: Choose specific agents or all
   - **Metrics**: Select KPIs to include
   - **Format**: Choose output format (PDF, Excel, CSV)
4. Generate and download report

### Scheduled Reports

Set up automatic report generation:

1. Create a custom report
2. Click **Schedule Report**
3. Configure schedule:
   - **Frequency**: Daily, Weekly, Monthly
   - **Recipients**: Email addresses
   - **Format**: Report format preference
4. Save scheduled report

## Platform Management

### Enhanced Platform Management Interface

The new platform management system provides comprehensive control over your automation platform connections:

#### Platform List View

- **Connection Status**: Real-time status indicators for all platforms
- **Health Monitoring**: Continuous health checks with response time tracking
- **Agent Count**: Number of agents discovered on each platform
- **Last Sync**: When the platform was last synchronized
- **Platform Type**: Visual badges for different platform types
- **Quick Actions**: Edit, test, delete, and refresh operations

#### Platform Configuration

**Adding New Platforms:**

1. Navigate to **Platforms** in the dashboard
2. Click **Add Platform** button
3. Select platform type (n8n, Make.com, Zapier)
4. Enter platform details:
   - **Name**: Descriptive name for the platform
   - **Base URL**: Platform instance URL
   - **Authentication**: API keys or OAuth credentials
5. Click **Test Connection** to verify connectivity
6. Save the configuration

**Connection Testing:**

- Real-time connection testing with detailed feedback
- Response time measurement
- Platform version detection
- Capability discovery
- Agent count verification

### n8n Integration

**Setup Requirements:**

- n8n instance with API access enabled
- API key with appropriate permissions
- Network connectivity between Cubcen and n8n

**Enhanced Configuration:**

1. In n8n, generate an API key with workflow and execution permissions
2. In Cubcen, navigate to **Platforms** → **Add Platform**
3. Select **n8n** as platform type
4. Enter configuration:
   - **Name**: "Production n8n" (or your preferred name)
   - **Base URL**: Your n8n instance URL
   - **API Key**: Generated API key
5. Click **Test Connection** to verify
6. Review discovered capabilities and agent count
7. Save the configuration

**Supported Features:**

- Workflow discovery and monitoring
- Real-time execution status tracking
- Comprehensive error reporting and alerting
- Performance metrics collection
- Health monitoring with automatic reconnection
- Version compatibility checking

### Make.com Integration

**Setup Requirements:**

- Make.com account with API access
- OAuth application credentials
- Appropriate scenario permissions

**Enhanced Configuration:**

1. Create OAuth app in Make.com developer console
2. In Cubcen, navigate to **Platforms** → **Add Platform**
3. Select **Make.com** as platform type
4. Enter OAuth credentials:
   - **Client ID**: From Make.com OAuth app
   - **Client Secret**: From Make.com OAuth app
5. Complete OAuth authorization flow
6. Test connection and verify permissions
7. Save the configuration

**Supported Features:**

- Scenario discovery and monitoring
- Execution tracking and detailed logging
- Resource usage monitoring
- Advanced error handling and recovery
- Webhook integration for real-time updates
- Rate limit management

### Zapier Integration

**Setup Requirements:**

- Zapier account with API access
- Private app credentials
- Appropriate Zap permissions

**Configuration Steps:**

1. Create private app in Zapier developer platform
2. In Cubcen, navigate to **Platforms** → **Add Platform**
3. Select **Zapier** as platform type
4. Enter app credentials and complete authentication
5. Test connection and verify Zap access
6. Save the configuration

**Supported Features:**

- Zap discovery and monitoring
- Execution tracking
- Error reporting
- Performance analytics

### Platform Health Monitoring

**Health Indicators:**

- 🟢 **Healthy**: Platform is responding normally
- 🟡 **Degraded**: Platform is responding but with issues
- 🔴 **Unhealthy**: Platform is not responding or has critical errors
- ⚫ **Offline**: Platform is unreachable

**Monitoring Features:**

- Continuous health checks every 5 minutes
- Response time tracking
- Version monitoring
- Automatic reconnection attempts
- Alert notifications for status changes
- Historical health data

### Platform Management Actions

**Edit Platform:**

- Update connection details
- Modify authentication credentials
- Change platform name or description
- Update health check intervals

**Delete Platform:**

- Confirmation dialog with impact assessment
- Shows number of connected agents
- Audit trail logging
- Graceful disconnection process

**Refresh Platform:**

- Force synchronization with platform
- Rediscover agents and capabilities
- Update health status
- Refresh connection credentials

### Adding New Platforms

Cubcen supports a plugin architecture for adding new platforms:

1. **Request New Platform**: Contact support with platform details
2. **API Documentation**: Provide comprehensive API documentation
3. **Testing Environment**: Provide test instance access
4. **Integration Development**: Our team develops the integration
5. **Beta Testing**: Participate in integration testing
6. **Production Deployment**: New platform support is deployed

**Currently Supported Platforms:**

- n8n (Full support)
- Make.com (Full support)
- Zapier (Full support)
- Custom REST APIs (Beta)

**Planned Platform Support:**

- Microsoft Power Automate
- Integromat
- Workato
- Tray.io

## User Management

### User Management Interface (Admin Only)

The user management system provides comprehensive control over user accounts, roles, and permissions:

#### User List View

- **User Information**: Name, email, role, and status for all users
- **Activity Statistics**: Login count, tasks created, agents managed
- **Status Indicators**: Active, inactive, or suspended status
- **Role Badges**: Visual indicators for user roles (Admin, Operator, Viewer)
- **Last Login**: When each user last accessed the system
- **Quick Actions**: Edit, suspend, reactivate, or delete users

#### User Roles and Permissions

**Administrator (ADMIN):**

- Full system access
- User management capabilities
- Platform configuration
- System settings management
- Analytics and reporting access
- Audit log access

**Operator (OPERATOR):**

- Agent management
- Task creation and monitoring
- Analytics viewing
- Platform status monitoring
- Limited settings access

**Viewer (VIEWER):**

- Read-only access to dashboards
- View agent status
- View task status
- Basic analytics access
- No configuration capabilities

#### Creating Users

1. Navigate to **Users** in the dashboard (Admin only)
2. Click **Create User** or **Invite User**
3. Enter user details:
   - **Name**: Full name of the user
   - **Email**: Valid email address
   - **Role**: Select appropriate role
   - **Password**: Set initial password (for direct creation)
4. Choose to send invitation email
5. Save the user account

**User Creation Options:**

- **Direct Creation**: Create user with immediate access
- **Email Invitation**: Send invitation email with setup link
- **Bulk Import**: Import multiple users from CSV file

#### Managing Users

**Edit User:**

- Update user information
- Change user role
- Modify permissions
- Update contact details

**Suspend/Reactivate User:**

- Temporarily disable user access
- Maintain audit trail
- Preserve user data and settings
- Reactivate when needed

**Delete User:**

- Permanently remove user account
- Transfer ownership of created resources
- Complete audit trail logging
- Confirmation required

#### User Activity Monitoring

**Activity Statistics:**

- Total login count
- Last login timestamp
- Tasks created and managed
- Agents accessed
- Platform interactions

**Audit Trail:**

- All user actions logged
- Login/logout events
- Permission changes
- Resource access
- Administrative actions

### Settings Management

#### Personal Settings

**Profile Settings:**

- Update personal information
- Change display name
- Upload profile avatar
- Update contact preferences
- Set timezone and language

**Password Management:**

- Change account password
- Password strength requirements
- Password history tracking
- Forced password reset options

#### Notification Preferences

**Notification Channels:**

- **Email Notifications**: Configure email alerts
- **Push Notifications**: Browser and mobile push alerts
- **Slack Integration**: Direct Slack notifications
- **Webhook Notifications**: Custom webhook endpoints

**Notification Types:**

- **Agent Alerts**: Agent status changes and errors
- **Task Updates**: Task completion and failure notifications
- **System Notifications**: System maintenance and updates
- **Security Alerts**: Login attempts and security events

**Notification Frequency:**

- **Immediate**: Real-time notifications
- **Hourly**: Batched hourly summaries
- **Daily**: Daily digest emails
- **Weekly**: Weekly summary reports

#### Security Settings

**Two-Factor Authentication (2FA):**

- Enable/disable 2FA
- QR code setup for authenticator apps
- Backup code generation
- Recovery options

**Active Sessions:**

- View all active login sessions
- Session details (device, location, browser)
- Terminate individual sessions
- Terminate all sessions except current

**Security Audit Log:**

- Login/logout events
- Password changes
- 2FA setup/changes
- Suspicious activity alerts
- IP address tracking

**Account Security:**

- Password change history
- Failed login attempt tracking
- Account lockout settings
- Security question setup

#### Dashboard Preferences

**Theme Settings:**

- Light/dark mode toggle
- System theme following
- Custom color schemes
- High contrast options

**Dashboard Layout:**

- Default page on login
- Widget arrangements
- Refresh intervals
- Data display preferences

**Accessibility Options:**

- Screen reader compatibility
- Keyboard navigation
- Font size adjustments
- Color blind friendly options

## Error Management

### Enhanced Error Monitoring System

The new error management system provides comprehensive error tracking and resolution:

#### Error Dashboard

- **Error Overview**: Total errors, error rate trends, resolution status
- **Error Categories**: Categorized by severity and type
- **Recent Errors**: Latest errors with quick action buttons
- **Error Patterns**: Common error types and their frequency
- **Resolution Metrics**: Average resolution time and success rates

#### Error Details

**Error Information:**

- Error message and stack trace
- Timestamp and frequency
- Affected users and sessions
- Browser and system information
- Page or component where error occurred

**User Reports:**

- User-submitted error descriptions
- Reproduction steps
- Expected vs actual behavior
- Screenshots and additional context

#### Error Resolution

**Admin Actions:**

- Mark errors as resolved
- Add resolution notes
- Assign errors to team members
- Set error priority levels
- Create bug reports

**Automatic Features:**

- Error grouping and deduplication
- Severity classification
- Impact assessment
- Notification routing
- Integration with issue tracking

## Troubleshooting

### Common Issues

#### Agent Not Responding

**Symptoms:**

- Agent shows as offline
- No recent activity logs
- Tasks fail to execute

**Solutions:**

1. Check platform connectivity
2. Verify agent configuration
3. Restart the agent
4. Check platform-specific logs

#### High Error Rates

**Symptoms:**

- Multiple task failures
- Error alerts increasing
- Performance degradation

**Solutions:**

1. Review error logs for patterns
2. Check agent resource usage
3. Verify input data quality
4. Update agent configuration

#### Slow Performance

**Symptoms:**

- Tasks taking longer than usual
- High response times
- System feels sluggish

**Solutions:**

1. Check system resource usage
2. Review database performance
3. Analyze network connectivity
4. Consider scaling resources

### Getting Help

#### Built-in Help

- **Help Center**: Access from the main menu
- **Tooltips**: Hover over UI elements for quick help
- **Documentation**: Links to relevant guides

#### Support Channels

- **Email Support**: support@cubcen.com
- **Knowledge Base**: Online documentation and FAQs
- **Community Forum**: User community discussions

#### Diagnostic Information

When contacting support, provide:

- Cubcen version number
- Browser and version
- Error messages and screenshots
- Steps to reproduce the issue
- Agent and platform details

## Best Practices

### Agent Management

**Organization**

- Use descriptive agent names
- Group related agents with tags
- Maintain consistent naming conventions
- Document agent purposes and configurations

**Monitoring**

- Set up appropriate alerts for critical agents
- Monitor performance trends regularly
- Review error patterns weekly
- Keep agent configurations up to date

**Maintenance**

- Schedule regular agent health checks
- Update platform integrations as needed
- Archive unused agents
- Backup important configurations

### Task Management

**Scheduling**

- Avoid overlapping resource-intensive tasks
- Use appropriate priority levels
- Consider time zone differences
- Plan for peak usage periods

**Error Handling**

- Set up retry policies for transient failures
- Configure appropriate timeout values
- Implement fallback procedures
- Monitor error patterns for improvements

### Security

**Access Control**

- Use strong passwords and enable 2FA
- Regularly review user permissions
- Audit access logs periodically
- Follow principle of least privilege

**Data Protection**

- Avoid storing sensitive data in task parameters
- Use environment variables for secrets
- Regularly backup configurations
- Monitor for unauthorized access

### Performance Optimization

**Resource Management**

- Monitor system resource usage
- Scale infrastructure as needed
- Optimize database queries
- Use caching where appropriate

**Network Optimization**

- Ensure reliable network connectivity
- Monitor API rate limits
- Implement connection pooling
- Use compression for large data transfers

## Advanced Features

### Workflow Orchestration

Create complex workflows by chaining multiple agents:

1. Go to **Workflows** → **Create Workflow**
2. Add workflow steps:
   - Select agents for each step
   - Define data flow between steps
   - Set conditional logic
   - Configure error handling
3. Test workflow execution
4. Deploy to production

### Custom Dashboards

Create personalized dashboards:

1. Go to **Dashboards** → **Create Dashboard**
2. Add widgets:
   - KPI cards
   - Charts and graphs
   - Agent status grids
   - Custom metrics
3. Arrange layout
4. Save and share dashboard

### API Integration

Integrate Cubcen with your existing systems:

1. **API Documentation**: Available at `/api-docs`
2. **Authentication**: Use JWT tokens for API access
3. **Rate Limits**: Respect API rate limiting
4. **SDKs**: Use provided client libraries

### Automation Rules

Set up automated responses to events:

1. Go to **Settings** → **Automation Rules**
2. Create rule:
   - **Trigger**: Define event conditions
   - **Actions**: Specify automated responses
   - **Filters**: Add conditional logic
3. Test and activate rule

## Conclusion

Cubcen provides a powerful platform for managing your AI agent ecosystem. This guide covers the essential features and best practices to help you get the most out of your investment.

For additional help:

- Check the **Help Center** within the application
- Visit our **Knowledge Base** online
- Contact **Support** for personalized assistance
- Join the **Community Forum** for peer discussions

Welcome to more efficient AI agent management with Cubcen!

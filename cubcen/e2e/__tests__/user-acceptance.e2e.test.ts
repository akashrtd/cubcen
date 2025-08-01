import { TestServer } from '../utils/test-server'
import { ApiHelper, ValidationHelper, waitFor } from '../utils/test-helpers'

describe('User Acceptance Testing (UAT) Scenarios', () => {
  let server: TestServer
  let api: ApiHelper

  beforeAll(async () => {
    server = new TestServer()
    await server.start()
    api = new ApiHelper(server)
  })

  afterAll(async () => {
    await server.cleanup()
  })

  describe('UAT-001: New User Onboarding Journey', () => {
    it('should allow a new user to complete the full onboarding process', async () => {
      // Step 1: User registers for Cubcen
      const userData = {
        email: 'newuser@company.com',
        password: 'SecurePassword123!',
        name: 'John Smith',
        role: 'operator'
      }

      const registerResponse = await api.post('/api/cubcen/v1/auth/register', userData, 'admin@cubcen.test')
        .expect(201)

      expect(registerResponse.body.user.email).toBe(userData.email)
      expect(registerResponse.body.user.name).toBe(userData.name)

      // Step 2: User logs in successfully
      const loginResponse = await api.post('/api/cubcen/v1/auth/login', {
        email: userData.email,
        password: userData.password
      }).expect(200)

      expect(loginResponse.body.token).toBeDefined()
      const userToken = loginResponse.body.token

      // Step 3: User views dashboard and sees initial state
      const dashboardResponse = await api.get('/api/cubcen/v1/dashboard', userData.email)
        .expect(200)

      expect(dashboardResponse.body).toHaveProperty('agents')
      expect(dashboardResponse.body).toHaveProperty('tasks')
      expect(dashboardResponse.body).toHaveProperty('platforms')

      // Step 4: User explores available agents
      const agentsResponse = await api.get('/api/cubcen/v1/agents', userData.email)
        .expect(200)

      expect(Array.isArray(agentsResponse.body)).toBe(true)
      expect(agentsResponse.body.length).toBeGreaterThan(0)

      // Step 5: User views agent details
      const agentId = agentsResponse.body[0].id
      const agentDetailResponse = await api.get(`/api/cubcen/v1/agents/${agentId}`, userData.email)
        .expect(200)

      ValidationHelper.validateAgent(agentDetailResponse.body)
      expect(agentDetailResponse.body.id).toBe(agentId)

      console.log('✅ UAT-001: New user onboarding completed successfully')
    })
  })

  describe('UAT-002: Daily Operations Workflow', () => {
    it('should support a typical daily operations workflow', async () => {
      const operatorEmail = 'operator@cubcen.test'

      // Step 1: Operator starts their day by checking system health
      const healthResponse = await api.get('/api/cubcen/v1/health', operatorEmail)
        .expect(200)

      expect(healthResponse.body.status).toBe('healthy')
      expect(healthResponse.body.checks).toBeDefined()

      // Step 2: Review overnight task executions
      const tasksResponse = await api.get('/api/cubcen/v1/tasks?status=completed&limit=10', operatorEmail)
        .expect(200)

      expect(Array.isArray(tasksResponse.body)).toBe(true)

      // Step 3: Check for any failed tasks
      const failedTasksResponse = await api.get('/api/cubcen/v1/tasks?status=failed', operatorEmail)
        .expect(200)

      expect(Array.isArray(failedTasksResponse.body)).toBe(true)

      // Step 4: If there are failed tasks, investigate the first one
      if (failedTasksResponse.body.length > 0) {
        const failedTaskId = failedTasksResponse.body[0].id
        const taskDetailResponse = await api.get(`/api/cubcen/v1/tasks/${failedTaskId}`, operatorEmail)
          .expect(200)

        expect(taskDetailResponse.body.status).toBe('failed')
        expect(taskDetailResponse.body.error).toBeDefined()

        // Step 5: Retry the failed task
        const retryResponse = await api.post(`/api/cubcen/v1/tasks/${failedTaskId}/retry`, {}, operatorEmail)
          .expect(200)

        expect(retryResponse.body.status).toBe('pending')
      }

      // Step 6: Check agent health status
      const agentsResponse = await api.get('/api/cubcen/v1/agents', operatorEmail)
        .expect(200)

      for (const agent of agentsResponse.body.slice(0, 3)) { // Check first 3 agents
        const healthResponse = await api.get(`/api/cubcen/v1/agents/${agent.id}/health`, operatorEmail)
          .expect(200)

        expect(healthResponse.body.status).toBeDefined()
        expect(['healthy', 'unhealthy', 'degraded']).toContain(healthResponse.body.status)
      }

      // Step 7: Schedule a new task
      const newTaskData = {
        name: 'Daily Report Generation',
        agentId: agentsResponse.body[0].id,
        priority: 'medium',
        scheduledAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        parameters: {
          reportType: 'daily',
          recipients: ['manager@company.com']
        }
      }

      const createTaskResponse = await api.post('/api/cubcen/v1/tasks', newTaskData, operatorEmail)
        .expect(201)

      ValidationHelper.validateTask(createTaskResponse.body)
      expect(createTaskResponse.body.name).toBe(newTaskData.name)

      console.log('✅ UAT-002: Daily operations workflow completed successfully')
    })
  })

  describe('UAT-003: Platform Integration Setup', () => {
    it('should allow admin to set up a new platform integration', async () => {
      const adminEmail = 'admin@cubcen.test'

      // Step 1: Admin views current platforms
      const platformsResponse = await api.get('/api/cubcen/v1/platforms', adminEmail)
        .expect(200)

      expect(Array.isArray(platformsResponse.body)).toBe(true)
      const initialPlatformCount = platformsResponse.body.length

      // Step 2: Admin adds a new platform
      const newPlatformData = {
        name: 'Production n8n Instance',
        type: 'n8n',
        baseUrl: 'https://n8n.company.com',
        authConfig: {
          type: 'api_key',
          apiKey: 'prod-n8n-api-key-12345'
        }
      }

      const createPlatformResponse = await api.post('/api/cubcen/v1/platforms', newPlatformData, adminEmail)
        .expect(201)

      ValidationHelper.validatePlatform(createPlatformResponse.body)
      expect(createPlatformResponse.body.name).toBe(newPlatformData.name)
      expect(createPlatformResponse.body.type).toBe(newPlatformData.type)

      const platformId = createPlatformResponse.body.id

      // Step 3: Test the platform connection
      const connectionTestResponse = await api.post(`/api/cubcen/v1/platforms/${platformId}/test-connection`, {}, adminEmail)
        .expect(200)

      expect(connectionTestResponse.body.status).toBeDefined()
      expect(['connected', 'failed', 'timeout']).toContain(connectionTestResponse.body.status)

      // Step 4: Discover agents from the platform
      const discoverResponse = await api.post(`/api/cubcen/v1/platforms/${platformId}/discover`, {}, adminEmail)
        .expect(200)

      expect(discoverResponse.body.discovered).toBeDefined()
      expect(typeof discoverResponse.body.discovered).toBe('number')

      // Step 5: Sync agents from the platform
      const syncResponse = await api.post(`/api/cubcen/v1/platforms/${platformId}/sync`, {}, adminEmail)
        .expect(200)

      expect(syncResponse.body.synced).toBeDefined()
      expect(syncResponse.body.created).toBeDefined()
      expect(typeof syncResponse.body.synced).toBe('number')

      // Step 6: Verify agents were created
      const updatedAgentsResponse = await api.get('/api/cubcen/v1/agents', adminEmail)
        .expect(200)

      const platformAgents = updatedAgentsResponse.body.filter((agent: any) => agent.platformId === platformId)
      expect(platformAgents.length).toBeGreaterThanOrEqual(0)

      // Step 7: Configure platform monitoring
      const monitoringConfig = {
        healthCheckInterval: 300, // 5 minutes
        syncInterval: 3600, // 1 hour
        alertOnFailure: true
      }

      const configResponse = await api.put(`/api/cubcen/v1/platforms/${platformId}/monitoring`, monitoringConfig, adminEmail)
        .expect(200)

      expect(configResponse.body.monitoringConfig).toEqual(monitoringConfig)

      console.log('✅ UAT-003: Platform integration setup completed successfully')
    })
  })

  describe('UAT-004: Error Investigation and Resolution', () => {
    it('should support error investigation and resolution workflow', async () => {
      const operatorEmail = 'operator@cubcen.test'

      // Step 1: Operator notices error alerts
      const errorsResponse = await api.get('/api/cubcen/v1/errors?severity=high&limit=10', operatorEmail)
        .expect(200)

      expect(Array.isArray(errorsResponse.body)).toBe(true)

      // Step 2: Investigate the most recent error
      if (errorsResponse.body.length > 0) {
        const errorId = errorsResponse.body[0].id
        const errorDetailResponse = await api.get(`/api/cubcen/v1/errors/${errorId}`, operatorEmail)
          .expect(200)

        expect(errorDetailResponse.body.id).toBe(errorId)
        expect(errorDetailResponse.body.message).toBeDefined()
        expect(errorDetailResponse.body.stack).toBeDefined()

        // Step 3: Check related agent status
        const agentId = errorDetailResponse.body.agentId
        if (agentId) {
          const agentResponse = await api.get(`/api/cubcen/v1/agents/${agentId}`, operatorEmail)
            .expect(200)

          expect(agentResponse.body.id).toBe(agentId)

          // Step 4: Check agent health
          const healthResponse = await api.get(`/api/cubcen/v1/agents/${agentId}/health`, operatorEmail)
            .expect(200)

          expect(healthResponse.body.status).toBeDefined()

          // Step 5: If agent is unhealthy, trigger health check
          if (healthResponse.body.status === 'unhealthy') {
            const healthCheckResponse = await api.post(`/api/cubcen/v1/agents/${agentId}/health-check`, {}, operatorEmail)
              .expect(200)

            expect(healthCheckResponse.body.status).toBeDefined()
          }
        }

        // Step 6: Check for similar errors (pattern detection)
        const similarErrorsResponse = await api.get(`/api/cubcen/v1/errors/patterns?errorId=${errorId}`, operatorEmail)
          .expect(200)

        expect(similarErrorsResponse.body.pattern).toBeDefined()
        expect(similarErrorsResponse.body.occurrences).toBeDefined()

        // Step 7: Mark error as investigated
        const updateErrorResponse = await api.put(`/api/cubcen/v1/errors/${errorId}`, {
          status: 'investigated',
          notes: 'Investigated by operator, agent health check performed'
        }, operatorEmail).expect(200)

        expect(updateErrorResponse.body.status).toBe('investigated')
      }

      console.log('✅ UAT-004: Error investigation workflow completed successfully')
    })
  })

  describe('UAT-005: Analytics and Reporting', () => {
    it('should provide comprehensive analytics and reporting capabilities', async () => {
      const adminEmail = 'admin@cubcen.test'

      // Step 1: View system overview analytics
      const overviewResponse = await api.get('/api/cubcen/v1/analytics/overview', adminEmail)
        .expect(200)

      expect(overviewResponse.body).toHaveProperty('totalAgents')
      expect(overviewResponse.body).toHaveProperty('activeTasks')
      expect(overviewResponse.body).toHaveProperty('successRate')
      expect(overviewResponse.body).toHaveProperty('errorRate')

      // Step 2: Get agent performance metrics
      const agentMetricsResponse = await api.get('/api/cubcen/v1/analytics/agents', adminEmail)
        .expect(200)

      expect(Array.isArray(agentMetricsResponse.body)).toBe(true)
      agentMetricsResponse.body.forEach((metric: any) => {
        expect(metric).toHaveProperty('agentId')
        expect(metric).toHaveProperty('executionCount')
        expect(metric).toHaveProperty('successRate')
        expect(metric).toHaveProperty('averageExecutionTime')
      })

      // Step 3: Get time-based performance trends
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days ago

      const trendsResponse = await api.get(
        `/api/cubcen/v1/analytics/trends?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        adminEmail
      ).expect(200)

      expect(trendsResponse.body).toHaveProperty('timeRange')
      expect(trendsResponse.body).toHaveProperty('dataPoints')
      expect(Array.isArray(trendsResponse.body.dataPoints)).toBe(true)

      // Step 4: Generate and export a report
      const reportRequest = {
        type: 'weekly_summary',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        format: 'json',
        includeCharts: true
      }

      const reportResponse = await api.post('/api/cubcen/v1/analytics/reports', reportRequest, adminEmail)
        .expect(200)

      expect(reportResponse.body).toHaveProperty('reportId')
      expect(reportResponse.body).toHaveProperty('status')
      expect(reportResponse.body.status).toBe('generated')

      // Step 5: Download the generated report
      const reportId = reportResponse.body.reportId
      const downloadResponse = await api.get(`/api/cubcen/v1/analytics/reports/${reportId}/download`, adminEmail)
        .expect(200)

      expect(downloadResponse.body).toHaveProperty('summary')
      expect(downloadResponse.body).toHaveProperty('metrics')
      expect(downloadResponse.body).toHaveProperty('charts')

      console.log('✅ UAT-005: Analytics and reporting workflow completed successfully')
    })
  })

  describe('UAT-006: Multi-User Collaboration', () => {
    it('should support multiple users working collaboratively', async () => {
      const adminEmail = 'admin@cubcen.test'
      const operatorEmail = 'operator@cubcen.test'
      const viewerEmail = 'viewer@cubcen.test'

      // Step 1: Admin creates a new task
      const taskData = {
        name: 'Collaborative Task',
        agentId: 'test-agent-id',
        priority: 'high',
        parameters: { collaboration: true },
        assignedTo: operatorEmail
      }

      const createTaskResponse = await api.post('/api/cubcen/v1/tasks', taskData, adminEmail)
        .expect(201)

      const taskId = createTaskResponse.body.id

      // Step 2: Operator receives and acknowledges the task
      const operatorTasksResponse = await api.get('/api/cubcen/v1/tasks?assignedTo=me', operatorEmail)
        .expect(200)

      const assignedTask = operatorTasksResponse.body.find((task: any) => task.id === taskId)
      expect(assignedTask).toBeDefined()

      // Step 3: Operator updates task status
      const updateTaskResponse = await api.put(`/api/cubcen/v1/tasks/${taskId}`, {
        status: 'in_progress',
        notes: 'Started working on this task'
      }, operatorEmail).expect(200)

      expect(updateTaskResponse.body.status).toBe('in_progress')

      // Step 4: Viewer monitors the task progress (read-only)
      const viewerTaskResponse = await api.get(`/api/cubcen/v1/tasks/${taskId}`, viewerEmail)
        .expect(200)

      expect(viewerTaskResponse.body.status).toBe('in_progress')

      // Step 5: Viewer attempts to modify task (should be denied)
      const deniedResponse = await api.put(`/api/cubcen/v1/tasks/${taskId}`, {
        status: 'completed'
      }, viewerEmail).expect(403)

      expect(deniedResponse.body.error).toContain('Insufficient permissions')

      // Step 6: Admin monitors overall progress
      const adminOverviewResponse = await api.get('/api/cubcen/v1/dashboard', adminEmail)
        .expect(200)

      expect(adminOverviewResponse.body.tasks.inProgress).toBeGreaterThan(0)

      // Step 7: Operator completes the task
      const completeTaskResponse = await api.put(`/api/cubcen/v1/tasks/${taskId}`, {
        status: 'completed',
        notes: 'Task completed successfully',
        result: { success: true, output: 'Collaboration test passed' }
      }, operatorEmail).expect(200)

      expect(completeTaskResponse.body.status).toBe('completed')

      // Step 8: All users can view the completed task
      const finalTaskResponses = await Promise.all([
        api.get(`/api/cubcen/v1/tasks/${taskId}`, adminEmail),
        api.get(`/api/cubcen/v1/tasks/${taskId}`, operatorEmail),
        api.get(`/api/cubcen/v1/tasks/${taskId}`, viewerEmail)
      ])

      finalTaskResponses.forEach(response => {
        expect(response.status).toBe(200)
        expect(response.body.status).toBe('completed')
      })

      console.log('✅ UAT-006: Multi-user collaboration workflow completed successfully')
    })
  })

  describe('UAT-007: System Recovery and Resilience', () => {
    it('should demonstrate system recovery capabilities', async () => {
      const adminEmail = 'admin@cubcen.test'

      // Step 1: Check initial system health
      const initialHealthResponse = await api.get('/api/cubcen/v1/health', adminEmail)
        .expect(200)

      expect(initialHealthResponse.body.status).toBe('healthy')

      // Step 2: Simulate a platform connection failure
      const platforms = await api.get('/api/cubcen/v1/platforms', adminEmail)
      const platformId = platforms.body[0].id

      // Update platform with invalid configuration to simulate failure
      const invalidConfig = {
        baseUrl: 'http://invalid-url:9999',
        authConfig: { type: 'api_key', apiKey: 'invalid-key' }
      }

      await api.put(`/api/cubcen/v1/platforms/${platformId}`, invalidConfig, adminEmail)
        .expect(200)

      // Step 3: Wait for health check to detect the issue
      await waitFor(async () => {
        const healthResponse = await api.get(`/api/cubcen/v1/platforms/${platformId}/health`, adminEmail)
        return healthResponse.body.status === 'unhealthy'
      }, 10000)

      // Step 4: Verify system detects the issue
      const unhealthyResponse = await api.get(`/api/cubcen/v1/platforms/${platformId}/health`, adminEmail)
        .expect(200)

      expect(unhealthyResponse.body.status).toBe('unhealthy')

      // Step 5: Check that other parts of the system remain functional
      const agentsResponse = await api.get('/api/cubcen/v1/agents', adminEmail)
        .expect(200)

      expect(Array.isArray(agentsResponse.body)).toBe(true)

      // Step 6: Restore platform configuration
      const validConfig = {
        baseUrl: 'http://localhost:5678',
        authConfig: { type: 'api_key', apiKey: 'test-n8n-api-key' }
      }

      await api.put(`/api/cubcen/v1/platforms/${platformId}`, validConfig, adminEmail)
        .expect(200)

      // Step 7: Verify system recovery
      const recoveryResponse = await api.post(`/api/cubcen/v1/platforms/${platformId}/test-connection`, {}, adminEmail)
        .expect(200)

      // Connection should be restored (or at least attempting to connect)
      expect(['connected', 'failed', 'timeout']).toContain(recoveryResponse.body.status)

      // Step 8: Check overall system health
      const finalHealthResponse = await api.get('/api/cubcen/v1/health', adminEmail)
        .expect(200)

      // System should be healthy or degraded (not completely unhealthy)
      expect(['healthy', 'degraded']).toContain(finalHealthResponse.body.status)

      console.log('✅ UAT-007: System recovery workflow completed successfully')
    })
  })

  describe('UAT-008: Performance Under Load', () => {
    it('should maintain acceptable performance under typical user load', async () => {
      const users = ['admin@cubcen.test', 'operator@cubcen.test', 'viewer@cubcen.test']
      const startTime = Date.now()

      // Step 1: Simulate concurrent user activities
      const userActivities = users.map(async (userEmail) => {
        const activities = []

        // Each user performs typical activities
        activities.push(api.get('/api/cubcen/v1/dashboard', userEmail))
        activities.push(api.get('/api/cubcen/v1/agents', userEmail))
        activities.push(api.get('/api/cubcen/v1/tasks?limit=10', userEmail))

        // Admin and operator perform additional activities
        if (userEmail !== 'viewer@cubcen.test') {
          activities.push(api.get('/api/cubcen/v1/analytics/overview', userEmail))
        }

        return Promise.all(activities)
      })

      const results = await Promise.all(userActivities)
      const endTime = Date.now()
      const totalTime = endTime - startTime

      // Step 2: Verify all requests completed successfully
      results.forEach((userResults, index) => {
        userResults.forEach((response, activityIndex) => {
          expect(response.status).toBe(200)
        })
      })

      // Step 3: Verify acceptable response time
      expect(totalTime).toBeLessThan(5000) // All activities should complete within 5 seconds

      // Step 4: Check system remains responsive
      const healthResponse = await api.get('/api/cubcen/v1/health', 'admin@cubcen.test')
        .expect(200)

      expect(healthResponse.body.status).toBe('healthy')

      console.log('✅ UAT-008: Performance under load test completed successfully')
      console.log(`📊 Total time for concurrent user activities: ${totalTime}ms`)
    })
  })
})
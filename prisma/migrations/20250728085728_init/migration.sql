-- CreateTable
CREATE TABLE "cubcen_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "cubcen_platforms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DISCONNECTED',
    "authConfig" TEXT NOT NULL,
    "lastSyncAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "cubcen_agents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'INACTIVE',
    "capabilities" TEXT NOT NULL,
    "configuration" TEXT NOT NULL,
    "healthStatus" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cubcen_agents_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "cubcen_platforms" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cubcen_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "workflowId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parameters" TEXT NOT NULL,
    "result" TEXT,
    "error" TEXT,
    "scheduledAt" DATETIME NOT NULL,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cubcen_tasks_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "cubcen_agents" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cubcen_tasks_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "cubcen_workflows" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "cubcen_tasks_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "cubcen_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cubcen_workflows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cubcen_workflows_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "cubcen_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cubcen_workflow_steps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflowId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "parameters" TEXT NOT NULL,
    "conditions" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cubcen_workflow_steps_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "cubcen_workflows" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cubcen_workflow_steps_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "cubcen_agents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cubcen_system_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "context" TEXT,
    "source" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "cubcen_agent_health" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "responseTime" INTEGER,
    "lastCheckAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "consecutiveErrors" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "cubcen_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "tags" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "cubcen_users_email_key" ON "cubcen_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cubcen_platforms_name_type_key" ON "cubcen_platforms"("name", "type");

-- CreateIndex
CREATE UNIQUE INDEX "cubcen_agents_platformId_externalId_key" ON "cubcen_agents"("platformId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "cubcen_workflow_steps_workflowId_stepOrder_key" ON "cubcen_workflow_steps"("workflowId", "stepOrder");

-- CreateIndex
CREATE INDEX "cubcen_system_logs_level_timestamp_idx" ON "cubcen_system_logs"("level", "timestamp");

-- CreateIndex
CREATE INDEX "cubcen_system_logs_source_timestamp_idx" ON "cubcen_system_logs"("source", "timestamp");

-- CreateIndex
CREATE INDEX "cubcen_agent_health_agentId_lastCheckAt_idx" ON "cubcen_agent_health"("agentId", "lastCheckAt");

-- CreateIndex
CREATE INDEX "cubcen_metrics_type_timestamp_idx" ON "cubcen_metrics"("type", "timestamp");

-- CreateIndex
CREATE INDEX "cubcen_metrics_name_timestamp_idx" ON "cubcen_metrics"("name", "timestamp");

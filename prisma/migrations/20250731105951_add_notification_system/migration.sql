-- CreateTable
CREATE TABLE "cubcen_notification_channels" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "configuration" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "cubcen_notification_preferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "channels" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "escalationDelay" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cubcen_notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cubcen_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cubcen_notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" TEXT,
    "userId" TEXT,
    "channels" TEXT NOT NULL,
    "sentAt" DATETIME,
    "acknowledgedAt" DATETIME,
    "acknowledgedBy" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cubcen_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cubcen_users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cubcen_notification_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "channelType" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "variables" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "cubcen_in_app_notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "actionText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    CONSTRAINT "cubcen_in_app_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cubcen_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cubcen_alert_escalations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notificationId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "escalatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "escalatedTo" TEXT NOT NULL,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedAt" DATETIME,
    "acknowledgedBy" TEXT,
    CONSTRAINT "cubcen_alert_escalations_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "cubcen_notifications" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "cubcen_notification_preferences_userId_eventType_key" ON "cubcen_notification_preferences"("userId", "eventType");

-- CreateIndex
CREATE INDEX "cubcen_notifications_eventType_status_idx" ON "cubcen_notifications"("eventType", "status");

-- CreateIndex
CREATE INDEX "cubcen_notifications_userId_createdAt_idx" ON "cubcen_notifications"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "cubcen_notification_templates_eventType_channelType_key" ON "cubcen_notification_templates"("eventType", "channelType");

-- CreateIndex
CREATE INDEX "cubcen_in_app_notifications_userId_read_createdAt_idx" ON "cubcen_in_app_notifications"("userId", "read", "createdAt");

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Decimal, objectEnumValues, makeStrictEnum, Public, getRuntime, skip } = require('./runtime/index-browser.js');
const Prisma = {};
exports.Prisma = Prisma;
exports.$Enums = {};
Prisma.prismaVersion = {
    client: "6.13.0",
    engine: "361e86d0ea4987e9f53a565309b3eed797a6bcbd"
};
Prisma.PrismaClientKnownRequestError = () => {
    const runtimeName = getRuntime().prettyName;
    throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.PrismaClientUnknownRequestError = () => {
    const runtimeName = getRuntime().prettyName;
    throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.PrismaClientRustPanicError = () => {
    const runtimeName = getRuntime().prettyName;
    throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.PrismaClientInitializationError = () => {
    const runtimeName = getRuntime().prettyName;
    throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.PrismaClientValidationError = () => {
    const runtimeName = getRuntime().prettyName;
    throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.Decimal = Decimal;
Prisma.sql = () => {
    const runtimeName = getRuntime().prettyName;
    throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.empty = () => {
    const runtimeName = getRuntime().prettyName;
    throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.join = () => {
    const runtimeName = getRuntime().prettyName;
    throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.raw = () => {
    const runtimeName = getRuntime().prettyName;
    throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.validator = Public.validator;
Prisma.getExtensionContext = () => {
    const runtimeName = getRuntime().prettyName;
    throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.defineExtension = () => {
    const runtimeName = getRuntime().prettyName;
    throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.DbNull = objectEnumValues.instances.DbNull;
Prisma.JsonNull = objectEnumValues.instances.JsonNull;
Prisma.AnyNull = objectEnumValues.instances.AnyNull;
Prisma.NullTypes = {
    DbNull: objectEnumValues.classes.DbNull,
    JsonNull: objectEnumValues.classes.JsonNull,
    AnyNull: objectEnumValues.classes.AnyNull
};
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
    Serializable: 'Serializable'
});
exports.Prisma.UserScalarFieldEnum = {
    id: 'id',
    email: 'email',
    password: 'password',
    role: 'role',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.PlatformScalarFieldEnum = {
    id: 'id',
    name: 'name',
    type: 'type',
    baseUrl: 'baseUrl',
    status: 'status',
    authConfig: 'authConfig',
    lastSyncAt: 'lastSyncAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.AgentScalarFieldEnum = {
    id: 'id',
    name: 'name',
    platformId: 'platformId',
    externalId: 'externalId',
    status: 'status',
    capabilities: 'capabilities',
    configuration: 'configuration',
    healthStatus: 'healthStatus',
    description: 'description',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.TaskScalarFieldEnum = {
    id: 'id',
    agentId: 'agentId',
    workflowId: 'workflowId',
    status: 'status',
    priority: 'priority',
    name: 'name',
    description: 'description',
    parameters: 'parameters',
    result: 'result',
    error: 'error',
    scheduledAt: 'scheduledAt',
    startedAt: 'startedAt',
    completedAt: 'completedAt',
    retryCount: 'retryCount',
    maxRetries: 'maxRetries',
    createdBy: 'createdBy',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.WorkflowScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    status: 'status',
    createdBy: 'createdBy',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.WorkflowStepScalarFieldEnum = {
    id: 'id',
    workflowId: 'workflowId',
    agentId: 'agentId',
    stepOrder: 'stepOrder',
    name: 'name',
    parameters: 'parameters',
    conditions: 'conditions',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.SystemLogScalarFieldEnum = {
    id: 'id',
    level: 'level',
    message: 'message',
    context: 'context',
    source: 'source',
    timestamp: 'timestamp'
};
exports.Prisma.AgentHealthScalarFieldEnum = {
    id: 'id',
    agentId: 'agentId',
    status: 'status',
    responseTime: 'responseTime',
    lastCheckAt: 'lastCheckAt',
    errorCount: 'errorCount',
    consecutiveErrors: 'consecutiveErrors'
};
exports.Prisma.MetricScalarFieldEnum = {
    id: 'id',
    type: 'type',
    name: 'name',
    value: 'value',
    tags: 'tags',
    timestamp: 'timestamp'
};
exports.Prisma.NotificationChannelScalarFieldEnum = {
    id: 'id',
    type: 'type',
    name: 'name',
    enabled: 'enabled',
    configuration: 'configuration',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.NotificationPreferenceScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    eventType: 'eventType',
    channels: 'channels',
    enabled: 'enabled',
    escalationDelay: 'escalationDelay',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.NotificationScalarFieldEnum = {
    id: 'id',
    eventType: 'eventType',
    priority: 'priority',
    status: 'status',
    title: 'title',
    message: 'message',
    data: 'data',
    userId: 'userId',
    channels: 'channels',
    sentAt: 'sentAt',
    acknowledgedAt: 'acknowledgedAt',
    acknowledgedBy: 'acknowledgedBy',
    retryCount: 'retryCount',
    maxRetries: 'maxRetries',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.NotificationTemplateScalarFieldEnum = {
    id: 'id',
    eventType: 'eventType',
    channelType: 'channelType',
    subject: 'subject',
    template: 'template',
    variables: 'variables',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.Prisma.InAppNotificationScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    title: 'title',
    message: 'message',
    type: 'type',
    read: 'read',
    actionUrl: 'actionUrl',
    actionText: 'actionText',
    createdAt: 'createdAt',
    expiresAt: 'expiresAt'
};
exports.Prisma.AlertEscalationScalarFieldEnum = {
    id: 'id',
    notificationId: 'notificationId',
    level: 'level',
    escalatedAt: 'escalatedAt',
    escalatedTo: 'escalatedTo',
    acknowledged: 'acknowledged',
    acknowledgedAt: 'acknowledgedAt',
    acknowledgedBy: 'acknowledgedBy'
};
exports.Prisma.SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
exports.Prisma.NullsOrder = {
    first: 'first',
    last: 'last'
};
exports.UserRole = exports.$Enums.UserRole = {
    ADMIN: 'ADMIN',
    OPERATOR: 'OPERATOR',
    VIEWER: 'VIEWER'
};
exports.Prisma.ModelName = {
    User: 'User',
    Platform: 'Platform',
    Agent: 'Agent',
    Task: 'Task',
    Workflow: 'Workflow',
    WorkflowStep: 'WorkflowStep',
    SystemLog: 'SystemLog',
    AgentHealth: 'AgentHealth',
    Metric: 'Metric',
    NotificationChannel: 'NotificationChannel',
    NotificationPreference: 'NotificationPreference',
    Notification: 'Notification',
    NotificationTemplate: 'NotificationTemplate',
    InAppNotification: 'InAppNotification',
    AlertEscalation: 'AlertEscalation'
};
class PrismaClient {
    constructor() {
        return new Proxy(this, {
            get(target, prop) {
                let message;
                const runtime = getRuntime();
                if (runtime.isEdge) {
                    message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
                }
                else {
                    message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).';
                }
                message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`;
                throw new Error(message);
            }
        });
    }
}
exports.PrismaClient = PrismaClient;
Object.assign(exports, Prisma);
//# sourceMappingURL=wasm.js.map
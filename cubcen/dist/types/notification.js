"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationStatus = exports.NotificationPriority = exports.NotificationEventType = exports.NotificationChannelType = void 0;
var NotificationChannelType;
(function (NotificationChannelType) {
    NotificationChannelType["EMAIL"] = "email";
    NotificationChannelType["SLACK"] = "slack";
    NotificationChannelType["IN_APP"] = "in_app";
})(NotificationChannelType || (exports.NotificationChannelType = NotificationChannelType = {}));
var NotificationEventType;
(function (NotificationEventType) {
    NotificationEventType["AGENT_DOWN"] = "agent_down";
    NotificationEventType["AGENT_ERROR"] = "agent_error";
    NotificationEventType["TASK_FAILED"] = "task_failed";
    NotificationEventType["TASK_COMPLETED"] = "task_completed";
    NotificationEventType["WORKFLOW_FAILED"] = "workflow_failed";
    NotificationEventType["WORKFLOW_COMPLETED"] = "workflow_completed";
    NotificationEventType["SYSTEM_ERROR"] = "system_error";
    NotificationEventType["HEALTH_CHECK_FAILED"] = "health_check_failed";
    NotificationEventType["PLATFORM_DISCONNECTED"] = "platform_disconnected";
})(NotificationEventType || (exports.NotificationEventType = NotificationEventType = {}));
var NotificationPriority;
(function (NotificationPriority) {
    NotificationPriority["LOW"] = "low";
    NotificationPriority["MEDIUM"] = "medium";
    NotificationPriority["HIGH"] = "high";
    NotificationPriority["CRITICAL"] = "critical";
})(NotificationPriority || (exports.NotificationPriority = NotificationPriority = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["PENDING"] = "pending";
    NotificationStatus["SENT"] = "sent";
    NotificationStatus["FAILED"] = "failed";
    NotificationStatus["ACKNOWLEDGED"] = "acknowledged";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
//# sourceMappingURL=notification.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = exports.CircuitBreakerError = void 0;
exports.createPlatformCircuitBreaker = createPlatformCircuitBreaker;
class CircuitBreakerError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CircuitBreakerError';
    }
}
exports.CircuitBreakerError = CircuitBreakerError;
class CircuitBreaker {
    constructor(options = {}) {
        this.state = 'closed';
        this.failures = 0;
        this.successes = 0;
        this.requests = 0;
        this.options = {
            failureThreshold: 5,
            recoveryTimeout: 60000,
            monitoringPeriod: 10000,
            expectedErrors: () => true,
            ...options
        };
    }
    async execute(operation) {
        if (this.state === 'open') {
            if (this.shouldAttemptReset()) {
                this.state = 'half-open';
            }
            else {
                throw new CircuitBreakerError(`Circuit breaker is open. Next attempt at ${this.nextAttempt?.toISOString()}`);
            }
        }
        this.requests++;
        try {
            const result = await operation();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure(error);
            throw error;
        }
    }
    getStats() {
        return {
            state: this.state,
            failures: this.failures,
            successes: this.successes,
            requests: this.requests,
            lastFailureTime: this.lastFailureTime,
            nextAttempt: this.nextAttempt
        };
    }
    reset() {
        this.state = 'closed';
        this.failures = 0;
        this.successes = 0;
        this.requests = 0;
        this.lastFailureTime = undefined;
        this.nextAttempt = undefined;
    }
    forceOpen() {
        this.state = 'open';
        this.lastFailureTime = new Date();
        this.nextAttempt = new Date(Date.now() + this.options.recoveryTimeout);
    }
    forceClosed() {
        this.state = 'closed';
        this.lastFailureTime = undefined;
        this.nextAttempt = undefined;
    }
    onSuccess() {
        this.successes++;
        if (this.state === 'half-open') {
            this.state = 'closed';
            this.failures = 0;
            this.lastFailureTime = undefined;
            this.nextAttempt = undefined;
        }
    }
    onFailure(error) {
        if (this.options.expectedErrors && !this.options.expectedErrors(error)) {
            return;
        }
        this.failures++;
        this.lastFailureTime = new Date();
        if (this.state === 'half-open') {
            this.state = 'open';
            this.nextAttempt = new Date(Date.now() + this.options.recoveryTimeout);
        }
        else if (this.failures >= this.options.failureThreshold) {
            this.state = 'open';
            this.nextAttempt = new Date(Date.now() + this.options.recoveryTimeout);
        }
    }
    shouldAttemptReset() {
        if (!this.nextAttempt) {
            return false;
        }
        return Date.now() >= this.nextAttempt.getTime();
    }
}
exports.CircuitBreaker = CircuitBreaker;
function createPlatformCircuitBreaker(options = {}) {
    return new CircuitBreaker({
        failureThreshold: 3,
        recoveryTimeout: 30000,
        monitoringPeriod: 5000,
        expectedErrors: (error) => {
            return error.message.includes('timeout') ||
                error.message.includes('ECONNREFUSED') ||
                error.message.includes('ENOTFOUND') ||
                error.message.includes('network') ||
                error.name === 'AbortError';
        },
        ...options
    });
}
//# sourceMappingURL=circuit-breaker.js.map
/**
 * Circuit Breaker Pattern Implementation for Cubcen
 * Provides resilient external API calls with failure detection and recovery
 */

export type CircuitBreakerState = 'closed' | 'open' | 'half-open'

export interface CircuitBreakerOptions {
  failureThreshold: number
  recoveryTimeout: number
  monitoringPeriod: number
  expectedErrors?: (error: Error) => boolean
}

export interface CircuitBreakerStats {
  state: CircuitBreakerState
  failures: number
  successes: number
  requests: number
  lastFailureTime?: Date
  nextAttempt?: Date
}

export class CircuitBreakerError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CircuitBreakerError'
  }
}

export class CircuitBreaker {
  private state: CircuitBreakerState = 'closed'
  private failures = 0
  private successes = 0
  private requests = 0
  private lastFailureTime?: Date
  private nextAttempt?: Date
  private readonly options: CircuitBreakerOptions

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1 minute
      monitoringPeriod: 10000, // 10 seconds
      expectedErrors: () => true,
      ...options,
    }
  }

  /**
   * Execute an operation with circuit breaker protection
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.state = 'half-open'
      } else {
        throw new CircuitBreakerError(
          `Circuit breaker is open. Next attempt at ${this.nextAttempt?.toISOString()}`
        )
      }
    }

    this.requests++

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure(error as Error)
      throw error
    }
  }

  /**
   * Get current circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      requests: this.requests,
      lastFailureTime: this.lastFailureTime,
      nextAttempt: this.nextAttempt,
    }
  }

  /**
   * Reset the circuit breaker to closed state
   */
  reset(): void {
    this.state = 'closed'
    this.failures = 0
    this.successes = 0
    this.requests = 0
    this.lastFailureTime = undefined
    this.nextAttempt = undefined
  }

  /**
   * Force the circuit breaker to open state
   */
  forceOpen(): void {
    this.state = 'open'
    this.lastFailureTime = new Date()
    this.nextAttempt = new Date(Date.now() + this.options.recoveryTimeout)
  }

  /**
   * Force the circuit breaker to closed state
   */
  forceClosed(): void {
    this.state = 'closed'
    this.lastFailureTime = undefined
    this.nextAttempt = undefined
  }

  /**
   * Handle successful operation
   */
  private onSuccess(): void {
    this.successes++

    if (this.state === 'half-open') {
      // If we're in half-open state and got a success, close the circuit
      this.state = 'closed'
      this.failures = 0
      this.lastFailureTime = undefined
      this.nextAttempt = undefined
    }
  }

  /**
   * Handle failed operation
   */
  private onFailure(error: Error): void {
    // Only count expected errors as failures
    if (this.options.expectedErrors && !this.options.expectedErrors(error)) {
      return
    }

    this.failures++
    this.lastFailureTime = new Date()

    if (this.state === 'half-open') {
      // If we're in half-open state and got a failure, open the circuit
      this.state = 'open'
      this.nextAttempt = new Date(Date.now() + this.options.recoveryTimeout)
    } else if (this.failures >= this.options.failureThreshold) {
      // If we've exceeded the failure threshold, open the circuit
      this.state = 'open'
      this.nextAttempt = new Date(Date.now() + this.options.recoveryTimeout)
    }
  }

  /**
   * Check if we should attempt to reset the circuit breaker
   */
  private shouldAttemptReset(): boolean {
    if (!this.nextAttempt) {
      return false
    }
    return Date.now() >= this.nextAttempt.getTime()
  }
}

/**
 * Create a circuit breaker with default options for platform adapters
 */
export function createPlatformCircuitBreaker(
  options: Partial<CircuitBreakerOptions> = {}
): CircuitBreaker {
  return new CircuitBreaker({
    failureThreshold: 3,
    recoveryTimeout: 30000, // 30 seconds
    monitoringPeriod: 5000, // 5 seconds
    expectedErrors: (error: Error) => {
      // Consider network errors and timeouts as expected failures
      return (
        error.message.includes('timeout') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ENOTFOUND') ||
        error.message.includes('network') ||
        error.name === 'AbortError'
      )
    },
    ...options,
  })
}

/**
 * Circuit Breaker Tests
 */

import {
  CircuitBreaker,
  CircuitBreakerError,
  createPlatformCircuitBreaker,
} from '../circuit-breaker'

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      recoveryTimeout: 1000,
      monitoringPeriod: 500,
    })
  })

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const cb = new CircuitBreaker()
      const stats = cb.getStats()

      expect(stats.state).toBe('closed')
      expect(stats.failures).toBe(0)
      expect(stats.successes).toBe(0)
      expect(stats.requests).toBe(0)
    })

    it('should initialize with custom options', () => {
      const cb = new CircuitBreaker({
        failureThreshold: 5,
        recoveryTimeout: 2000,
      })

      expect(cb).toBeDefined()
    })
  })

  describe('execute', () => {
    it('should execute successful operations', async () => {
      const operation = jest.fn().mockResolvedValue('success')

      const result = await circuitBreaker.execute(operation)

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(1)

      const stats = circuitBreaker.getStats()
      expect(stats.successes).toBe(1)
      expect(stats.requests).toBe(1)
      expect(stats.state).toBe('closed')
    })

    it('should handle failed operations', async () => {
      const error = new Error('Operation failed')
      const operation = jest.fn().mockRejectedValue(error)

      await expect(circuitBreaker.execute(operation)).rejects.toThrow(
        'Operation failed'
      )

      const stats = circuitBreaker.getStats()
      expect(stats.failures).toBe(1)
      expect(stats.requests).toBe(1)
      expect(stats.state).toBe('closed')
    })

    it('should open circuit after failure threshold', async () => {
      const error = new Error('Operation failed')
      const operation = jest.fn().mockRejectedValue(error)

      // Execute 3 failed operations to reach threshold
      for (let i = 0; i < 3; i++) {
        await expect(circuitBreaker.execute(operation)).rejects.toThrow(
          'Operation failed'
        )
      }

      const stats = circuitBreaker.getStats()
      expect(stats.state).toBe('open')
      expect(stats.failures).toBe(3)
    })

    it('should reject requests when circuit is open', async () => {
      const error = new Error('Operation failed')
      const operation = jest.fn().mockRejectedValue(error)

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await expect(circuitBreaker.execute(operation)).rejects.toThrow(
          'Operation failed'
        )
      }

      // Next request should be rejected immediately
      await expect(circuitBreaker.execute(operation)).rejects.toThrow(
        CircuitBreakerError
      )
      expect(operation).toHaveBeenCalledTimes(3) // Should not call operation again
    })

    it('should transition to half-open after recovery timeout', async () => {
      const error = new Error('Operation failed')
      const failingOperation = jest.fn().mockRejectedValue(error)
      const successOperation = jest.fn().mockResolvedValue('success')

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await expect(circuitBreaker.execute(failingOperation)).rejects.toThrow(
          'Operation failed'
        )
      }

      expect(circuitBreaker.getStats().state).toBe('open')

      // Wait for recovery timeout
      await new Promise(resolve => setTimeout(resolve, 1100))

      // Next request should transition to half-open and succeed
      const result = await circuitBreaker.execute(successOperation)
      expect(result).toBe('success')
      expect(circuitBreaker.getStats().state).toBe('closed')
    })

    it('should return to open if half-open request fails', async () => {
      const error = new Error('Operation failed')
      const operation = jest.fn().mockRejectedValue(error)

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await expect(circuitBreaker.execute(operation)).rejects.toThrow(
          'Operation failed'
        )
      }

      // Wait for recovery timeout
      await new Promise(resolve => setTimeout(resolve, 1100))

      // Half-open request fails
      await expect(circuitBreaker.execute(operation)).rejects.toThrow(
        'Operation failed'
      )
      expect(circuitBreaker.getStats().state).toBe('open')
    })
  })

  describe('getStats', () => {
    it('should return current statistics', () => {
      const stats = circuitBreaker.getStats()

      expect(stats).toHaveProperty('state')
      expect(stats).toHaveProperty('failures')
      expect(stats).toHaveProperty('successes')
      expect(stats).toHaveProperty('requests')
    })
  })

  describe('reset', () => {
    it('should reset circuit breaker to initial state', async () => {
      const error = new Error('Operation failed')
      const operation = jest.fn().mockRejectedValue(error)

      // Generate some failures
      await expect(circuitBreaker.execute(operation)).rejects.toThrow()
      await expect(circuitBreaker.execute(operation)).rejects.toThrow()

      circuitBreaker.reset()

      const stats = circuitBreaker.getStats()
      expect(stats.state).toBe('closed')
      expect(stats.failures).toBe(0)
      expect(stats.successes).toBe(0)
      expect(stats.requests).toBe(0)
    })
  })

  describe('forceOpen', () => {
    it('should force circuit to open state', () => {
      circuitBreaker.forceOpen()

      const stats = circuitBreaker.getStats()
      expect(stats.state).toBe('open')
      expect(stats.lastFailureTime).toBeDefined()
      expect(stats.nextAttempt).toBeDefined()
    })
  })

  describe('forceClosed', () => {
    it('should force circuit to closed state', async () => {
      const error = new Error('Operation failed')
      const operation = jest.fn().mockRejectedValue(error)

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await expect(circuitBreaker.execute(operation)).rejects.toThrow(
          'Operation failed'
        )
      }

      circuitBreaker.forceClosed()

      const stats = circuitBreaker.getStats()
      expect(stats.state).toBe('closed')
      expect(stats.lastFailureTime).toBeUndefined()
      expect(stats.nextAttempt).toBeUndefined()
    })
  })

  describe('expectedErrors option', () => {
    it('should only count expected errors as failures', async () => {
      const cb = new CircuitBreaker({
        failureThreshold: 2,
        expectedErrors: (error: Error) => error.message.startsWith('expected'),
      })

      const expectedError = new Error('expected failure')
      const unexpectedError = new Error('network failure')

      // Unexpected error should not count as failure
      await expect(
        cb.execute(() => Promise.reject(unexpectedError))
      ).rejects.toThrow('network failure')
      expect(cb.getStats().failures).toBe(0)
      expect(cb.getStats().state).toBe('closed')

      // Expected errors should count as failures
      await expect(
        cb.execute(() => Promise.reject(expectedError))
      ).rejects.toThrow('expected failure')
      await expect(
        cb.execute(() => Promise.reject(expectedError))
      ).rejects.toThrow('expected failure')

      expect(cb.getStats().failures).toBe(2)
      expect(cb.getStats().state).toBe('open')
    })
  })
})

describe('createPlatformCircuitBreaker', () => {
  it('should create circuit breaker with platform-specific defaults', () => {
    const cb = createPlatformCircuitBreaker()

    expect(cb).toBeInstanceOf(CircuitBreaker)

    const stats = cb.getStats()
    expect(stats.state).toBe('closed')
  })

  it('should handle network-related errors as expected failures', async () => {
    const cb = createPlatformCircuitBreaker({ failureThreshold: 1 })

    const networkError = new Error('ECONNREFUSED')
    await expect(
      cb.execute(() => Promise.reject(networkError))
    ).rejects.toThrow('ECONNREFUSED')

    expect(cb.getStats().state).toBe('open')
  })

  it('should allow custom options to override defaults', () => {
    const cb = createPlatformCircuitBreaker({
      failureThreshold: 10,
    })

    expect(cb).toBeInstanceOf(CircuitBreaker)
  })
})

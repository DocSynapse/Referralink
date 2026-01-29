/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Circuit Breaker Service
 * Automatic failure detection & model health tracking
 *
 * Pattern: CLOSED → OPEN → HALF_OPEN → CLOSED
 * - CLOSED: Normal operation, requests allowed
 * - OPEN: Model unhealthy, block requests for timeout period
 * - HALF_OPEN: Recovery testing, allow limited test requests
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  failureThreshold: number;      // Open after N consecutive failures
  successThreshold: number;       // Close after N consecutive successes in HALF_OPEN
  timeout: number;                // Milliseconds before retry (HALF_OPEN state)
  slidingWindowSize: number;      // Track last N requests
}

export interface CircuitStatus {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  totalRequests: number;
  totalFailures: number;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,           // Open after 5 consecutive failures
  successThreshold: 2,            // Close after 2 consecutive successes
  timeout: 30000,                 // 30 seconds
  slidingWindowSize: 10
};

/**
 * In-memory circuit breaker store
 * TODO: Move to Redis for distributed systems (Fase 2)
 */
class CircuitBreakerService {
  private circuits: Map<string, CircuitStatus> = new Map();
  private config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get current circuit state for a model
   */
  getState(modelKey: string): CircuitStatus {
    if (!this.circuits.has(modelKey)) {
      this.circuits.set(modelKey, this.createInitialState());
    }
    return this.circuits.get(modelKey)!;
  }

  /**
   * Check if circuit allows request
   */
  async canExecute(modelKey: string): Promise<boolean> {
    const circuit = this.getState(modelKey);
    const now = Date.now();

    switch (circuit.state) {
      case 'CLOSED':
        return true;

      case 'OPEN':
        // Check if timeout elapsed
        if (circuit.lastFailureTime &&
            (now - circuit.lastFailureTime) >= this.config.timeout) {
          console.log(`[CircuitBreaker] ${modelKey} transitioning OPEN → HALF_OPEN`);
          this.transitionToHalfOpen(modelKey);
          return true;
        }
        return false;

      case 'HALF_OPEN':
        // Allow limited test requests
        return circuit.successCount < this.config.successThreshold;

      default:
        return true;
    }
  }

  /**
   * Record successful request
   */
  async recordSuccess(modelKey: string): Promise<void> {
    const circuit = this.getState(modelKey);
    const now = Date.now();

    circuit.successCount++;
    circuit.lastSuccessTime = now;
    circuit.totalRequests++;
    circuit.failureCount = 0; // Reset failure count on success

    if (circuit.state === 'HALF_OPEN' &&
        circuit.successCount >= this.config.successThreshold) {
      console.log(`[CircuitBreaker] ${modelKey} transitioning HALF_OPEN → CLOSED (${circuit.successCount} successes)`);
      this.transitionToClosed(modelKey);
    }

    this.circuits.set(modelKey, circuit);
  }

  /**
   * Record failed request
   */
  async recordFailure(modelKey: string, error?: Error): Promise<void> {
    const circuit = this.getState(modelKey);
    const now = Date.now();

    circuit.failureCount++;
    circuit.totalFailures++;
    circuit.totalRequests++;
    circuit.lastFailureTime = now;
    circuit.successCount = 0; // Reset success count on failure

    console.error(`[CircuitBreaker] ${modelKey} failure recorded (${circuit.failureCount}/${this.config.failureThreshold})`, error?.message);

    // Check if should open circuit
    if (circuit.state !== 'OPEN' &&
        circuit.failureCount >= this.config.failureThreshold) {
      console.warn(`[CircuitBreaker] ${modelKey} transitioning → OPEN (threshold reached)`);
      this.transitionToOpen(modelKey);
    }

    this.circuits.set(modelKey, circuit);
  }

  /**
   * Get all circuit statuses (for monitoring dashboard)
   */
  getAllStatuses(): Record<string, CircuitStatus> {
    const statuses: Record<string, CircuitStatus> = {};
    for (const [key, status] of this.circuits.entries()) {
      statuses[key] = status;
    }
    return statuses;
  }

  /**
   * Reset circuit to initial state
   */
  reset(modelKey: string): void {
    this.circuits.set(modelKey, this.createInitialState());
    console.log(`[CircuitBreaker] ${modelKey} manually reset to CLOSED`);
  }

  /**
   * Reset all circuits
   */
  resetAll(): void {
    this.circuits.clear();
    console.log('[CircuitBreaker] All circuits reset');
  }

  // Private helper methods

  private createInitialState(): CircuitStatus {
    return {
      state: 'CLOSED',
      failureCount: 0,
      successCount: 0,
      lastFailureTime: null,
      lastSuccessTime: null,
      totalRequests: 0,
      totalFailures: 0
    };
  }

  private transitionToOpen(modelKey: string): void {
    const circuit = this.getState(modelKey);
    circuit.state = 'OPEN';
    circuit.successCount = 0;
    this.circuits.set(modelKey, circuit);
  }

  private transitionToHalfOpen(modelKey: string): void {
    const circuit = this.getState(modelKey);
    circuit.state = 'HALF_OPEN';
    circuit.failureCount = 0;
    circuit.successCount = 0;
    this.circuits.set(modelKey, circuit);
  }

  private transitionToClosed(modelKey: string): void {
    const circuit = this.getState(modelKey);
    circuit.state = 'CLOSED';
    circuit.failureCount = 0;
    circuit.successCount = 0;
    this.circuits.set(modelKey, circuit);
  }
}

// Singleton instance
export const circuitBreaker = new CircuitBreakerService();

/**
 * Execute function with circuit breaker protection
 */
export async function executeWithCircuitBreaker<T>(
  modelKey: string,
  operation: () => Promise<T>
): Promise<T> {
  const canExecute = await circuitBreaker.canExecute(modelKey);

  if (!canExecute) {
    throw new Error(`Circuit breaker OPEN for ${modelKey} - service unavailable`);
  }

  try {
    const result = await operation();
    await circuitBreaker.recordSuccess(modelKey);
    return result;
  } catch (error) {
    await circuitBreaker.recordFailure(modelKey, error as Error);
    throw error;
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Circuit Breaker Status API Endpoint
 * GET /api/diagnosis/circuit-status
 *
 * Returns health status of all AI models for monitoring
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { circuitBreaker } from '../_services/circuitBreakerService';

// CORS configuration
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.VITE_ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Max-Age': '86400'
};

/**
 * Main handler
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204)
      .setHeader('Access-Control-Allow-Origin', CORS_HEADERS['Access-Control-Allow-Origin'])
      .setHeader('Access-Control-Allow-Methods', CORS_HEADERS['Access-Control-Allow-Methods'])
      .setHeader('Access-Control-Allow-Headers', CORS_HEADERS['Access-Control-Allow-Headers'])
      .end();
  }

  // Only GET allowed
  if (req.method !== 'GET') {
    return res.status(405)
      .setHeader('Access-Control-Allow-Origin', CORS_HEADERS['Access-Control-Allow-Origin'])
      .json({ error: 'Method Not Allowed' });
  }

  try {
    const statuses = circuitBreaker.getAllStatuses();
    const now = Date.now();

    // Transform to user-friendly format
    const modelHealth = Object.entries(statuses).map(([modelKey, status]) => ({
      model: modelKey,
      state: status.state,
      healthy: status.state === 'CLOSED' || status.state === 'HALF_OPEN',
      stats: {
        totalRequests: status.totalRequests,
        totalFailures: status.totalFailures,
        failureRate: status.totalRequests > 0
          ? (status.totalFailures / status.totalRequests * 100).toFixed(2) + '%'
          : '0%',
        lastFailure: status.lastFailureTime
          ? new Date(status.lastFailureTime).toISOString()
          : null,
        lastSuccess: status.lastSuccessTime
          ? new Date(status.lastSuccessTime).toISOString()
          : null,
        timeSinceLastFailure: status.lastFailureTime
          ? `${Math.floor((now - status.lastFailureTime) / 1000)}s ago`
          : null
      }
    }));

    const healthyCount = modelHealth.filter(m => m.healthy).length;

    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', CORS_HEADERS['Access-Control-Allow-Origin'])
      .setHeader('Content-Type', 'application/json')
      .json({
        timestamp: new Date().toISOString(),
        overall: {
          healthy: healthyCount,
          total: modelHealth.length,
          status: healthyCount > 0 ? 'operational' : 'degraded'
        },
        models: modelHealth
      });

  } catch (error: any) {
    console.error('[CircuitStatus] Error:', error);

    return res.status(500)
      .setHeader('Access-Control-Allow-Origin', CORS_HEADERS['Access-Control-Allow-Origin'])
      .json({
        error: 'Failed to retrieve circuit status',
        message: error.message
      });
  }
}

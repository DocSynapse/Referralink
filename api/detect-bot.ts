import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Bot Detection Serverless Function
 *
 * Purpose: Serve static prerendered HTML to search engine bots for SEO,
 * while serving React SPA to real users for interactive experience.
 *
 * Architecture:
 * - Detects user-agent to distinguish bots from users
 * - Bots → /public/landing-static.html (fully rendered content)
 * - Users → /dist/index.html (React SPA)
 *
 * SEO Impact:
 * - Fixes hash routing crawlability issue
 * - Ensures Google can index full page content
 * - No impact on user experience
 */

// Comprehensive list of search engine bot user-agents
const BOT_USER_AGENTS = [
  // Google
  'googlebot',
  'google-structured-data-testing-tool',
  'google-inspectiontool',

  // Microsoft
  'bingbot',
  'msnbot',
  'bingpreview',

  // Yahoo
  'slurp',
  'yahoo',

  // Other major search engines
  'duckduckbot',
  'duckduckgo',
  'baiduspider',
  'yandexbot',
  'yandex',

  // Social media crawlers (for Open Graph previews)
  'facebookexternalhit',
  'facebookcatalog',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
  'slackbot',
  'discordbot',

  // Other crawlers
  'applebot',
  'archive.org_bot',
  'ia_archiver',
  'semrushbot',
  'ahrefsbot',
  'dotbot',
  'rogerbot',
  'screaming frog',

  // Generic
  'bot',
  'crawler',
  'spider',
  'scraper',
];

/**
 * Detects if the request is from a bot based on user-agent string
 */
function isBot(userAgent: string): boolean {
  if (!userAgent) return false;

  const normalizedUserAgent = userAgent.toLowerCase();

  // Check if user-agent contains any bot signature
  return BOT_USER_AGENTS.some(botAgent =>
    normalizedUserAgent.includes(botAgent)
  );
}

/**
 * Gets appropriate HTML content based on user type
 */
function getHtmlContent(isBotRequest: boolean): string {
  try {
    if (isBotRequest) {
      // Serve static prerendered HTML to bots
      const staticHtmlPath = join(process.cwd(), 'public', 'landing-static.html');
      return readFileSync(staticHtmlPath, 'utf-8');
    } else {
      // Serve React SPA to real users
      const spaHtmlPath = join(process.cwd(), 'dist', 'index.html');
      return readFileSync(spaHtmlPath, 'utf-8');
    }
  } catch (error) {
    console.error('Error reading HTML file:', error);

    // Fallback: Try alternative paths
    if (isBotRequest) {
      try {
        // Try root public directory
        const fallbackPath = join(process.cwd(), 'landing-static.html');
        return readFileSync(fallbackPath, 'utf-8');
      } catch {
        // Ultimate fallback: serve minimal HTML with meta tags
        return generateFallbackHtml();
      }
    }

    throw error;
  }
}

/**
 * Generates minimal fallback HTML if static file not found
 */
function generateFallbackHtml(): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sentra ReferraLink - AI Clinical Referral System</title>
  <meta name="description" content="AI-powered clinical decision support system untuk rumah sakit. 6 safety gates, 10-year audit trail, automated ICD-10 coding." />
  <link rel="canonical" href="https://referralink.vercel.app/" />
</head>
<body>
  <h1>Sentra ReferraLink - AI Clinical Referral System</h1>
  <p>AI-powered clinical decision support system dengan 6 safety gates dan 10-year audit trail.</p>
  <p>Please visit <a href="https://referralink.vercel.app">https://referralink.vercel.app</a></p>
</body>
</html>`;
}

/**
 * Main handler function
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Get user-agent from request headers
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();

    // Detect if request is from a bot
    const isBotRequest = isBot(userAgent);

    // Log for debugging (visible in Vercel logs)
    console.log({
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      isBot: isBotRequest,
      path: req.url,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    });

    // Get appropriate HTML content
    const htmlContent = getHtmlContent(isBotRequest);

    // Set response headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    // Cache control:
    // - Bots: Cache for 1 hour (content rarely changes)
    // - Users: No cache (always get latest SPA)
    if (isBotRequest) {
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
      res.setHeader('X-Robots-Tag', 'index, follow');
    } else {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    // Add custom header for debugging
    res.setHeader('X-Served-To', isBotRequest ? 'bot' : 'user');

    // Send HTML response
    return res.status(200).send(htmlContent);

  } catch (error) {
    console.error('Bot detection handler error:', error);

    // Send error response
    return res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development'
        ? (error as Error).message
        : 'Failed to serve content',
    });
  }
}

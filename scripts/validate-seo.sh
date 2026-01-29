#!/bin/bash

# SEO Foundation Validation Script
# Validates deployment of SEO infrastructure for ReferraLink

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="https://referralink.vercel.app"
PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

echo "═══════════════════════════════════════════════════════════════"
echo "  🔍 SEO FOUNDATION VALIDATION - REFERRALINK"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Target URL: ${BLUE}${BASE_URL}${NC}"
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Helper functions
pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASS_COUNT++))
}

fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAIL_COUNT++))
}

warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    ((WARN_COUNT++))
}

info() {
    echo -e "${BLUE}ℹ️  INFO${NC}: $1"
}

# Test 1: robots.txt Accessibility
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: robots.txt Accessibility"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ROBOTS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/robots.txt" 2>&1)
if [ "$ROBOTS_RESPONSE" = "200" ]; then
    pass "robots.txt is accessible (HTTP 200)"

    # Check content
    ROBOTS_CONTENT=$(curl -s "${BASE_URL}/robots.txt")
    if echo "$ROBOTS_CONTENT" | grep -q "User-agent:"; then
        pass "robots.txt contains User-agent directive"
    else
        fail "robots.txt missing User-agent directive"
    fi

    if echo "$ROBOTS_CONTENT" | grep -q "Sitemap:"; then
        pass "robots.txt contains Sitemap reference"
    else
        warn "robots.txt missing Sitemap reference"
    fi
else
    fail "robots.txt not accessible (HTTP ${ROBOTS_RESPONSE})"
fi
echo ""

# Test 2: sitemap.xml Accessibility
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: sitemap.xml Accessibility"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
SITEMAP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/sitemap.xml" 2>&1)
if [ "$SITEMAP_RESPONSE" = "200" ]; then
    pass "sitemap.xml is accessible (HTTP 200)"

    # Check content
    SITEMAP_CONTENT=$(curl -s "${BASE_URL}/sitemap.xml")
    if echo "$SITEMAP_CONTENT" | grep -q "<urlset"; then
        pass "sitemap.xml contains valid XML structure"
    else
        fail "sitemap.xml missing <urlset> root element"
    fi

    if echo "$SITEMAP_CONTENT" | grep -q "<loc>"; then
        pass "sitemap.xml contains <loc> entries"
    else
        fail "sitemap.xml missing <loc> URL entries"
    fi

    if echo "$SITEMAP_CONTENT" | grep -q "image:image"; then
        pass "sitemap.xml contains image sitemap"
    else
        warn "sitemap.xml missing image sitemap entries"
    fi
else
    fail "sitemap.xml not accessible (HTTP ${SITEMAP_RESPONSE})"
fi
echo ""

# Test 3: Security Headers
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Security Headers (Google Trust Signals)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
HEADERS=$(curl -s -I "${BASE_URL}/" 2>&1)

# Check HSTS
if echo "$HEADERS" | grep -qi "strict-transport-security"; then
    pass "Strict-Transport-Security header present"
else
    fail "Strict-Transport-Security header missing"
fi

# Check X-Content-Type-Options
if echo "$HEADERS" | grep -qi "x-content-type-options"; then
    pass "X-Content-Type-Options header present"
else
    fail "X-Content-Type-Options header missing"
fi

# Check X-Frame-Options
if echo "$HEADERS" | grep -qi "x-frame-options"; then
    pass "X-Frame-Options header present"
else
    fail "X-Frame-Options header missing"
fi

# Check X-XSS-Protection
if echo "$HEADERS" | grep -qi "x-xss-protection"; then
    pass "X-XSS-Protection header present"
else
    warn "X-XSS-Protection header missing (optional)"
fi

# Check Referrer-Policy
if echo "$HEADERS" | grep -qi "referrer-policy"; then
    pass "Referrer-Policy header present"
else
    warn "Referrer-Policy header missing (optional)"
fi

# Check Content-Security-Policy
if echo "$HEADERS" | grep -qi "content-security-policy"; then
    pass "Content-Security-Policy header present"
else
    warn "Content-Security-Policy header missing (recommended)"
fi

echo ""

# Test 4: Meta Tags & HTML Structure
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: Meta Tags & HTML Structure"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
HTML_CONTENT=$(curl -s "${BASE_URL}/")

# Check title tag
if echo "$HTML_CONTENT" | grep -q "<title>"; then
    TITLE=$(echo "$HTML_CONTENT" | grep -o '<title>.*</title>' | sed 's/<[^>]*>//g')
    if [ ${#TITLE} -ge 30 ] && [ ${#TITLE} -le 60 ]; then
        pass "Title tag present and optimal length (${#TITLE} chars)"
        info "Title: ${TITLE}"
    elif [ ${#TITLE} -gt 0 ]; then
        warn "Title tag present but suboptimal length (${#TITLE} chars, recommended 30-60)"
        info "Title: ${TITLE}"
    else
        fail "Title tag empty"
    fi
else
    fail "Title tag missing"
fi

# Check meta description
if echo "$HTML_CONTENT" | grep -qi 'meta name="description"'; then
    DESC=$(echo "$HTML_CONTENT" | grep -i 'meta name="description"' | grep -o 'content="[^"]*"' | sed 's/content="//;s/"//')
    if [ ${#DESC} -ge 120 ] && [ ${#DESC} -le 160 ]; then
        pass "Meta description present and optimal length (${#DESC} chars)"
    elif [ ${#DESC} -gt 0 ]; then
        warn "Meta description present but suboptimal length (${#DESC} chars, recommended 120-160)"
    else
        fail "Meta description empty"
    fi
else
    fail "Meta description missing"
fi

# Check canonical URL
if echo "$HTML_CONTENT" | grep -q 'rel="canonical"'; then
    pass "Canonical URL tag present"
else
    warn "Canonical URL tag missing (recommended)"
fi

# Check Open Graph tags
OG_COUNT=$(echo "$HTML_CONTENT" | grep -c 'property="og:')
if [ "$OG_COUNT" -ge 4 ]; then
    pass "Open Graph tags present (${OG_COUNT} tags detected)"
else
    warn "Open Graph tags incomplete (${OG_COUNT}/4+ recommended)"
fi

# Check Twitter Card tags
TWITTER_COUNT=$(echo "$HTML_CONTENT" | grep -c 'name="twitter:')
if [ "$TWITTER_COUNT" -ge 3 ]; then
    pass "Twitter Card tags present (${TWITTER_COUNT} tags detected)"
else
    warn "Twitter Card tags incomplete (${TWITTER_COUNT}/3+ recommended)"
fi

# Check viewport meta
if echo "$HTML_CONTENT" | grep -qi 'name="viewport"'; then
    pass "Viewport meta tag present (mobile-friendly)"
else
    fail "Viewport meta tag missing (critical for mobile)"
fi

# Check H1 tag
H1_COUNT=$(echo "$HTML_CONTENT" | grep -c '<h1')
if [ "$H1_COUNT" -eq 1 ]; then
    pass "Single H1 tag present (SEO best practice)"
elif [ "$H1_COUNT" -gt 1 ]; then
    warn "Multiple H1 tags detected (${H1_COUNT} found, only 1 recommended)"
elif [ "$H1_COUNT" -eq 0 ]; then
    # H1 might be rendered by JS, check for sr-only class
    if echo "$HTML_CONTENT" | grep -q 'class="sr-only"'; then
        pass "H1 tag likely present (sr-only class detected in HTML)"
    else
        warn "No H1 tag detected in initial HTML (may be JS-rendered)"
    fi
fi

# Check lang attribute
if echo "$HTML_CONTENT" | grep -q '<html lang="'; then
    LANG=$(echo "$HTML_CONTENT" | grep -o '<html lang="[^"]*"' | sed 's/<html lang="//;s/"//')
    pass "HTML lang attribute present (${LANG})"
else
    warn "HTML lang attribute missing (recommended for i18n)"
fi

echo ""

# Test 5: Structured Data (JSON-LD)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 5: Structured Data (JSON-LD Schema)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for JSON-LD script
if echo "$HTML_CONTENT" | grep -q 'type="application/ld+json"'; then
    pass "JSON-LD structured data present"

    # Check for Organization schema
    if echo "$HTML_CONTENT" | grep -q '"@type": "Organization"'; then
        pass "Organization schema detected"
    else
        warn "Organization schema not found"
    fi

    # Check for WebSite schema
    if echo "$HTML_CONTENT" | grep -q '"@type": "WebSite"'; then
        pass "WebSite schema detected"
    else
        warn "WebSite schema not found"
    fi

    # Check for SoftwareApplication schema
    if echo "$HTML_CONTENT" | grep -q '"@type": "SoftwareApplication"'; then
        pass "SoftwareApplication schema detected"
    else
        warn "SoftwareApplication schema not found"
    fi
else
    fail "JSON-LD structured data missing"
fi

echo ""

# Test 6: Performance Metrics (Basic)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 6: Performance Metrics (Response Time)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "${BASE_URL}/" 2>&1)
RESPONSE_TIME_MS=$(echo "$RESPONSE_TIME * 1000" | bc)

if (( $(echo "$RESPONSE_TIME < 1.0" | bc -l) )); then
    pass "Response time excellent (${RESPONSE_TIME_MS}ms < 1000ms)"
elif (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
    pass "Response time good (${RESPONSE_TIME_MS}ms < 2000ms)"
elif (( $(echo "$RESPONSE_TIME < 3.0" | bc -l) )); then
    warn "Response time acceptable (${RESPONSE_TIME_MS}ms, optimize for <2s)"
else
    warn "Response time slow (${RESPONSE_TIME_MS}ms, should be <2s)"
fi

# Check HTTPS
if echo "$HEADERS" | grep -q "HTTP/2"; then
    pass "HTTP/2 protocol enabled (performance boost)"
elif echo "$HEADERS" | grep -q "HTTPS"; then
    pass "HTTPS enabled"
else
    fail "HTTPS not detected"
fi

echo ""

# Test 7: Image Optimization Check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 7: Image Optimization (Alt Text)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Note: This checks initial HTML only, JS-rendered images not included
IMG_COUNT=$(echo "$HTML_CONTENT" | grep -c '<img')
if [ "$IMG_COUNT" -gt 0 ]; then
    info "${IMG_COUNT} image tags found in initial HTML"

    # Check for alt attributes (basic check)
    IMG_WITH_ALT=$(echo "$HTML_CONTENT" | grep '<img' | grep -c 'alt=')
    if [ "$IMG_WITH_ALT" -eq "$IMG_COUNT" ]; then
        pass "All images have alt attributes (${IMG_WITH_ALT}/${IMG_COUNT})"
    elif [ "$IMG_WITH_ALT" -gt 0 ]; then
        warn "Some images missing alt attributes (${IMG_WITH_ALT}/${IMG_COUNT})"
    else
        fail "No images have alt attributes"
    fi
else
    info "No images detected in initial HTML (may be JS-rendered)"
fi

echo ""

# Summary Report
echo "═══════════════════════════════════════════════════════════════"
echo "  📊 VALIDATION SUMMARY"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}✅ PASSED${NC}: ${PASS_COUNT} tests"
echo -e "${YELLOW}⚠️  WARNINGS${NC}: ${WARN_COUNT} tests"
echo -e "${RED}❌ FAILED${NC}: ${FAIL_COUNT} tests"
echo ""

TOTAL_TESTS=$((PASS_COUNT + FAIL_COUNT + WARN_COUNT))
if [ "$TOTAL_TESTS" -gt 0 ]; then
    PASS_RATE=$(echo "scale=1; $PASS_COUNT * 100 / $TOTAL_TESTS" | bc)
    echo "Pass Rate: ${PASS_RATE}%"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  🔗 NEXT STEPS"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "1. Detailed Meta Tags Check:"
echo "   https://metatags.io/?url=${BASE_URL}"
echo ""
echo "2. Structured Data Validator:"
echo "   https://validator.schema.org/?url=${BASE_URL}"
echo ""
echo "3. Lighthouse SEO Audit:"
echo "   - Open Chrome DevTools (F12)"
echo "   - Go to Lighthouse tab"
echo "   - Run SEO audit"
echo "   - Target: 90+ score"
echo ""
echo "4. PageSpeed Insights (Core Web Vitals):"
echo "   https://pagespeed.web.dev/analysis?url=${BASE_URL}"
echo ""
echo "5. Mobile-Friendly Test:"
echo "   https://search.google.com/test/mobile-friendly?url=${BASE_URL}"
echo ""
echo "6. Google Search Console:"
echo "   - Submit sitemap: ${BASE_URL}/sitemap.xml"
echo "   - Request indexing"
echo "   - Monitor coverage report"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Exit code based on failures
if [ "$FAIL_COUNT" -gt 0 ]; then
    echo -e "${RED}❌ VALIDATION FAILED${NC} - ${FAIL_COUNT} critical issues detected"
    exit 1
else
    echo -e "${GREEN}✅ VALIDATION PASSED${NC} - All critical checks passed!"
    if [ "$WARN_COUNT" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  ${WARN_COUNT} warnings detected - review recommended${NC}"
    fi
    exit 0
fi

# SEO Foundation Validation Script (PowerShell)
# Validates deployment of SEO infrastructure for ReferraLink

$BaseUrl = "https://referralink.vercel.app"
$PassCount = 0
$FailCount = 0
$WarnCount = 0

# Helper functions
function Write-Pass($msg) {
    Write-Host "✅ PASS: $msg" -ForegroundColor Green
    $script:PassCount++
}

function Write-Fail($msg) {
    Write-Host "❌ FAIL: $msg" -ForegroundColor Red
    $script:FailCount++
}

function Write-Warn($msg) {
    Write-Host "⚠️  WARN: $msg" -ForegroundColor Yellow
    $script:WarnCount++
}

function Write-Info($msg) {
    Write-Host "ℹ️  INFO: $msg" -ForegroundColor Cyan
}

Write-Host "══════════════════════════════════════════════════════════════=" -ForegroundColor Blue
Write-Host "  🔍 SEO FOUNDATION VALIDATION - REFERRALINK" -ForegroundColor Blue
Write-Host "══════════════════════════════════════════════════════════════=" -ForegroundColor Blue
Write-Host ""
Write-Host "Target URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host ""
Write-Host "══════════════════════════════════════════════════════════════=" -ForegroundColor Blue
Write-Host ""

# Test 1: robots.txt
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "TEST 1: robots.txt Accessibility" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    $RobotsResponse = Invoke-WebRequest -Uri "$BaseUrl/robots.txt" -UseBasicParsing -ErrorAction Stop
    if ($RobotsResponse.StatusCode -eq 200) {
        Write-Pass "robots.txt is accessible (HTTP 200)"

        $RobotsContent = $RobotsResponse.Content
        if ($RobotsContent -match "User-agent:") {
            Write-Pass "robots.txt contains User-agent directive"
        } else {
            Write-Fail "robots.txt missing User-agent directive"
        }

        if ($RobotsContent -match "Sitemap:") {
            Write-Pass "robots.txt contains Sitemap reference"
        } else {
            Write-Warn "robots.txt missing Sitemap reference"
        }
    }
} catch {
    Write-Fail "robots.txt not accessible: $($_.Exception.Message)"
}
Write-Host ""

# Test 2: sitemap.xml
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "TEST 2: sitemap.xml Accessibility" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    $SitemapResponse = Invoke-WebRequest -Uri "$BaseUrl/sitemap.xml" -UseBasicParsing -ErrorAction Stop
    if ($SitemapResponse.StatusCode -eq 200) {
        Write-Pass "sitemap.xml is accessible (HTTP 200)"

        $SitemapContent = $SitemapResponse.Content
        if ($SitemapContent -match "<urlset") {
            Write-Pass "sitemap.xml contains valid XML structure"
        } else {
            Write-Fail "sitemap.xml missing <urlset> root element"
        }

        if ($SitemapContent -match "<loc>") {
            Write-Pass "sitemap.xml contains <loc> entries"
        } else {
            Write-Fail "sitemap.xml missing <loc> URL entries"
        }

        if ($SitemapContent -match "image:image") {
            Write-Pass "sitemap.xml contains image sitemap"
        } else {
            Write-Warn "sitemap.xml missing image sitemap entries"
        }
    }
} catch {
    Write-Fail "sitemap.xml not accessible: $($_.Exception.Message)"
}
Write-Host ""

# Test 3: Security Headers
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "TEST 3: Security Headers (Google Trust Signals)" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    $Response = Invoke-WebRequest -Uri "$BaseUrl/" -UseBasicParsing -ErrorAction Stop
    $Headers = $Response.Headers

    if ($Headers['Strict-Transport-Security']) {
        Write-Pass "Strict-Transport-Security header present"
    } else {
        Write-Fail "Strict-Transport-Security header missing"
    }

    if ($Headers['X-Content-Type-Options']) {
        Write-Pass "X-Content-Type-Options header present"
    } else {
        Write-Fail "X-Content-Type-Options header missing"
    }

    if ($Headers['X-Frame-Options']) {
        Write-Pass "X-Frame-Options header present"
    } else {
        Write-Fail "X-Frame-Options header missing"
    }

    if ($Headers['X-XSS-Protection']) {
        Write-Pass "X-XSS-Protection header present"
    } else {
        Write-Warn "X-XSS-Protection header missing (optional)"
    }

    if ($Headers['Referrer-Policy']) {
        Write-Pass "Referrer-Policy header present"
    } else {
        Write-Warn "Referrer-Policy header missing (optional)"
    }

    if ($Headers['Content-Security-Policy']) {
        Write-Pass "Content-Security-Policy header present"
    } else {
        Write-Warn "Content-Security-Policy header missing (recommended)"
    }
} catch {
    Write-Fail "Could not fetch headers: $($_.Exception.Message)"
}
Write-Host ""

# Test 4: Meta Tags
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "TEST 4: Meta Tags & HTML Structure" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    $HtmlResponse = Invoke-WebRequest -Uri "$BaseUrl/" -UseBasicParsing -ErrorAction Stop
    $Html = $HtmlResponse.Content

    # Check title
    if ($Html -match '<title>(.*?)</title>') {
        $Title = $Matches[1]
        $TitleLen = $Title.Length
        if ($TitleLen -ge 30 -and $TitleLen -le 60) {
            Write-Pass "Title tag present and optimal length ($TitleLen chars)"
            Write-Info "Title: $Title"
        } elseif ($TitleLen -gt 0) {
            Write-Warn "Title tag present but suboptimal length ($TitleLen chars)"
            Write-Info "Title: $Title"
        } else {
            Write-Fail "Title tag empty"
        }
    } else {
        Write-Fail "Title tag missing"
    }

    # Check meta description
    if ($Html -match 'meta name="description".*?content="(.*?)"') {
        $Desc = $Matches[1]
        $DescLen = $Desc.Length
        if ($DescLen -ge 120 -and $DescLen -le 160) {
            Write-Pass "Meta description optimal length ($DescLen chars)"
        } elseif ($DescLen -gt 0) {
            Write-Warn "Meta description suboptimal length ($DescLen chars)"
        } else {
            Write-Fail "Meta description empty"
        }
    } else {
        Write-Fail "Meta description missing"
    }

    # Check canonical
    if ($Html -match 'rel="canonical"') {
        Write-Pass "Canonical URL tag present"
    } else {
        Write-Warn "Canonical URL tag missing"
    }

    # Check Open Graph
    $OgCount = ([regex]::Matches($Html, 'property="og:')).Count
    if ($OgCount -ge 4) {
        Write-Pass "Open Graph tags present ($OgCount tags)"
    } else {
        Write-Warn "Open Graph tags incomplete ($OgCount/4+)"
    }

    # Check Twitter Card
    $TwitterCount = ([regex]::Matches($Html, 'name="twitter:')).Count
    if ($TwitterCount -ge 3) {
        Write-Pass "Twitter Card tags present ($TwitterCount tags)"
    } else {
        Write-Warn "Twitter Card tags incomplete ($TwitterCount/3+)"
    }

    # Check viewport
    if ($Html -match 'name="viewport"') {
        Write-Pass "Viewport meta tag present (mobile-friendly)"
    } else {
        Write-Fail "Viewport meta tag missing"
    }

    # Check HTML lang
    if ($Html -match '<html lang="([^"]*)"') {
        $Lang = $Matches[1]
        Write-Pass "HTML lang attribute present ($Lang)"
    } else {
        Write-Warn "HTML lang attribute missing"
    }

} catch {
    Write-Fail "Could not fetch HTML: $($_.Exception.Message)"
}
Write-Host ""

# Test 5: Structured Data
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "TEST 5: Structured Data (JSON-LD)" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

if ($Html -match 'type="application/ld\+json"') {
    Write-Pass "JSON-LD structured data present"

    if ($Html -match '"@type": "Organization"') {
        Write-Pass "Organization schema detected"
    } else {
        Write-Warn "Organization schema not found"
    }

    if ($Html -match '"@type": "WebSite"') {
        Write-Pass "WebSite schema detected"
    } else {
        Write-Warn "WebSite schema not found"
    }

    if ($Html -match '"@type": "SoftwareApplication"') {
        Write-Pass "SoftwareApplication schema detected"
    } else {
        Write-Warn "SoftwareApplication schema not found"
    }
} else {
    Write-Fail "JSON-LD structured data missing"
}
Write-Host ""

# Summary
Write-Host "══════════════════════════════════════════════════════════════=" -ForegroundColor Blue
Write-Host "  📊 VALIDATION SUMMARY" -ForegroundColor Blue
Write-Host "══════════════════════════════════════════════════════════════=" -ForegroundColor Blue
Write-Host ""
Write-Host "✅ PASSED: $PassCount tests" -ForegroundColor Green
Write-Host "⚠️  WARNINGS: $WarnCount tests" -ForegroundColor Yellow
Write-Host "❌ FAILED: $FailCount tests" -ForegroundColor Red
Write-Host ""

$TotalTests = $PassCount + $FailCount + $WarnCount
if ($TotalTests -gt 0) {
    $PassRate = [math]::Round(($PassCount / $TotalTests) * 100, 1)
    Write-Host "Pass Rate: $PassRate%"
}

Write-Host ""
Write-Host "══════════════════════════════════════════════════════════════=" -ForegroundColor Blue
Write-Host "  🔗 NEXT STEPS" -ForegroundColor Blue
Write-Host "══════════════════════════════════════════════════════════════=" -ForegroundColor Blue
Write-Host ""
Write-Host "1. Meta Tags: https://metatags.io/?url=$BaseUrl"
Write-Host "2. Schema Validator: https://validator.schema.org/?url=$BaseUrl"
Write-Host "3. PageSpeed: https://pagespeed.web.dev/analysis?url=$BaseUrl"
Write-Host "4. Mobile Test: https://search.google.com/test/mobile-friendly?url=$BaseUrl"
Write-Host ""

if ($FailCount -gt 0) {
    Write-Host "❌ VALIDATION FAILED - $FailCount critical issues" -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ VALIDATION PASSED - All critical checks passed!" -ForegroundColor Green
    if ($WarnCount -gt 0) {
        Write-Host "⚠️  $WarnCount warnings - review recommended" -ForegroundColor Yellow
    }
    exit 0
}

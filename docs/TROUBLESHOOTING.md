# Troubleshooting Guide

This guide helps you resolve common issues when using or developing Referralink.

## Table of Contents
- [Installation Issues](#installation-issues)
- [Development Server Issues](#development-server-issues)
- [API & Integration Issues](#api--integration-issues)
- [Build & Deployment Issues](#build--deployment-issues)
- [TypeScript Issues](#typescript-issues)
- [Browser & UI Issues](#browser--ui-issues)
- [Performance Issues](#performance-issues)
- [Environment Variables](#environment-variables)
- [Git Issues](#git-issues)
- [FAQ](#faq)

---

## Installation Issues

### Problem: `npm install` fails with permission denied

**Symptoms:**
```
npm ERR! Error: EACCES: permission denied
npm ERR! syscall mkdir
```

**Solutions:**
```bash
# Option 1: Use sudo (not recommended)
sudo npm install

# Option 2: Fix npm permissions (recommended)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Option 3: Change npm directory permissions
sudo chown -R $(whoami) /usr/local/lib/node_modules
sudo chown -R $(whoami) /usr/local/bin
```

### Problem: `npm install` hangs or times out

**Symptoms:**
- Installation appears stuck
- Process runs for 10+ minutes
- Network timeout errors

**Solutions:**
```bash
# Increase npm timeout
npm install --timeout=600000

# Clear npm cache
npm cache clean --force

# Try alternative registry
npm install --registry https://registry.npmjs.org/

# Use pnpm instead (faster)
pnpm install
```

### Problem: Module version conflicts

**Symptoms:**
```
npm ERR! peer dep missing: react@18, installed: react@19
```

**Solutions:**
```bash
# Force resolve conflicts
npm install --legacy-peer-deps

# Or update all dependencies
npm update

# Check what's conflicting
npm ls
```

---

## Development Server Issues

### Problem: Port 5173 already in use

**Symptoms:**
```
Error: listen EADDRINUSE :::5173
Port 5173 is in use by another process
```

**Solutions:**
```bash
# Find process using the port (macOS/Linux)
lsof -i :5173

# Kill the process
kill -9 <PID>

# Or use different port
npm run dev -- --port 3000

# For Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Problem: Development server won't start

**Symptoms:**
```
Failed to start development server
ENOENT: no such file or directory
```

**Solutions:**
```bash
# Verify you're in correct directory
pwd
ls -la vite.config.ts

# Restart development server
npm run dev

# Check for corrupted installation
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Problem: Hot module replacement (HMR) not working

**Symptoms:**
- Changes not reflecting in browser
- Page doesn't reload automatically
- Need manual browser refresh

**Solutions:**
```bash
# Restart development server
npm run dev

# Clear browser cache
# In Chrome DevTools: Application → Clear Storage → Clear All

# Check Vite config
cat vite.config.ts

# Try hard refresh
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (macOS)
```

---

## API & Integration Issues

### Problem: Gemini API key not working

**Symptoms:**
```
401 Unauthorized
Invalid API key provided
```

**Solutions:**
1. Verify API key in `.env.local`
   ```bash
   cat .env.local | grep GEMINI
   ```

2. Check key validity:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Verify key hasn't expired
   - Check if key is enabled

3. Verify environment variable format:
   ```
   VITE_GEMINI_API_KEY=your_actual_key_here
   ```

4. Restart development server after changing `.env.local`

### Problem: API rate limit exceeded

**Symptoms:**
```
429 Too Many Requests
Rate limit exceeded
```

**Solutions:**
1. **Immediate:** Wait and retry after cooldown period
2. **Short-term:** Implement caching
   ```typescript
   const cache = new Map();

   async function cachedAnalysis(data: string) {
     if (cache.has(data)) {
       return cache.get(data);
     }
     const result = await analyzeWithGemini(data);
     cache.set(data, result);
     return result;
   }
   ```

3. **Long-term:** Upgrade API tier
4. **Implement backoff:**
   ```typescript
   async function callWithBackoff(fn, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         const delay = Math.pow(2, i) * 1000;
         await new Promise(r => setTimeout(r, delay));
       }
     }
   }
   ```

### Problem: CORS error when calling API

**Symptoms:**
```
Access to XMLHttpRequest has been blocked by CORS policy
Cross-Origin Request Blocked
```

**Solutions:**
1. **Vite Proxy Configuration:**
   ```typescript
   // vite.config.ts
   export default {
     server: {
       proxy: {
         '/api': {
           target: 'https://api.example.com',
           changeOrigin: true,
           rewrite: (path) => path.replace(/^\/api/, '')
         }
       }
     }
   }
   ```

2. **Backend Proxy:**
   - Move API calls to backend
   - Call backend from frontend
   - Backend handles API calls to external services

### Problem: API timeout errors

**Symptoms:**
```
Request timeout after 30000ms
Connection timeout
```

**Solutions:**
```bash
# Increase timeout in .env.local
VITE_API_TIMEOUT=60000

# Check network connection
ping api.google.com

# Reduce payload size
# - Simplify data structure
# - Compress before sending
# - Batch smaller requests

# Check API service status
# - Visit provider's status page
# - Check service health
```

---

## Build & Deployment Issues

### Problem: `npm run build` fails

**Symptoms:**
```
error during build:
SyntaxError: Unexpected token
```

**Solutions:**
```bash
# Clear build cache
rm -rf dist/

# Check TypeScript
npx tsc --noEmit

# Run build with more details
npm run build -- --debug

# Check for missing dependencies
npm ls
```

### Problem: Build output too large

**Symptoms:**
- dist/ folder > 500KB
- Slow deployment
- Poor performance

**Solutions:**
```bash
# Analyze bundle
npm install -D rollup-plugin-visualizer

# Update vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer({
      open: true,
    }),
  ],
};

# Find and remove unused code
# Lazy load components
# Code split for routes
```

### Problem: Deployment fails

**Symptoms:**
- Build succeeds locally but fails on server
- Environment variables not available
- Dependencies missing

**Solutions:**

**For Vercel:**
```bash
# Test locally
npm run preview

# Check Vercel config
cat vercel.json

# Verify environment variables are set
# - Go to Vercel Dashboard
# - Settings → Environment Variables
# - Add all VITE_* variables
```

**For Netlify:**
```bash
# Test build
npm run build

# Check netlify.toml
cat netlify.toml

# Verify build command
# Should be: npm run build

# Verify publish directory
# Should be: dist
```

**For Docker:**
```dockerfile
# Ensure all args are passed
FROM node:20-alpine
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY}
```

---

## TypeScript Issues

### Problem: TypeScript compilation errors

**Symptoms:**
```
error TS2307: Cannot find module '@/types'
error TS7006: Parameter has no type
```

**Solutions:**
```bash
# Update TypeScript
npm install --save-dev typescript@latest

# Generate types
npx tsc --declaration

# Check tsconfig.json
cat tsconfig.json

# Strict mode issues
# If too strict, set in tsconfig.json:
# "strict": false
```

### Problem: Type mismatch in components

**Symptoms:**
```
Property 'xyz' does not exist on type 'Props'
Type 'string' is not assignable to type 'number'
```

**Solutions:**
```typescript
// Check component props
interface Props {
  title: string;      // ✅ Correct type
  count: number;      // ✅ Correct type
  onClose?: () => void; // ✅ Optional
}

// Use type assertion carefully
const value = someData as DataType;

// Use satisfies for better type checking
const config = {
  name: 'app',
  version: 1,
} satisfies AppConfig;
```

---

## Browser & UI Issues

### Problem: Component not rendering

**Symptoms:**
- Component missing from page
- Blank screen
- Element appears in DOM but not visible

**Solutions:**
```javascript
// Check console for errors
// F12 → Console tab

// Verify component is mounted
console.log('Component mounted');

// Check CSS visibility
// F12 → Elements → Check styles
// Look for: display: none, opacity: 0, etc.

// Check parent constraints
// May need flex, height, width on parent
```

### Problem: Styling not applying

**Symptoms:**
- Tailwind classes not working
- Custom CSS not applied
- Inline styles override everything

**Solutions:**
```bash
# Rebuild Tailwind
npm run build

# Clear browser cache
# F12 → Application → Clear Storage

# Check Tailwind config
cat tailwind.config.js

# Verify CSS file is imported
# Check index.css is imported in index.tsx
```

### Problem: Responsive design not working

**Symptoms:**
- Mobile view doesn't match desktop
- Breakpoints not applying
- Layout broken on small screens

**Solutions:**
```jsx
// Use Tailwind responsive classes
<div className="
  w-full
  md:w-1/2      // 768px+
  lg:w-1/3      // 1024px+
  xl:w-1/4      // 1280px+
">
  Content
</div>

// Test responsive design
// F12 → Toggle device toolbar (Ctrl+Shift+M)
// Test at: 320px, 768px, 1024px, 1920px
```

---

## Performance Issues

### Problem: Slow page load

**Symptoms:**
- Takes > 3 seconds to load
- CPU maxed out
- Browser becomes unresponsive

**Solutions:**
```bash
# Analyze bundle size
npm run build
ls -lh dist/assets/

# Check Core Web Vitals
# Use Google Lighthouse
# F12 → Lighthouse → Analyze

# Optimize images
# - Use modern formats (WebP)
# - Compress before uploading
# - Lazy load images

# Code splitting
// Lazy load components
const Dashboard = React.lazy(() => import('./Dashboard'));

<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

### Problem: High memory usage

**Symptoms:**
- Browser tab uses > 500MB RAM
- System becomes slow
- Chrome DevTools shows high memory

**Solutions:**
```typescript
// Avoid memory leaks
useEffect(() => {
  const handler = () => console.log('Handler');

  // ✅ Always cleanup
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);

// Avoid large state objects
// Split into smaller contexts/stores

// Profile memory in DevTools
// F12 → Memory → Record allocation timeline
```

---

## Environment Variables

### Problem: Environment variables not loading

**Symptoms:**
```
process.env.VITE_API_KEY is undefined
Missing environment variable
```

**Solutions:**
```bash
# 1. Verify .env.local exists
ls -la .env.local

# 2. Check variable names start with VITE_
cat .env.local

# 3. Restart development server
npm run dev

# 4. Check if variables are accessible
console.log(import.meta.env.VITE_API_KEY);
```

### Problem: Variables work locally but not in production

**Symptoms:**
- Works on localhost
- Fails after deployment
- Undefined in production build

**Solutions:**
```typescript
// Use import.meta.env in Vite
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// NOT process.env (Node.js only)
// const apiKey = process.env.VITE_GEMINI_API_KEY; ❌

// For deployment platforms:
// Vercel: Settings → Environment Variables
// Netlify: Settings → Build & Deploy → Environment
// Docker: Pass as build args or env variables
```

---

## Git Issues

### Problem: Cannot push to branch

**Symptoms:**
```
fatal: 'origin/branch' does not appear to be a 'git' repository
Permission denied (publickey)
```

**Solutions:**
```bash
# Check remote URL
git remote -v

# Update remote (if incorrect)
git remote set-url origin https://github.com/DocSynapse/Referralink.git

# For SSH key issues
ssh -T git@github.com

# Generate new SSH key if needed
ssh-keygen -t ed25519 -C "your-email@example.com"
```

### Problem: Large files prevent push

**Symptoms:**
```
fatal: The remote end hung up unexpectedly
File too large to push
```

**Solutions:**
```bash
# Check file sizes
find . -size +50M

# Remove large files before commit
git rm --cached <large-file>
echo <large-file> >> .gitignore
git commit -m "Remove large file"

# For already committed large files
git filter-branch --tree-filter 'rm -f <large-file>' HEAD
```

---

## FAQ

### Q: How do I update dependencies?

**A:**
```bash
# Check outdated packages
npm outdated

# Update all
npm update

# Update specific package
npm install package@latest

# Check for security issues
npm audit
npm audit fix
```

### Q: How do I switch Node.js versions?

**A:**
```bash
# Using nvm (Node Version Manager)
nvm list
nvm install 18
nvm use 18

# Or use fnm
fnm list
fnm install 18
fnm use 18
```

### Q: How do I contribute fixes?

**A:** See [CONTRIBUTING.md](../CONTRIBUTING.md)

### Q: Where do I report bugs?

**A:**
1. Check existing [GitHub Issues](https://github.com/DocSynapse/Referralink/issues)
2. Click "New Issue" → "Bug Report"
3. Provide detailed information
4. Submit!

### Q: How do I get help?

**A:**
- Check this troubleshooting guide
- Search GitHub issues
- Open a GitHub discussion
- Contact maintainers

---

## Still Having Issues?

1. **Search:** Check GitHub Issues and Discussions
2. **Document:** Note exact error message and steps to reproduce
3. **Report:** Open GitHub Issue with:
   - Error message (full text)
   - Steps to reproduce
   - Your environment (OS, Node version, etc.)
   - What you've already tried
4. **Wait:** Maintainers will respond as soon as possible

---

**Last Updated:** January 2025

# Development Guide

This guide provides detailed information for developers working on Referralink.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Development Workflow](#development-workflow)
- [Project Architecture](#project-architecture)
- [Key Technologies](#key-technologies)
- [Development Commands](#development-commands)
- [Code Structure](#code-structure)
- [Testing Strategy](#testing-strategy)
- [Building & Deployment](#building--deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required
- **Node.js** 16.x or higher (18+ recommended)
- **npm** 8.x or higher (or pnpm/yarn)
- **Git** 2.30+
- **Text Editor/IDE** (VSCode recommended)

### Optional but Recommended
- **Docker** - For containerized development
- **PostgreSQL** - For future database support
- **Redis** - For caching (future)

### System Requirements
- **RAM:** 4GB minimum (8GB recommended)
- **Disk Space:** 2GB free
- **OS:** macOS, Linux, or Windows (WSL2)

---

## Project Setup

### 1. Clone Repository

```bash
git clone https://github.com/DocSynapse/Referralink.git
cd Referralink
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env.local

# Edit with your credentials
# For macOS/Linux:
nano .env.local

# For Windows:
notepad .env.local
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 5. Verify Setup

```bash
# Run type check
npx tsc --noEmit

# Verify build
npm run build

# Preview build
npm run preview
```

---

## Development Workflow

### Creating a New Feature

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Make Changes**
   - Edit files in `src/`
   - Hot reload automatically refreshes changes

4. **Test Your Changes**
   - Manual testing in browser
   - Verify no console errors
   - Test on mobile (use Chrome DevTools)

5. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add my feature"
   ```

6. **Push and Create PR**
   ```bash
   git push origin feature/my-feature
   ```

### Debugging

#### Console Debugging
```typescript
// Good: Use for development only
console.log('Debug info:', data);

// Better: Use conditional logging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

#### Browser DevTools
1. Open DevTools (F12 or Cmd+Option+I)
2. Check Console tab for errors
3. Use Sources tab to set breakpoints
4. Use Network tab to inspect API calls

#### Visual Studio Code Debugging
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

---

## Project Architecture

### High-Level Overview

```
┌─────────────────────────────────────────┐
│         Browser / Client (React)         │
├─────────────────────────────────────────┤
│          Referralink UI Components       │
│  (src/components, src/App.tsx)          │
├─────────────────────────────────────────┤
│        Business Logic Services          │
│  (src/services/, src/lib/)              │
├─────────────────────────────────────────┤
│         API Integrations                │
│  (Gemini, DeepSeek, OpenAI)             │
├─────────────────────────────────────────┤
│    External APIs & Services             │
│  (AI Providers, Cloud Services)         │
└─────────────────────────────────────────┘
```

### Component Architecture

```
App (Root Component)
├── Header Component
├── Main Content Area
│   ├── Dashboard
│   ├── Data Input Form
│   └── Results View
├── Sidebar (optional)
└── Footer
```

### Data Flow

```
User Input
    ↓
Component State (React)
    ↓
Service Layer (Business Logic)
    ↓
API Call (Gemini/DeepSeek)
    ↓
Response Processing
    ↓
State Update
    ↓
Component Re-render
    ↓
User Sees Results
```

---

## Key Technologies

### Frontend Framework
- **React 19.2.1** - UI framework
- **TypeScript 5.8.2** - Type safety
- **Vite 6.2.0** - Build tool

### Styling
- **Tailwind CSS 4.1.18** - Utility-first CSS
- **Lucide React** - Icon library
- **Framer Motion 12.29.0** - Animations

### UI Components
- **Material Web 2.4.1** - Material Design components

### AI Integration
- **OpenAI 6.16.0** - AI API client
- **Custom API handlers** - Gemini, DeepSeek

### Build & Development
- **PostCSS** - CSS processing
- **npm** - Package management

---

## Development Commands

### Common Commands

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Type check without emitting
npx tsc --noEmit

# Check for vulnerabilities
npm audit

# View dependency tree
npm ls

# Update dependencies
npm update
```

### Custom Scripts (when added)

```bash
# Run tests (when implemented)
npm run test

# Run E2E tests (when implemented)
npm run test:e2e

# Generate coverage report (when implemented)
npm run test:coverage

# Format code (when configured)
npm run format

# Lint code (when configured)
npm run lint
```

---

## Code Structure

### Directory Layout

```
src/
├── components/           # Reusable React components
│   ├── Header.tsx
│   ├── Dashboard.tsx
│   ├── DataForm.tsx
│   └── [other components]
├── services/            # Business logic & API
│   ├── api-service.ts   # API calls
│   ├── ai-service.ts    # AI integrations
│   └── [other services]
├── lib/                 # Utilities & helpers
│   ├── utils.ts
│   ├── constants.ts
│   └── [helpers]
├── App.tsx              # Root component
├── index.tsx            # React entry point
├── index.css            # Global styles
├── types.ts             # TypeScript definitions
└── constants.ts         # App constants
```

### Component Structure

```typescript
// Example component structure
import React from 'react';
import { ComponentProps } from '../types';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  onAction,
}) => {
  const [state, setState] = React.useState<string>('');

  const handleClick = () => {
    // Handle logic
    onAction?.();
  };

  return (
    <div className="flex items-center justify-center p-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Action
      </button>
    </div>
  );
};

export default MyComponent;
```

### Service Structure

```typescript
// Example service structure
export class APIService {
  private baseUrl = process.env.VITE_API_URL;
  private apiKey = process.env.VITE_GEMINI_API_KEY;

  async analyzeData(data: unknown): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    }
  }
}

export const apiService = new APIService();
```

---

## Testing Strategy

### Unit Testing (Planned)

```typescript
// Example test structure
import { describe, it, expect } from 'vitest';
import { calculateTotal } from '../lib/utils';

describe('calculateTotal', () => {
  it('should sum two numbers', () => {
    expect(calculateTotal(2, 3)).toBe(5);
  });

  it('should handle negative numbers', () => {
    expect(calculateTotal(-2, 3)).toBe(1);
  });
});
```

### Integration Testing (Planned)

```typescript
// Example integration test
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../components/MyComponent';

describe('MyComponent Integration', () => {
  it('should render and handle user interaction', async () => {
    render(<MyComponent title="Test" />);
    const heading = screen.getByText('Test');
    expect(heading).toBeInTheDocument();
  });
});
```

### Manual Testing Checklist

- [ ] Component renders without errors
- [ ] User interactions work correctly
- [ ] Data flows through components properly
- [ ] API calls succeed and fail gracefully
- [ ] Responsive on mobile (< 768px)
- [ ] Responsive on tablet (768px - 1024px)
- [ ] Responsive on desktop (> 1024px)
- [ ] No console errors or warnings
- [ ] Performance is acceptable

---

## Building & Deployment

### Production Build

```bash
# Build optimized production bundle
npm run build

# Check build output
ls -la dist/

# Preview production build
npm run preview
```

### Build Output

```
dist/
├── index.html         # Main HTML file
├── assets/
│   ├── index-xxx.js   # Bundled JavaScript
│   ├── index-xxx.css  # Bundled CSS
│   └── [other assets]
└── [static files]
```

### Deployment Platforms

#### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

#### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## Troubleshooting

### Issue: Port 5173 Already in Use

**Solution:**
```bash
# Kill process using port 5173 (macOS/Linux)
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or specify different port
npm run dev -- --port 3000
```

### Issue: Module Not Found Errors

**Solution:**
```bash
# Clean node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or with pnpm
pnpm install --force
```

### Issue: TypeScript Errors

**Solution:**
```bash
# Regenerate TypeScript cache
npx tsc --build --clean
npx tsc --build
```

### Issue: Hot Reload Not Working

**Solution:**
1. Check if file saved properly
2. Restart development server: `Ctrl+C` then `npm run dev`
3. Clear browser cache (F12 → Application → Clear Storage)
4. Check for syntax errors

### Issue: Environment Variables Not Loading

**Solution:**
1. Verify `.env.local` exists in root directory
2. Ensure variable names start with `VITE_`
3. Restart development server
4. Check `.gitignore` includes `.env.local`

### Issue: Build Fails

**Solution:**
```bash
# Clear build cache
rm -rf dist/

# Clear npm cache
npm cache clean --force

# Rebuild
npm run build
```

---

## Best Practices

### Code Quality
- ✅ Use TypeScript for type safety
- ✅ Keep components small and focused
- ✅ Extract reusable logic to services
- ✅ Write clear, descriptive variable names
- ✅ Add comments for complex logic
- ✅ Follow project conventions

### Performance
- ✅ Lazy load components when possible
- ✅ Memoize expensive computations
- ✅ Optimize images and assets
- ✅ Use React DevTools Profiler
- ✅ Monitor bundle size

### Security
- ✅ Never commit secrets or API keys
- ✅ Validate user inputs
- ✅ Sanitize HTML/user content
- ✅ Use HTTPS for API calls
- ✅ Keep dependencies updated

### Documentation
- ✅ Comment non-obvious code
- ✅ Update README when changing setup
- ✅ Document new features
- ✅ Update CHANGELOG for releases

---

## Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Material Design](https://material.io/)

---

## Getting Help

- Check existing documentation
- Review GitHub issues
- Open a new issue with details
- Ask in discussions
- Contact maintainers

---

**Last Updated:** January 2025

# Contributing to Referralink

Thank you for your interest in contributing to Referralink! 🎉 We welcome contributions from the community and are excited to help you get involved.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Message Convention](#commit-message-convention)
- [Submitting Changes](#submitting-changes)
- [Code Review Process](#code-review-process)
- [Testing](#testing)
- [Code Style](#code-style)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the maintainers.

## Getting Started

### Prerequisites
- Node.js 16.x or higher (18+ recommended)
- npm 8.x or higher (or pnpm/yarn)
- Git
- GitHub account

### Fork and Clone

1. **Fork the repository** on GitHub
   - Click the "Fork" button at the top right of the repository

2. **Clone your fork** locally
   ```bash
   git clone https://github.com/YOUR-USERNAME/Referralink.git
   cd Referralink
   ```

3. **Add upstream remote** to stay in sync
   ```bash
   git remote add upstream https://github.com/DocSynapse/Referralink.git
   git fetch upstream
   ```

## Development Setup

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Create Environment File
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Verify Setup
```bash
# Type check
npx tsc --noEmit

# Build check
npm run build
```

## Making Changes

### 1. Create a Feature Branch

```bash
# Update your local main branch
git fetch upstream
git checkout main
git merge upstream/main

# Create a feature branch
git checkout -b feature/amazing-feature
# or for bug fixes
git checkout -b fix/bug-description
```

**Branch naming convention:**
- Features: `feature/feature-name`
- Bug fixes: `fix/bug-description`
- Docs: `docs/what-you-improved`
- Chores: `chore/what-you-changed`

### 2. Make Your Changes

- Keep changes focused and coherent
- Add or update tests as needed
- Update documentation if applicable
- Run code quality checks frequently

### 3. Commit Your Changes

#### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type:**
- `feat` - A new feature
- `fix` - A bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, missing semicolons, etc.)
- `refactor` - Code refactoring without changing functionality
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks, dependency updates
- `ci` - CI/CD configuration changes

**Scope** (optional):
The part of the system being modified:
- `ui`, `api`, `core`, `components`, `services`, `types`, etc.

**Subject:**
- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter
- No period (.) at the end
- Limit to 50 characters

**Body** (optional):
- Explain what and why, not how
- Wrap at 72 characters
- Separate from subject by blank line

**Footer** (optional):
- Reference issues: `Closes #123`
- Breaking changes: `BREAKING CHANGE: description`

#### Examples

```
feat(auth): add JWT token validation

Implement JWT token validation for API endpoints to improve security.
Tokens are now validated on every request.

Closes #42
```

```
fix(components): resolve button text overflow

Adjust button component padding and text wrapping to prevent text
overflow on mobile devices. Added CSS property overflow: hidden
and proper line-height adjustment.
```

```
docs(readme): update installation instructions

Clarify the steps for setting up the development environment,
including environment variable configuration.
```

```
refactor(services): simplify API service

Extract common request handling logic into separate function
to reduce code duplication across endpoints.
```

### 4. Commit Frequently

```bash
# Stage specific files
git add src/components/MyComponent.tsx

# Or stage all changes
git add .

# Commit with message
git commit -m "feat(components): add new component"

# Push to your fork
git push origin feature/amazing-feature
```

## Submitting Changes

### 1. Push Your Branch
```bash
git push origin feature/amazing-feature
```

### 2. Create a Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request" button
3. Fill in the PR template with:
   - Clear description of changes
   - Type of change (bug fix, feature, etc.)
   - Related issue number (if any)
   - Testing notes
   - Screenshots (if applicable)

4. Ensure CI/CD checks pass

### 3. PR Title Format

Follow the same convention as commit messages:
```
feat(scope): brief description
fix(scope): brief description
docs(scope): brief description
```

## Code Review Process

### Guidelines for Reviewers
- Be respectful and constructive
- Focus on code quality and maintainability
- Ask questions to understand intent
- Suggest improvements, don't demand changes

### Addressing Feedback
1. Review comments carefully
2. Make requested changes
3. Commit with descriptive message
4. Push updated changes
5. Respond to comments
6. Request re-review if needed

### Approval and Merge
- Requires at least 1 approval from maintainers
- All automated checks must pass
- Branch must be up-to-date with main

## Testing

### Running Tests
```bash
# Unit tests (when implemented)
npm run test

# E2E tests (when implemented)
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Writing Tests
- Write tests for new features
- Update tests when modifying existing features
- Keep tests focused and maintainable
- Test user behavior, not implementation details

### Test File Naming
- Unit tests: `ComponentName.test.ts` or `ComponentName.test.tsx`
- E2E tests: `feature.e2e.test.ts`

## Code Style

### TypeScript/JavaScript

**General Rules:**
- Use TypeScript for type safety
- Prefer `const` over `let`, avoid `var`
- Use arrow functions for callbacks
- Use template literals for strings
- Destructure when appropriate

**Example:**
```typescript
// Good
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US').format(date);
};

// Avoid
var formatDate = function(date) {
  return new Intl.DateTimeFormat('en-US').format(date);
};
```

### React Components

**Functional Components:**
```typescript
interface ComponentProps {
  title: string;
  onClose?: () => void;
}

export const MyComponent: React.FC<ComponentProps> = ({
  title,
  onClose,
}) => {
  return (
    <div>
      <h1>{title}</h1>
      {onClose && <button onClick={onClose}>Close</button>}
    </div>
  );
};
```

### CSS/Tailwind

- Use Tailwind CSS classes for styling
- Follow Tailwind's utility-first approach
- Keep custom CSS minimal
- Use semantic HTML

```jsx
// Good
<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
  Click me
</button>

// Avoid
<button style={{ backgroundColor: 'blue', color: 'white' }}>
  Click me
</button>
```

### Formatting

- 2 spaces for indentation
- Single quotes for strings (when not in JSX)
- Semicolons at end of statements
- Max line length: 100 characters (when possible)

## Documentation

### README Updates
Update `README.md` if you:
- Add new features
- Change installation steps
- Modify project structure
- Add new dependencies

### Code Comments
- Comment why, not what
- Keep comments concise
- Update comments when changing code
- Don't leave TODO comments without context

### JSDoc (Optional but appreciated)
```typescript
/**
 * Calculate the sum of two numbers
 * @param a - The first number
 * @param b - The second number
 * @returns The sum of a and b
 */
const add = (a: number, b: number): number => {
  return a + b;
};
```

### CHANGELOG Updates
When submitting a significant change, add entry to `CHANGELOG.md`:

```markdown
### Added
- [Brief description of your addition]

### Fixed
- [Brief description of your fix]

### Changed
- [Brief description of your change]
```

## Common Workflows

### Syncing Your Fork

```bash
# Fetch latest changes
git fetch upstream

# Rebase your branch
git rebase upstream/main

# Force push (use with caution)
git push origin feature/amazing-feature --force-with-lease
```

### Updating After Main Changes

```bash
# If your PR conflicts with main
git fetch upstream
git rebase upstream/main

# Resolve conflicts in your editor
# Then continue
git rebase --continue
git push origin feature/amazing-feature --force-with-lease
```

## Getting Help

- **Questions?** Open an issue labeled `question`
- **Need guidance?** Comment on the issue you're working on
- **Found a bug?** See [SECURITY.md](SECURITY.md) or open a bug report
- **Have feedback?** Start a discussion

## Recognition

Contributors are recognized in:
- Git commit history
- GitHub contributors page
- Release notes (for significant contributions)

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Guides](https://guides.github.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

Thank you for contributing to Referralink! Your efforts help make this project better. 🚀

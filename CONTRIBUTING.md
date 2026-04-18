# Contributing to EventFlex

Thank you for your interest in contributing to EventFlex! This document provides guidelines and instructions for participating in the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow
- Report harassment or inappropriate behavior

## Getting Started

1. **Fork the repository** via GitHub
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/flex-code-main.git
   cd flex-code-main
   ```
3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/flex-code-main.git
   ```
4. **Keep fork updated:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

## Development Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Install & Run

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your values
nano .env

# Start development with Docker
docker-compose up -d

# Or run locally (requires MongoDB & Redis running)
npm run dev

# Frontend dev server
cd frontend
npm run dev
```

### Environment Setup
See `.env.example` for all required environment variables.

### Verify Your Setup
```bash
# Test backend
curl http://localhost:4000/api/health

# Test frontend
open http://localhost:5173
```

## Coding Standards

### JavaScript/TypeScript
- Use ES6+ features
- Use meaningful variable names
- Keep functions small and focused
- Maximum 100 lines per function
- Use arrow functions for callbacks

### Code Style
```javascript
// ✓ Good
export const getUserById = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  } catch (error) {
    logger.error('Failed to fetch user', { userId: id, error });
    throw error;
  }
};

// ✗ Bad
function getUserById(id){
  const user = User.findById(id);
  return user;
}
```

### ESLint & Prettier
```bash
# Format code
npm run format

# Check style
npm run lint

# Fix issues automatically
npm run lint:fix
```

### Comments & JSDoc

```javascript
/**
 * Get user by ID with role checks
 * @param {string} id - User MongoDB ObjectId
 * @param {Object} options - Query options
 * @param {boolean} options.includeProfile - Load profile (default: true)
 * @returns {Promise<Object>} User document with role and profile
 * @throws {Error} If user not found or database error
 * @example
 * const user = await getUserById('507f1f77bcf86cd799439011');
 */
export const getUserById = async (id, options = {}) => {
  // implementation
};
```

## Commit Messages

Use conventional commits for clear git history:

```
<type>(<scope>): <subject>
<body>
<footer>
```

### Types
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (not functional)
- `refactor:` Code restructuring
- `perf:` Performance improvements
- `test:` Test additions/changes
- `chore:` Build/dependency changes

### Examples

```
feat(jobs): add aggregation pipeline for job discovery

- Use MongoDB aggregation for single query instead of populate()
- Reduces query count from 21 to 1
- 10x performance improvement in job listing

Closes #123
```

```
fix(auth): prevent expired token usage in requests

- Check token expiry before API call
- Refresh token automatically when expired
- Fallback to login if refresh fails

Fixes #456
```

```
docs: update API v2 documentation

- Add versioning strategy explanation
- Document migration path from v1 to v2
- Include performance benchmarks
```

### Commit Best Practices
- Write in imperative mood ("add feature" not "added feature")
- Limit subject line to 50 characters
- Wrap body at 72 characters
- Reference issues: "Closes #123" or "Fixes #123"
- One logical change per commit

## Submitting Pull Requests

### Before Submitting

```bash
# Update from upstream
git fetch upstream
git rebase upstream/main

# Run all checks
npm run lint
npm run test
npm run build

# Commit and push
git push origin feature-branch
```

### PR Description Template

```markdown
## Description
Brief explanation of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Related Issue
Closes #123

## Testing
- [ ] Unit tests added
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] No new warnings
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

## Screenshots (if applicable)
[Add screenshots here]
```

### Review Process
1. **Automated checks** - Linting, tests, build must pass
2. **Code review** - At least 1 approval from maintainers
3. **Testing** - Manual testing by reviewers
4. **Merge** - Rebase and merge into main

## Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Frontend tests
cd frontend
npm test
```

### Writing Tests

```javascript
// Use Jest for all tests
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('getUserById', () => {
  let user;
  
  beforeEach(async () => {
    user = await User.create({ email: 'test@test.com' });
  });
  
  afterEach(async () => {
    await User.deleteMany({});
  });
  
  it('should return user by ID', async () => {
    const result = await getUserById(user._id);
    expect(result._id).toEqual(user._id);
    expect(result.email).toBe('test@test.com');
  });
  
  it('should throw error if user not found', async () => {
    await expect(getUserById('000000000000000000000000'))
      .rejects.toThrow('User not found');
  });
});
```

### Minimum Coverage
- Overall: 60%
- Controllers: 80%
- Critical paths: 90%

## Documentation

### Code Documentation
- JSDoc comments on all exported functions
- Inline comments for complex logic
- README in each major directory

### API Documentation
- Document new endpoints in API v2
- Include request/response examples
- Note any breaking changes

### README Updates
- Update CHANGELOG.md
- Add new features to README
- Update setup instructions if needed

### Example Documentation

```markdown
## API Endpoint: GET /api/v2/jobs/discover

Get available jobs with advanced filtering

### Request
```bash
GET /api/v2/jobs/discover?page=1&limit=20&skills=JavaScript,React&city=London
Authorization: Bearer <token>
```

### Response
```json
{
  "success": true,
  "code": "JOB_DISCOVER_SUCCESS",
  "data": {
    "jobs": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 100,
      "hasNextPage": true
    }
  }
}
```

### Parameters
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, max 50, default 20
- `skills` (optional): Comma-separated skills
- `city` (optional): City name (case-insensitive)
- `sortBy` (optional): Sort field (createdAt, payPerPerson, dateStart)

### Error Responses
- `400` - Invalid pagination or filter parameters
- `401` - Unauthorized (missing or invalid token)
- `500` - Server error
```

## Questions?

- **Show:** GitHub Discussions
- **Ask:** GitHub Issues
- **Chat:** Project Discord/Slack (if available)

## Recognition

Contributors will be recognized in:
- CHANGELOG.md
- GitHub contributors page
- Project documentation

Thank you for contributing to EventFlex! 🎉

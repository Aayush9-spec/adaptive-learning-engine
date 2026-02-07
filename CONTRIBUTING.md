# Contributing to Adaptive Learning Decision Engine

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/adaptive-learning-engine.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Run tests to ensure everything works
6. Commit your changes: `git commit -m 'Add some feature'`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

## 📋 Development Guidelines

### Code Style

**Python (Backend):**
- Follow PEP 8 style guide
- Use type hints for all function signatures
- Maximum line length: 100 characters
- Use Black for code formatting
- Use isort for import sorting

**TypeScript (Frontend):**
- Follow Airbnb TypeScript style guide
- Use ESLint and Prettier
- Prefer functional components with hooks
- Use meaningful variable names

### Testing Requirements

All contributions must include tests:

**Unit Tests:**
- Test specific examples and edge cases
- Aim for >80% code coverage
- Use descriptive test names

**Property-Based Tests:**
- For mathematical algorithms and core logic
- Minimum 100 iterations per property
- Document what property is being tested

**Example:**
```python
# Property test example
@given(st.integers(min_value=0, max_value=100))
def test_mastery_score_bounds(score):
    """Property: Mastery scores must be between 0 and 100"""
    result = calculate_mastery_score(score)
    assert 0 <= result <= 100
```

### Commit Messages

Use conventional commits format:
```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Maintenance tasks

Example:
```
feat(decision-engine): add caching for priority score computation

Implement memoization to cache priority scores for 5 minutes per student,
reducing computation time from 150ms to 20ms for repeated requests.

Closes #123
```

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
pytest                          # Run all tests
pytest tests/unit/             # Run unit tests only
pytest tests/property/         # Run property tests only
pytest --cov=app               # Run with coverage
```

### Frontend Tests
```bash
cd frontend
npm test                       # Run all tests
npm run test:watch            # Run in watch mode
npm run test:coverage         # Run with coverage
```

## 📝 Documentation

- Update README.md if adding new features
- Add docstrings to all functions and classes
- Update API documentation for new endpoints
- Include examples in documentation

## 🐛 Reporting Bugs

When reporting bugs, include:
1. Description of the bug
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Screenshots (if applicable)
6. Environment details (OS, browser, versions)

## 💡 Suggesting Features

When suggesting features:
1. Describe the feature clearly
2. Explain the use case
3. Provide examples if possible
4. Consider impact on existing functionality

## 🔍 Code Review Process

All submissions require review:
1. Automated tests must pass
2. Code must follow style guidelines
3. Changes must be documented
4. At least one maintainer approval required

## 📦 Pull Request Checklist

Before submitting a PR, ensure:
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Commit messages follow conventions
- [ ] No merge conflicts
- [ ] PR description explains changes clearly

## 🎯 Priority Areas

We especially welcome contributions in:
- Performance optimizations
- Additional property-based tests
- Mobile UI improvements
- Accessibility enhancements
- Documentation improvements
- Bug fixes

## 📞 Questions?

- Open an issue for questions
- Check existing issues and PRs first
- Be respectful and constructive

Thank you for contributing! 🙏

# Contributing to Alset

Thank you for your interest in contributing to Alset! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs

- Use the GitHub issue tracker
- Include a clear description of the bug
- Provide steps to reproduce
- Include browser/OS information
- Add screenshots if applicable

### Suggesting Features

- Use the GitHub issue tracker
- Describe the feature clearly
- Explain why it would be useful
- Consider the impact on existing functionality

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Test thoroughly**
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Local Development

1. Clone your fork
2. Install dependencies: `npm install`
3. Copy environment file: `cp env.example .env.local`
4. Set up your environment variables
5. Run the development server: `npm run dev`

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Use Prettier for formatting
- Run ESLint before committing

### Testing

- Test your changes thoroughly
- Ensure all existing functionality works
- Test on different browsers if applicable
- Test responsive design on mobile devices

## 📁 Project Structure

```
src/
├── features/          # Feature-based modules
│   ├── authentication/
│   ├── credit-system/
│   ├── property-search/
│   ├── marketplace-intents/
│   └── shared/
├── integrations/      # Third-party service integrations
└── lib/              # Utility functions and helpers
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 📝 Commit Message Guidelines

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## 🚀 Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**
4. **Update CHANGELOG.md** if applicable
5. **Request review** from maintainers

## 📋 Code Review Checklist

- [ ] Code follows project style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Error handling is appropriate
- [ ] Performance considerations are addressed

## 🐛 Bug Fixes

When fixing bugs:

1. **Identify the root cause**
2. **Write a test** that reproduces the bug
3. **Fix the issue**
4. **Ensure the test passes**
5. **Add regression tests** if applicable

## ✨ Feature Development

When adding features:

1. **Plan the feature** thoroughly
2. **Consider backward compatibility**
3. **Add appropriate tests**
4. **Update documentation**
5. **Consider performance impact**

## 🔒 Security

- Never commit sensitive information
- Follow security best practices
- Report security vulnerabilities privately
- Use environment variables for secrets

## 📚 Documentation

- Keep documentation up to date
- Use clear, concise language
- Include examples when helpful
- Update README.md for significant changes

## 🎯 Getting Help

- Check existing documentation
- Search existing issues
- Ask questions in GitHub Discussions
- Join the community chat (if available)

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

---

Thank you for contributing to Alset! 🚀

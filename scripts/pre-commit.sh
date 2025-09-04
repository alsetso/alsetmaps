#!/bin/bash

# Pre-commit script to catch TypeScript and linting errors before deployment

echo "🔍 Running pre-commit checks..."

# Check for TypeScript errors
echo "📝 Checking TypeScript compilation..."
npm run type-check
if [ $? -ne 0 ]; then
  echo "❌ TypeScript compilation failed!"
  exit 1
fi

# Check for linting errors
echo "🧹 Running ESLint..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ ESLint found issues!"
  exit 1
fi

# Check for unused variables specifically
echo "🔍 Checking for unused variables..."
npx eslint . --ext .ts,.tsx --rule '@typescript-eslint/no-unused-vars: error' --rule '@typescript-eslint/no-unused-imports: error'
if [ $? -ne 0 ]; then
  echo "❌ Found unused variables or imports!"
  exit 1
fi

echo "✅ All pre-commit checks passed!"
exit 0

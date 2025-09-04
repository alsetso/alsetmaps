#!/bin/bash

# Pre-commit script to catch critical errors before deployment

echo "🔍 Running pre-commit checks..."

# Check if the app can build (this will catch critical errors)
echo "🏗️ Testing build process..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed! This will prevent deployment."
  exit 1
fi

echo "✅ Build successful! Ready for deployment."
echo "ℹ️ Note: TypeScript strict checking is disabled for deployment compatibility."
exit 0

#!/bin/bash

# Quick start script for ANTAM Gold Price Next.js App

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     ANTAM Gold Price - Next.js App Quick Start            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    exit 1
fi

echo "📦 Installing dependencies..."
cd nextjs-app
npm install

echo ""
echo "✅ Installation complete!"
echo ""
echo "🚀 To start the development server, run:"
echo "   cd nextjs-app"
echo "   npm run dev"
echo ""
echo "📊 Then open: http://localhost:3000"
echo ""
echo "📝 For more information, see NEXTJS_SETUP.md"
echo ""

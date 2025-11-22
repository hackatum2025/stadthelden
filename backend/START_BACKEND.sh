#!/bin/bash

echo "🚀 Starting City Hero Backend..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file with your MongoDB password"
    exit 1
fi

# Check if password is still placeholder
if grep -q "<db_password>" .env; then
    echo "⚠️  MongoDB password not set!"
    echo "Please replace <db_password> in .env with your actual MongoDB password"
    exit 1
fi

# Activate venv
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please run ./setup.sh first"
    exit 1
fi

echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Check if dependencies are installed
if ! python -c "import motor" 2>/dev/null; then
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
fi

# Check if database is seeded
echo "📊 Checking database..."
echo ""

echo "✅ Starting FastAPI server..."
echo "   API Docs: http://localhost:8000/docs"
echo "   Health: http://localhost:8000/health"
echo "   Foundations: http://localhost:8000/api/v1/foundations"
echo ""
echo "Press Ctrl+C to stop"
echo ""

python run.py


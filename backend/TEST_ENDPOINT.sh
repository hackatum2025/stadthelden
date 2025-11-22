#!/bin/bash

echo "🚀 Testing City Hero API Foundations Endpoint"
echo ""

# Check if server is running
if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "❌ Server is not running!"
    echo ""
    echo "Please start the server first:"
    echo "  1. cd backend"
    echo "  2. source venv/bin/activate"
    echo "  3. Make sure MongoDB password is in .env"
    echo "  4. python run.py"
    echo ""
    exit 1
fi

echo "✅ Server is running!"
echo ""

# Test health endpoint
echo "📍 Testing health endpoint..."
curl -s http://localhost:8000/health | python3 -m json.tool
echo ""

# Test foundations endpoint
echo "📍 Testing GET /api/v1/foundations..."
echo ""
curl -s http://localhost:8000/api/v1/foundations | python3 -m json.tool
echo ""

# Test specific foundation
echo "📍 Testing GET /api/v1/foundations/stiftung-001..."
echo ""
curl -s http://localhost:8000/api/v1/foundations/stiftung-001 | python3 -m json.tool

echo ""
echo "✅ All tests complete!"


#!/bin/bash

echo "🚀 Setting up City Hero Backend..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file with your MongoDB password"
    exit 1
fi

# Check if password is still placeholder
if grep -q "<db_password>" .env; then
    echo "⚠️  Please replace <db_password> in .env with your actual MongoDB password"
    echo ""
    read -p "Enter your MongoDB password: " PASSWORD
    
    # Replace password in .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/<db_password>/$PASSWORD/g" .env
    else
        # Linux
        sed -i "s/<db_password>/$PASSWORD/g" .env
    fi
    echo "✅ Password updated in .env"
fi

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

# Activate venv
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Seed the database:"
echo "     python -m app.seed_data"
echo ""
echo "  2. Run the server:"
echo "     python run.py"
echo ""


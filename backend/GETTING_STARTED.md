# Getting Started with City Hero Backend

## 1️⃣ Setup Environment Variables

First, you need to configure your `.env` file with required credentials.

```bash
# Edit the .env file
nano .env

# Configure MongoDB:
MONGODB_URL=mongodb+srv://juliansibbing:YOUR_ACTUAL_PASSWORD@hackatum.xi6hx3q.mongodb.net/?appName=hackatum

# Configure Gemini AI (required for document generation):
GEMINI_API_KEY=your_gemini_api_key_here
```

**Required Environment Variables:**
- `MONGODB_URL`: Your MongoDB connection string
- `GEMINI_API_KEY`: Google Gemini API key for AI document generation

## 2️⃣ Install Dependencies

```bash
uv sync
```

This downloads Python 3.11 (if needed), creates `.venv/`, and installs everything from `pyproject.toml` and `uv.lock`.

## 3️⃣ Seed the Database

```bash
uv run -- python -m app.seed_data
```

You should see:
```
Connecting to MongoDB...
Clearing existing foundations...
Inserting 5 foundations...
✅ Successfully inserted 5 foundations
Creating indexes...
✅ Indexes created

📊 Total foundations in database: 5

📋 Sample foundation:
  - Name: Bürgerstiftung München
  - Förderbereich: local
  - Förderhöhe: 5000.0€ - 50000.0€

✅ Database seeding completed!
```

## 4️⃣ Start the Server

```bash
uv run -- uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

You should see:
```
Connected to MongoDB: city_hero
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

## 5️⃣ Test the API

### Option 1: Use the Interactive Docs
Open in your browser: http://localhost:8000/docs

### Option 2: Use curl

```bash
# Health check
curl http://localhost:8000/health

# List all foundations
curl http://localhost:8000/api/v1/foundations

# Get a specific foundation
curl http://localhost:8000/api/v1/foundations/stiftung-001

# Search foundations (local only)
curl "http://localhost:8000/api/v1/foundations?scope=local"

# Search foundations (medium funding)
curl "http://localhost:8000/api/v1/foundations?category=medium"

# Send a chat message
curl -X POST http://localhost:8000/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "I want to start a youth project in Munich"}'
```

### Option 3: Test with httpie (if installed)

```bash
# Install httpie via uv
uv tool install httpie

# List foundations
http GET :8000/api/v1/foundations

# Send chat message
http POST :8000/api/v1/chat/message message="Youth education project"
```

## 6️⃣ Connect Your Frontend

Update your Next.js frontend to point to the backend:

```typescript
// In your frontend service/api file
const API_BASE_URL = 'http://localhost:8000/api/v1';

async function sendChatMessage(message: string) {
  const response = await fetch(`${API_BASE_URL}/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });
  
  return await response.json();
}

async function getFoundations() {
  const response = await fetch(`${API_BASE_URL}/foundations`);
  return await response.json();
}
```

## 📊 What's in the Database?

After seeding, you'll have 5 foundations:

1. **Bürgerstiftung München**
   - Type: Local (München)
   - Funding: 5.000€ - 50.000€
   - Focus: Youth, Education, Civic Engagement

2. **BMW Foundation**
   - Type: International
   - Funding: 50.000€ - 100.000€
   - Focus: Science, Research, International Relations

3. **Stiftung Bildungspakt Bayern**
   - Type: Regional (Bayern)
   - Funding: 10.000€ - 30.000€
   - Focus: Education, Schools

4. **Robert Bosch Stiftung**
   - Type: National (Germany)
   - Funding: 50.000€ - 75.000€
   - Focus: Civic Engagement, Education, Health

5. **Stadtwerke München Bildungsstiftung**
   - Type: Local (München)
   - Funding: 5.000€ - 25.000€
   - Focus: Arts, Culture, Education, Environment

## 🔍 Example API Responses

### GET /api/v1/foundations/stiftung-001

```json
{
  "id": "stiftung-001",
  "name": "Bürgerstiftung München",
  "short_description": "Unterstützt lokale Projekte zur Förderung von Kindern und Jugendlichen in München.",
  "legal_form": "Stiftung",
  "gemeinnuetzige_zwecke": [
    "Förderung der Jugendhilfe",
    "Förderung von Bildung und Erziehung"
  ],
  "foerderbereich": {
    "scope": "local",
    "specific_areas": ["München"]
  },
  "foerderhoehe": {
    "category": "medium",
    "min_amount": 5000,
    "max_amount": 50000
  }
}
```

### POST /api/v1/chat/message

Request:
```json
{
  "message": "I want to start a youth education project"
}
```

Response:
```json
{
  "code": "refine",
  "message": "Das klingt nach einem tollen Projekt! Kannst du mir mehr über deine Zielgruppe erzählen?"
}
```

## 🎯 Next Steps

1. **Implement Real Matching Logic** - Replace mock responses in `chat_service.py` with actual foundation matching
2. **Add More Endpoints** - Create endpoints for creating/updating foundations
3. **Add Authentication** - Implement user authentication if needed
4. **Add AI Integration** - Connect to OpenAI or other LLMs for smarter chat responses
5. **Deploy** - Deploy to production (Railway, Render, AWS, etc.)

## 💡 Tips

- The API auto-generates documentation at `/docs`
- All endpoints support JSON format
- CORS is already configured for `localhost:3000` and `localhost:3001`
- MongoDB connection is established on app startup
- Use the DATA_SCHEMA.md for reference on data structures

## 🆘 Need Help?

Check out:
- [README.md](./README.md) - Complete documentation
- [DATA_SCHEMA.md](./DATA_SCHEMA.md) - Data structures
- FastAPI Docs: https://fastapi.tiangolo.com/
- MongoDB Motor: https://motor.readthedocs.io/


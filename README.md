# 🚀 Run Full Stack Application

## Quick Start (2 Terminals)

### Terminal 1: Backend (FastAPI)

```bash
cd backend

# Make sure MongoDB password is set in .env
# nano .env  # Replace <db_password> with your actual password

# Start the backend
./START_BACKEND.sh

# Or manually:
source venv/bin/activate
python -m app.seed_data  # Only needed once to seed database
python run.py
```

**Backend will run on:** http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health
- Foundations: http://localhost:8000/api/v1/foundations

---

### Terminal 2: Frontend (Next.js)

```bash
cd frontend

# Create .env.local if it doesn't exist
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start the frontend
npm run dev
```

**Frontend will run on:** http://localhost:3000

---

## Testing the Connection

Once both servers are running:

1. **Open browser:** http://localhost:3000
2. **You should see:** Blue background with "BE A CITY HERO"
3. **Type a message** in the chat input
4. **The frontend will call the backend** at http://localhost:8000/api/v1/chat/message

### Check Backend Connection

```bash
# In a third terminal, test the backend:
curl http://localhost:8000/health

# Test foundations endpoint:
curl http://localhost:8000/api/v1/foundations | python3 -m json.tool

# Test chat endpoint:
curl -X POST http://localhost:8000/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "I want to start a youth education project in Munich"}'
```

---

## Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  Next.js        │ ─────> │  FastAPI        │ ─────> │  MongoDB Atlas  │
│  Frontend       │  HTTP  │  Backend        │  Async │  Database       │
│  :3000          │         │  :8000          │         │                 │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

---

## Features Connected

✅ Frontend calls backend for chat messages
✅ Backend connects to MongoDB Atlas
✅ API returns foundations with embedded projects
✅ Graceful fallback to mock if backend unavailable
✅ CORS configured for localhost:3000

---

## Troubleshooting

### Backend won't start
- Check MongoDB password in `backend/.env`
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt`

### Frontend can't connect to backend
- Make sure backend is running on port 8000
- Check `frontend/.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8000`
- Restart frontend dev server after changing .env.local

### CORS errors
- Backend is configured to allow localhost:3000 and localhost:3001
- Check `backend/app/core/config.py` for CORS_ORIGINS

### MongoDB connection issues
- Verify your IP is whitelisted in MongoDB Atlas
- Check the password in `.env` is correct
- Test connection with: `cd backend && source venv/bin/activate && python -m app.seed_data`

---

## Environment Variables

### Backend (`backend/.env`)
```
MONGODB_URL=mongodb+srv://juliansibbing:YOUR_PASSWORD@hackatum...
MONGODB_DB_NAME=city_hero
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Deployment

### Backend
Deploy to Railway, Render, or AWS with:
- Environment variables from `.env`
- MongoDB connection string
- Port configuration

### Frontend
Deploy to Vercel with:
- Set `NEXT_PUBLIC_API_URL` to your deployed backend URL
- Automatic builds on push to main

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/foundations` | Get all foundations with projects |
| GET | `/api/v1/foundations/scores` | Get foundations with match scores ⭐ |
| GET | `/api/v1/foundations/{id}` | Get specific foundation |
| POST | `/api/v1/chat/message` | Send chat message |

### Foundation Scores Endpoint

The `/api/v1/foundations/scores` endpoint returns foundations with:
- **Match score** (0.0 to 1.0)
- **Fits** (positive matches like "Fördert lokale Projekte")
- **Mismatches** (potential issues like "Keine Personalkosten")
- **Questions** (things to clarify like "Kofinanzierung nötig?")

Example:
```bash
curl "http://localhost:8000/api/v1/foundations/scores?query=youth+education&limit=5"
```

See full API docs at http://localhost:8000/docs when backend is running.


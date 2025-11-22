# City Hero Backend API

FastAPI backend for the City Hero project with MongoDB Atlas integration.

## 🚀 Quick Setup

### Requirements
- Python **3.11**
- [uv](https://github.com/astral-sh/uv) (`curl -LsSf https://astral.sh/uv/install.sh | sh`)

### 1. Configure environment
```bash
cd backend
nano .env  # replace <db_password> with your MongoDB password
```

### 2. Install dependencies
```bash
uv sync
```
This will create a managed `.venv/` and install everything declared in `pyproject.toml`/`uv.lock`.

### 3. Seed the database (optional, but useful locally)
```bash
uv run -- python -m app.seed_data
```
This inserts 5 mock foundations into MongoDB:
- Bürgerstiftung München (local, medium funding)
- BMW Foundation (international, large funding)
- Stiftung Bildungspakt Bayern (regional, medium funding)
- Robert Bosch Stiftung (national, large funding)
- Stadtwerke München Bildungsstiftung (local, medium funding)

### 4. Run the development server
```bash
uv run -- uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Or use the small helper script:
```bash
uv run -- python run.py
```

## 📚 API Documentation

Once running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/health

## 🔌 API Endpoints

### Chat
- `POST /api/v1/chat/message` - Send a chat message
  ```json
  {
    "message": "I want to start a youth education project in Munich",
    "conversation_id": "optional-uuid"
  }
  ```

### Foundations
- `GET /api/v1/foundations` - List all foundations
  - Query params: `scope` (local/regional/national/international), `category` (small/medium/large), `limit`
- `GET /api/v1/foundations/{id}` - Get foundation details
- `GET /api/v1/foundations/search/{query}` - Full-text search foundations

### General
- `GET /` - API info
- `GET /health` - Health check

## 📊 Database Schema

See [DATA_SCHEMA.md](./DATA_SCHEMA.md) for detailed documentation about:
- Foundation data model with all fields
- Project data model
- Application process (Antragsprozess)
- Gemeinnützige Zwecke (26 official charitable purposes)
- Matching algorithm considerations
- JSON format examples

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── routes/
│   │       ├── chat.py          # Chat endpoints
│   │       └── foundations.py   # Foundation endpoints
│   ├── core/
│   │   ├── config.py            # Settings & configuration
│   │   └── database.py          # MongoDB connection
│   ├── models/
│   │   ├── chat.py              # Chat Pydantic models
│   │   └── foundation.py        # Foundation Pydantic models
│   ├── services/
│   │   └── chat_service.py      # Business logic
│   ├── main.py                  # FastAPI app
│   └── seed_data.py             # Database seeding script
├── pyproject.toml               # Project + dependency metadata
├── uv.lock                      # Locked dependency graph (Python 3.11)
├── run.py                       # Development server runner
├── DATA_SCHEMA.md               # Complete data schema docs
├── .env                         # Environment variables (not committed)
└── README.md
```

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB Atlas connection string | Required |
| `MONGODB_DB_NAME` | Database name | `city_hero` |
| `API_HOST` | API host | `0.0.0.0` |
| `API_PORT` | API port | `8000` |
| `DEBUG` | Debug mode | `True` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:3000,http://localhost:3001` |

## 🛠️ Development

### Technologies
- **FastAPI** - Modern web framework
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server
- **MongoDB Atlas** - Cloud database

### Database Access
- Cluster URL: https://cloud.mongodb.com/
- Database name: `city_hero`
- Collections: `foundations`, `projects`

### Running Tests
```bash
# Coming soon
pytest
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- **IP Whitelist:** Ensure your IP is whitelisted in MongoDB Atlas Network Access
- **Password:** Verify the password in `.env` is correct (no angle brackets)
- **Connection String:** Check the format is valid

### Port Already in Use
Edit `.env` and change `API_PORT`:
```
API_PORT=8001
```

### Module Import Errors
Ensure you're in the virtual environment:
```bash
source venv/bin/activate  # or venv\Scripts\activate on Windows
```

## 📝 License

Part of HackaTUM 2025 project.

# Sentra Memory Service

Persistent memory service for AI agents with two-layer architecture.

## Quick Start

### 1. Start PostgreSQL with pgvector

```bash
cd memory_service
docker-compose up -d
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the Service

```bash
# Option 1: Using uvicorn directly
uvicorn memory_service.main:app --host 0.0.0.0 --port 9420 --reload

# Option 2: Using the run script
python -m memory_service.run
```

### 4. Access API

- **API Docs**: http://localhost:9420/docs
- **Health Check**: http://localhost:9420/health

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SENTRA MEMORY SERVICE                         │
│                    http://localhost:9420                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LAYER 1 (Online - Always Available)                            │
│  ├── Persona (user traits, preferences, style)                  │
│  ├── NOTAMs (critical notices that must be shown)               │
│  └── Sessions (last activity context)                           │
│                                                                  │
│  LAYER 2 (On-Demand - Semantic Search)                          │
│  ├── Memories (extracted facts, decisions, events)              │
│  ├── Vector embeddings (384D, all-MiniLM-L6-v2)                 │
│  └── Relationships (graph connections)                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## API Endpoints

### Layer 1 (Context)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/context` | Get full user context (persona+notam+activity) |
| POST | `/context/prompt` | Get context formatted for prompt injection |
| GET | `/persona/{user_id}` | Get user persona |
| PUT | `/persona/{user_id}` | Update persona |
| POST | `/notam` | Create NOTAM |
| GET | `/notam` | List NOTAMs |
| DELETE | `/notam/{id}` | Delete NOTAM |

### Layer 2 (Memory)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/memory/search` | Semantic search |
| POST | `/memory/add` | Add new memory |
| GET | `/memory` | List memories |
| DELETE | `/memory/{id}` | Delete memory |

## Usage Examples

### Get User Context (Layer 1)

```python
import httpx

response = httpx.post("http://localhost:9420/context", json={
    "user_id": "chief",
    "agent_type": "cli",
    "agent_name": "Claude Code"
})

context = response.json()
print(context["persona"])  # User traits and preferences
print(context["notams"])   # Critical notices
print(context["last_session"])  # Last activity
```

### Search Memories (Layer 2)

```python
response = httpx.post("http://localhost:9420/memory/search", json={
    "user_id": "chief",
    "query": "What framework did user prefer for frontend?",
    "limit": 5
})

results = response.json()
for result in results["results"]:
    print(f"[{result['similarity']:.2f}] {result['memory']['content']}")
```

### Add Memory

```python
response = httpx.post("http://localhost:9420/memory/add", json={
    "user_id": "chief",
    "content": "User prefers React with TypeScript for frontend development",
    "memory_type": "preference",
    "importance": 0.8,
    "source_agent": "claude-code"
})
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MEMORY_DATABASE_URL` | postgresql+asyncpg://... | Database connection |
| `MEMORY_HOST` | 0.0.0.0 | Server host |
| `MEMORY_PORT` | 9420 | Server port |
| `MEMORY_DEBUG` | false | Debug mode |
| `MEMORY_API_KEY` | sentra-memory-key-2026 | API key |

## License

Proprietary - Sentra Healthcare Solutions

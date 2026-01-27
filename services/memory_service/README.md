# SENTRA MEMORY SERVICE

> Persistent memory layer dengan semantic search untuk AI conversational agents

**Version**: 2.0.0 (Post-Cleanup)
**Port**: 9420
**Stack**: FastAPI + PostgreSQL + pgvector + SentenceTransformers

---

## OVERVIEW

Memory Service menyediakan two-layer memory architecture untuk AI agents:

- **Layer 1 (Online)**: Persona, NOTAMs, Sessions - context yang always-on
- **Layer 2 (On-Demand)**: Semantic memory search dengan 384D vector embeddings

### Key Features

- 🔍 Semantic search menggunakan cosine similarity
- 🧠 384-dimensional embeddings (all-MiniLM-L6-v2)
- 🔐 Agent isolation (private vs shared memories)
- ⚡ Async-first architecture (FastAPI + SQLAlchemy async)
- 📊 PostgreSQL dengan pgvector extension

---

## QUICK START

### Prerequisites

```
Python 3.11+
PostgreSQL 14+ dengan pgvector extension
8GB RAM minimum (untuk embedding model)
```

### Installation

```bash
# 1. Navigate ke directory
cd services/memory_service

# 2. Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

# 3. Install dependencies
pip install -r requirements.txt

# 4. Setup database (via Docker)
docker-compose up -d

# Alternative: Manual PostgreSQL setup
createdb memory
psql -d memory -c "CREATE EXTENSION vector;"

# 5. Run migrations
psql -d memory -f init.sql
psql -d memory -f migrate_001_agent_isolation.sql

# 6. Configure environment (optional)
# Edit .env jika perlu override defaults

# 7. Run service
python run.py
```

### Verify Installation

```bash
curl http://localhost:9420/health
# Expected: {"status": "healthy", "database": true, ...}
```

---

## ARCHITECTURE

### System Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    MEMORY SERVICE                        │
│                  http://localhost:9420                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  LAYER 1 (Online - Always Available)                    │
│  ├── Persona (user traits, preferences, style)          │
│  ├── NOTAMs (critical notices with expiry)              │
│  └── Sessions (last activity context)                   │
│                                                          │
│  LAYER 2 (On-Demand - Semantic Search)                  │
│  ├── Memories (extracted facts, decisions, events)      │
│  ├── Vector embeddings (384D, all-MiniLM-L6-v2)         │
│  └── Pgvector search (cosine similarity)                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Active Models

| Model | Purpose | Key Fields |
|-------|---------|-----------|
| **Memory** | Core episodic storage | content, embedding, memory_type, importance |
| **Persona** | User personality profiles | name, traits, preferences, style |
| **Session** | Last activity tracking | user_id, last_query, agent_type |
| **NOTAM** | Critical notices | title, content, priority, expires_at |

### Folder Structure

```
memory_service/
├── models/          # SQLAlchemy database models
│   ├── memory.py    # Memory model dengan vector embedding
│   ├── persona.py   # User persona profiles
│   ├── session.py   # Activity sessions
│   └── notam.py     # Notices to Airmen (critical notices)
├── schemas/         # Pydantic request/response validation
│   ├── requests.py  # API request schemas
│   └── responses.py # API response schemas
├── routers/         # FastAPI route handlers
│   ├── context.py   # Layer 1 combined endpoint
│   ├── memory.py    # Layer 2 memory CRUD
│   ├── persona.py   # Persona management
│   └── notam.py     # NOTAM management
├── services/        # Business logic layer
│   ├── embedder.py  # SentenceTransformers wrapper
│   └── search.py    # Semantic search engine
├── migrations/      # Database migrations
│   └── *.sql        # SQL migration scripts
├── main.py          # FastAPI application
├── config.py        # Settings via pydantic-settings
├── database.py      # SQLAlchemy async engine
└── run.py           # Entry point dengan uvicorn
```

---

## API ENDPOINTS

### Context (Layer 1)

**Get Full User Context**
```http
POST /context
Content-Type: application/json

{
  "user_id": "chief",
  "agent_type": "cli",
  "agent_name": "Claude Code",
  "include_notams": true,
  "include_session": true
}
```

Response: Persona + active NOTAMs + last session activity

**Get Context as Prompt**
```http
POST /context/prompt
Content-Type: application/json

{
  "user_id": "chief"
}
```

Response: Context formatted untuk prompt injection

---

### Memory (Layer 2)

**Semantic Search**
```http
POST /memory/search
Content-Type: application/json

{
  "user_id": "chief",
  "query": "What frontend framework does user prefer?",
  "agent_id": "optional-agent-id",
  "limit": 5,
  "threshold": 0.3,
  "include_shared": true
}
```

Response: List of memories dengan similarity scores

**Add Memory**
```http
POST /memory/add
Content-Type: application/json

{
  "user_id": "chief",
  "agent_id": "my-agent",
  "content": "User prefers React with TypeScript for frontend",
  "memory_type": "preference",
  "importance": 0.8,
  "access_mode": "shared",
  "metadata": {"source": "conversation"}
}
```

Response: Success dengan memory_id

**List Memories**
```http
GET /memory?user_id=chief&agent_id=my-agent&limit=10
```

**Delete Memory**
```http
DELETE /memory/{memory_id}
```

---

### Persona

**Get Persona**
```http
GET /persona/{user_id}
```

**Update Persona**
```http
PUT /persona/{user_id}
Content-Type: application/json

{
  "name": "Chief Engineer",
  "traits": {"analytical": true, "detail_oriented": true},
  "preferences": {"code_style": "functional"},
  "style": {"communication": "concise"}
}
```

---

### NOTAM

**Create NOTAM**
```http
POST /notam
Content-Type: application/json

{
  "user_id": "chief",
  "title": "System Maintenance",
  "content": "Database migration scheduled for tonight",
  "priority": "high",
  "expires_at": "2026-01-28T00:00:00Z"
}
```

**List Active NOTAMs**
```http
GET /notam?user_id=chief&active=true
```

**Delete NOTAM**
```http
DELETE /notam/{notam_id}
```

---

## CONFIGURATION

### Environment Variables

Create `.env` file atau set environment variables:

```env
# Database
MEMORY_DATABASE_URL=postgresql+asyncpg://sentra:sentra_memory_2026@localhost:5432/memory

# Server
MEMORY_HOST=0.0.0.0
MEMORY_PORT=9420
MEMORY_DEBUG=false

# Embeddings
MEMORY_EMBEDDING_MODEL=all-MiniLM-L6-v2
MEMORY_EMBEDDING_DIMENSION=384

# Search
MEMORY_DEFAULT_SEARCH_LIMIT=5
MEMORY_MAX_SEARCH_LIMIT=20
MEMORY_SIMILARITY_THRESHOLD=0.3

# Security (not enforced in v2.0)
MEMORY_API_KEY=sentra-memory-key-2026
MEMORY_REQUIRE_AUTH=false
```

### Settings via config.py

All settings accessible via `get_settings()` dengan lru_cache.

---

## USAGE EXAMPLES

### Python Client

```python
import httpx

BASE_URL = "http://localhost:9420"

# Add memory
response = httpx.post(f"{BASE_URL}/memory/add", json={
    "user_id": "chief",
    "agent_id": "test-agent",
    "content": "User prefers minimal dependencies",
    "memory_type": "preference",
    "importance": 0.8,
    "access_mode": "shared"
})
print(response.json())
# {"success": true, "memory_id": "uuid-here", ...}

# Search memories
response = httpx.post(f"{BASE_URL}/memory/search", json={
    "user_id": "chief",
    "query": "What are user's preferences for dependencies?",
    "limit": 5
})

results = response.json()
for result in results["results"]:
    print(f"[{result['similarity']:.2f}] {result['memory']['content']}")
# [0.85] User prefers minimal dependencies

# Get full context
response = httpx.post(f"{BASE_URL}/context", json={
    "user_id": "chief"
})
context = response.json()
print(context["persona"])
print(context["notams"])
```

---

## DEVELOPMENT

### Memory Types

Supported values untuk `memory_type` field:
- `fact`: Factual information
- `preference`: User preferences
- `decision`: Decisions made
- `event`: Events that occurred
- `procedure`: Procedures atau workflows

### Agent Isolation

Memories support agent isolation via `agent_id` + `access_mode`:

- **private**: Only owner agent can see
- **shared**: All agents can see

Example:
```python
# Agent A creates private memory
{"agent_id": "agent-a", "access_mode": "private", "content": "..."}

# Agent B cannot see Agent A's private memories in search
# Agent B CAN see Agent A's shared memories
```

### Adding New Memory Type

1. Update `memory_type` pattern di `schemas/requests.py` (MemoryAdd)
2. No database migration needed (stored as string)
3. Document usage di aplikasi consumer

### Embedding Model Replacement

To use different embedding model:

1. Set `MEMORY_EMBEDDING_MODEL` environment variable
2. Update `MEMORY_EMBEDDING_DIMENSION` jika dimensi berubah
3. Regenerate all existing embeddings:
   ```python
   # TODO: Create reembed script
   python scripts/reembed.py
   ```

---

## TESTING

### Health Check

```bash
curl http://localhost:9420/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "Sentra Memory Service",
  "version": "1.0.0",
  "database": true,
  "timestamp": "2026-01-27T..."
}
```

### Integration Test Flow

```bash
# 1. Add memory
curl -X POST http://localhost:9420/memory/add \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","agent_id":"test","content":"Test memory","memory_type":"fact","access_mode":"shared"}'

# 2. Search memory
curl -X POST http://localhost:9420/memory/search \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","query":"test","limit":5}'

# 3. Get context
curl -X POST http://localhost:9420/context \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test"}'
```

---

## MAINTENANCE

### Database Backup

```bash
# Full backup
pg_dump memory > backup_$(date +%Y%m%d).sql

# Restore
psql memory < backup_20260127.sql
```

### Performance Monitoring

**Slow Search Queries**

Add ivfflat index untuk vector search:
```sql
CREATE INDEX ON memories
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

**High Memory Usage**

Reduce connection pool size di `database.py`:
```python
engine = create_async_engine(
    settings.database_url,
    pool_size=10,  # Reduce from default 20
    max_overflow=5
)
```

**Monitoring Endpoints**

- `/health` - Service health + DB connectivity
- Check logs untuk search latency (exposed di response)

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Slow semantic search | Missing vector index | Add ivfflat index (see above) |
| High memory usage | Large connection pool | Reduce pool_size di database.py |
| Import errors | Missing dependencies | `pip install -r requirements.txt` |
| Database connection fail | PostgreSQL not running | `docker-compose up -d` |

---

## PRODUCTION DEPLOYMENT

### Security Checklist

- [ ] Set `MEMORY_DEBUG=false`
- [ ] Change `MEMORY_API_KEY` dari default
- [ ] Set `MEMORY_REQUIRE_AUTH=true` (implement auth middleware)
- [ ] Use environment variables untuk secrets (tidak hardcode)
- [ ] Configure CORS properly di main.py
- [ ] Enable HTTPS dengan reverse proxy (nginx/caddy)

### Recommended Stack

```
[Client] → [Nginx/Caddy] → [Uvicorn Workers] → [PostgreSQL + pgvector]
```

### Uvicorn Production

```bash
uvicorn memory_service.main:app \
  --host 0.0.0.0 \
  --port 9420 \
  --workers 4 \
  --log-level info \
  --access-log
```

### Docker Deployment

```bash
# Build image
docker build -t sentra-memory-service:2.0.0 .

# Run container
docker run -d \
  -p 9420:9420 \
  -e MEMORY_DATABASE_URL=postgresql+asyncpg://... \
  --name memory-service \
  sentra-memory-service:2.0.0
```

---

## CHANGELOG

### v2.0.0 (2026-01-27) - Cleanup Release

**Removed:**
- Relationship model dan relationships table (unused)
- 6 unused schema classes (SessionUpdate, MemoryExtract, MemoryBatchAdd, HealthResponse, ErrorResponse, MemoryExtractResponse)
- httpx dependency (unused)
- Debug endpoint `/debug/test-add`

**Impact:** 25-30% codebase reduction, zero functional changes

**Migration Required:** Run `migrations/001_drop_relationships_table.sql`

---

## SUPPORT

**Technical Issues**: Open issue di GitHub repository
**Architecture Questions**: Escalate to Principal Engineer
**Database Performance**: Consult DBA team
**Production Incidents**: Page on-call SRE

---

**Maintainer**: Sentra Engineering Team
**License**: Proprietary - Sentra Healthcare Solutions
**Documentation Updated**: 2026-01-27

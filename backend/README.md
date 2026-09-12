# Coco Care Backend

Modular monolith REST API for the Coco Care coconut farming platform. Uses PostgreSQL + pgvector, JWT auth, and layered architecture (routes → controller → service → repository).

## Stack

- Node.js 20+, TypeScript, Express 4
- PostgreSQL 16 + pgvector (RAG knowledge base)
- Docker Compose for local database
- JWT + bcrypt authentication
- Zod validation, CORS enabled for Vite dev server (`5173`, `5174`)
- Jest + Supertest for tests

## Quick start (Docker)

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) running on Windows.

```bash
cd backend
npm install
cp .env.example .env   # or use the generated .env
npm run db:up          # start PostgreSQL + pgvector container
npm run db:migrate     # apply schema migrations
npm run db:seed        # users, farm, CRI RAG, demo reports
npm run dev
```

Server runs at `http://localhost:3000`.

### Database scripts

| Script | Purpose |
|--------|---------|
| `npm run db:up` | Start `cococare-postgres` container |
| `npm run db:down` | Stop container |
| `npm run db:reset` | Destroy volume, restart, migrate, seed |
| `npm run db:migrate` | Apply pending SQL migrations |
| `npm run db:seed` | Seed users, farm, CRI RAG knowledge, verified demo reports |
| `npm run rag:prepare` | Split project-root `fertilizer.md` + `leda 5.md` into `data/cri-manuals/cri/*.md` |
| `npm run rag:ingest` | Ingest prepared topics from `data/cri-manuals/cri/` |
| `npm run rag:clear` | Truncate knowledge tables |

## Database schema

| Table | Purpose |
|-------|---------|
| `schema_migrations` | Tracks applied SQL files |
| `users` | Auth, roles (farmer / officer / admin) |
| `farms` | Farmer estates with GPS coordinates |
| `disease_reports` | Diagnosis results + officer review |
| `chat_messages` | AI chatbot conversation history |
| `knowledge_documents` | RAG source document metadata |
| `knowledge_chunks` | RAG text chunks with vector embeddings |

Analytics tables (`yield_records`, `regional_prices`) are **not** part of this schema.

Verify after seed:

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
SELECT COUNT(*) FROM knowledge_documents;  -- expect 11
SELECT COUNT(*) FROM knowledge_chunks;     -- expect > 11
SELECT COUNT(*) FROM disease_reports WHERE status = 'verified';  -- expect 3
```

## RAG knowledge base

### CRI advisory circulars (production data)

Sources: project-root `fertilizer.md` (nutrients & organic fertilizer packages) and `leda 5.md` (pests & diseases).

1. Update those source files as needed
2. Run: `npm run rag:prepare` (splits into 11 topic files under `data/cri-manuals/cri/`)
3. Run: `npm run rag:clear && npm run rag:ingest`
4. Verify: `npx tsx scripts/verify-rag-chat.ts`

On fresh `db:seed`, knowledge is ingested automatically from `data/cri-manuals/cri/` when tables are empty. Mock manuals are not used.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port |
| `DATABASE_URL` | — | `postgresql://postgres:password@localhost:5432/cococare` |
| `JWT_SECRET` | — | Secret for signing JWTs (required in production) |
| `JWT_EXPIRES_IN` | `7d` | Token expiry |
| `KNOWLEDGE_DATA_DIR` | `./data/cri-manuals` | Root folder for RAG ingest |
| `GEMINI_API_KEY` | — | [Google AI Studio](https://aistudio.google.com) key for RAG embeddings |
| `GEMINI_EMBEDDING_MODEL` | `gemini-embedding-001` | Gemini embedding model |
| `GEMINI_EMBEDDING_ENABLED` | `true` | Set `false` to skip Gemini (chat/ingest will fail without embeddings) |
| `GEMINI_EMBEDDING_DIMENSIONS` | `768` | Output vector size (query and stored chunks must match) |
| `RAG_TOP_K` | `8` | Chunks retrieved per chat query |
| `RAG_MIN_SCORE` | `0.5` | Minimum similarity for RAG answers (with English keyword boost/fallback) |
| `OPENWEATHER_API_KEY` | — | [OpenWeatherMap](https://openweathermap.org/api) key for dashboard forecast |
| `GROQ_API_KEY` | — | [Groq](https://console.groq.com) key for grounded chat answers after retrieval |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq chat model |
| `GROQ_ENABLED` | `true` | Set `false` to force `extractAnswer` fallback |

See `.env.example` for AWS S3 and Azure CV optional settings.

Chat flow: Gemini embeds the question → retrieve CRI chunks from Postgres → Groq generates a clear answer from those chunks only → app appends `Source: {title}`. If Groq is unavailable, falls back to local `extractAnswer`.

After switching embedding models, re-ingest: `npm run rag:clear && npm run rag:ingest`.

## Auth

Seed users (password for all: `password`):

| Username | Role |
|----------|------|
| `akeel` | farmer |
| `officer1` | officer |
| `admin` | admin |

Login returns a real JWT: `Authorization: Bearer <token>`.

## API modules

| Module | Routes | Role |
|--------|--------|------|
| Auth | `POST /auth/login`, `POST /auth/register`, `GET /auth/me` | Public / logged-in |
| Farmer | `GET /farmers/profile`, `POST /farms` | Farmer |
| Diagnosis | `POST /api/diagnosis` | Farmer |
| Reports | `GET /reports/my`, `GET /officer/reports/pending`, `POST /officer/reports/:id/review` | Farmer / Officer |
| Disease Map | `GET /api/disease-map/heatmap` | Farmer |
| Chat | `POST /api/chat`, `GET /api/chat/history` | Farmer |
| Weather | `GET /api/weather/forecast?lat=&lon=&location=` | Farmer |
| Admin | `GET /admin/users`, `GET /admin/stats` | Admin |

Health check: `GET /health`

## Tests

```bash
npm run test
```

API integration tests require a running database with `DATABASE_URL` set.

## Frontend integration

1. In `front_end/.env`: `VITE_API_BASE_URL=http://localhost:3000`
2. Run both servers:

```bash
cd backend && npm run dev
cd front_end && npm run dev
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Port `5432` already in use | Stop local PostgreSQL or change compose port to `5433:5432` and update `DATABASE_URL` |
| `docker compose up` image pull fails | Check internet/Docker Desktop; retry `npm run db:up` |
| Migrate run before DB ready | Wait for healthcheck or run `docker compose ps` until healthy |
| `gen_random_uuid` error | Ensure `pgcrypto` extension (included in `001_init.sql`) |
| pgvector errors on chat | Confirm `003_rag.sql` ran; use `pgvector/pgvector:pg16` image |

## Project structure

```
backend/
├── data/cri-manuals/cri/    # prepared CRI topic .md files
├── data/rag-suggested-questions.json
├── docker-compose.yml
├── sql/                     # migrations
├── scripts/
│   ├── prepare-rag-data.ts
│   ├── ingest-knowledge.ts
│   ├── clear-knowledge.ts
│   └── verify-rag-chat.ts
└── src/
    ├── modules/
    ├── repositories/
    ├── services/
    ├── db/                  # pool, migrate, seed
    └── middleware/
```

Architecture standards: `.cursor/rules/coco-care-architecture.mdc`

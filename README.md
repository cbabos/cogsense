# AtelAI — AI Engineer Transformation

A hands-on learning project: transitioning from Frontend Engineer to AI Engineer/Architect by building an AI factory from scratch, one layer at a time.

## What This Is

This is not a tutorial project. It's a structured rebuild of [AtelAI](https://github.com/cbabos/atelai) — a multi-agent AI factory — but this time every line is written and understood by the developer. The approach:

1. **Spec-driven development** — every feature starts with a formal spec in `specs/`
2. **TDD** — tests before implementation, verified by a mentor
3. **Hands-on learning** — code is written by the human, reviewed by AI (OpenCode + Hermes mentor skill)
4. **Incremental growth** — v0 (single endpoint) → v10 (cloud-deployed on Azure AKS)

## Roadmap

| Version | Skill                            | Deliverable                                   |
| ------- | -------------------------------- | --------------------------------------------- |
| v0      | HTTP, request/response, fetch    | POST /ask endpoint forwarding to LLM provider |
| v1      | TDD, unit testing                | Vitest test suite with fake provider          |
| v2      | Input validation, error design   | Zod validation + typed error taxonomy         |
| v3      | PostgreSQL, Drizzle ORM          | Database persistence + migrations             |
| v4      | JWT, API keys, RBAC              | Authentication + authorization                |
| v5      | Rate limiting, Redis caching     | Token bucket + model list caching             |
| v6      | Docker, GitHub Actions           | Containerized + CI/CD pipeline                |
| v7      | OpenTelemetry, Sentry            | Tracing, structured logging, error tracking   |
| v8      | Message queues, circuit breakers | API + Worker split, resiliency patterns       |
| v9      | Kubernetes, Helm                 | Deploy to local K8s → Azure AKS               |
| v10     | Azure, GitOps, DNS/TLS           | Full cloud deployment on AKS                  |

Full roadmap: [Obsidian — AtelAI Rebuild Learning Roadmap](https://github.com/cbabos/atelai-ai-engineer-transformation)

## Tech Stack

- **Runtime:** Node.js 22, TypeScript (strict), ESM
- **HTTP:** Fastify 5
- **Build:** `tsc` → `dist/`
- **Testing:** Vitest
- **Linting:** ESLint + Prettier
- **Package Manager:** pnpm
- **Git Hooks:** Husky + lint-staged

## Project Structure

```
src/
  types.ts      — Type definitions (message roles, request/response shapes)
  errors.ts     — Exception hierarchy (DefaultError base + specific errors)
  config.ts     — Environment variable resolution
  provider.ts   — LLM provider client (fetch + normalize + typed errors)
  server.ts     — Fastify setup, route registration, error handler
specs/
  v0-spec.md    — Current spec (POST /ask endpoint)
doc/
  CONTEXT.md    — Living knowledge map (read first every session)
docs/
  openai-openapi.yaml — OpenAI API spec reference
  openai-docs.html    — OpenAI API docs reference
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy env template
cp .env.example .env
# Edit .env with your LLM provider details

# Run in dev mode
pnpm dev

# Build
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint + format
pnpm lint
pnpm format
```

## Environment Variables

| Variable                 | Default                    | Description                               |
| ------------------------ | -------------------------- | ----------------------------------------- |
| `LLM_PROVIDER`           | `http://127.0.0.1:8000/v1` | OpenAI-compatible LLM provider endpoint   |
| `LLM_PROVIDER_API_KEY`   | `test-local`               | Bearer token for provider auth            |
| `LLM_DEFAULT_TIMEOUT_MS` | `600000`                   | Default timeout for chat completions (ms) |

## License

MIT

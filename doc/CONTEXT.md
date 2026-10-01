# CONTEXT — AtelAI Engineer Transformation

> Living knowledge map. **Read this first every session; update only the parts affected by your changes.** Rules: AGENTS.md.

## System Architecture Overview

AtelAI Engineer Transformation is a private Node.js application (ESM-only, TypeScript strict) — a learning project for transitioning from Frontend Engineer to AI Engineer/Architect. The code is written by the human (Csaba), with OpenCode as reviewer/tutor.

Current scope (v0): single Fastify endpoint (`POST /ask`) that forwards a chat request to an OpenAI-compatible LLM provider (oMLX local) and returns a normalized response.

Request path (data flow):

```
POST /ask                                          src/server.ts — Fastify route handler
  → validateInput (model, messages)                src/server.ts or src/provider.ts — local validation, throws InputError
  → resolveConfig                                  src/config.ts — env: LLM_PROVIDER, LLM_PROVIDER_API_KEY, LLM_DEFAULT_TIMEOUT_MS
  → LLMProvider.chatCompletion()                   src/provider.ts — POST {baseUrl}/chat/completions with Bearer auth
      → fetchWithTimeout                           global fetch + AbortSignal.timeout
      → normalizeResponse                          src/provider.ts — map provider response to output shape (see spec section 4)
  → handleError                                     src/server.ts — map DefaultError → HTTP status + response body
```

Design rules (do not violate without updating this file):

- **Spec-driven development** — every feature starts with a spec in `specs/`. No coding before spec is written and reviewed.
- **TDD** — tests written before implementation. Vitest, colocated `*.test.ts`.
- **Error handler approach (Approach B)** — errors are HTTP-agnostic. `DefaultError` base class has `code` and `message`. A status map in the error handler maps error codes to HTTP statuses. Errors do NOT carry HTTP status.
- **Error hierarchy**: `DefaultError` → `InputError`, `LLMTimeoutError`, `ProviderError`, `NetworkError`
- **Response normalization** — provider response (OpenAI format) is mapped to a simpler output shape. See `specs/v0-spec.md` section 4.
- **ESM only** — `"type": "module"`. No CommonJS.
- **tsc for build** — `tsc` compiles `src/` to `dist/`. Vite is dev-only (for Vitest).

## Key Modules & Files

| Path               | Responsibility                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| `src/types.ts`     | `MsgRole` enum, `InputMessage`, `AskEndPointParams`, response types, error response types              |
| `src/errors.ts`    | `DefaultError` (base: code, message), `InputError`, `LLMTimeoutError`, `ProviderError`, `NetworkError` |
| `src/config.ts`    | Env var resolution: `LLM_PROVIDER`, `LLM_PROVIDER_API_KEY`, `LLM_DEFAULT_TIMEOUT_MS`                   |
| `src/provider.ts`  | LLM client: build request, fetch with timeout, normalize response, throw typed errors                  |
| `src/server.ts`    | Fastify instance, `POST /ask` route, error handler (status map), start server                          |
| `specs/v0-spec.md` | Current spec — POST /ask endpoint                                                                      |
| `.env.example`     | Env var template (committed)                                                                           |
| `.gitignore`       | Ignores `.env`, `dist`, `node_modules`                                                                 |

## Recent Changes & Active Tasks

- **2026-09-29 — project setup:** clean `package.json` (ESM, pnpm, Fastify runtime, tsx/vitest/vite dev deps), `tsconfig.json` (strict, NodeNext, outDir/rootDir, skipLibCheck), `.env.example`, `.gitignore`, Husky pre-commit hooks, empty source files created.
- **2026-09-29 — spec v0 approved:** `specs/v0-spec.md` — POST /ask endpoint spec. 10 sections: goal, inputs, outputs, response normalization, exception hierarchy, configuration, file structure, acceptance criteria, constraints, interview question.
- **Active:** v0 implementation — `types.ts` started (MsgRole, InputMessage, AskEndPointParams). Remaining: response types, errors.ts, config.ts, provider.ts, server.ts.

## Future Direction (out of scope for v0)

- **v1:** Vitest test suite covering POST /ask with fake provider
- **v2:** Zod input validation, structured error responses, typed error taxonomy expansion
- **v3-v10:** See roadmap in Obsidian: `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Second Brain/1 Projects/AtelAI Rebuild - Learning Roadmap.md`
- **UI track (week 6+):** Microfrontend architecture, K8s-native deployment
- **AI engineering track:** Spec-driven development → MCP integration → RAG → agent patterns

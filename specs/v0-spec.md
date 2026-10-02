# Spec: Cogsense v0 — POST /ask Endpoint

## 1. Goal

Single Fastify endpoint that forwards a chat request to an
OpenAI-compatible LLM provider and returns the response.

## 2. Inputs

| Field     | Type                       | Required | Description                                      |
| --------- | -------------------------- | -------- | ------------------------------------------------ |
| model     | string                     | yes      | Model ID to use                                  |
| messages  | array of { role, content } | yes      | Chat messages                                    |
| timeoutMs | number                     | no       | Override default LLM call timeout (milliseconds) |

**Message validation rules:**

- `role` must be one of: `MsgRole.System`, `MsgRole.Assistant`, `MsgRole.User`
- `content` must be a non-empty string

## 3. Outputs

### 3.1 Success Response (200)

| Field              | Type   | Source                                 | Description                           |
| ------------------ | ------ | -------------------------------------- | ------------------------------------- |
| id                 | string | provider response `.id`                | Provider-generated response ID        |
| model              | string | provider response `.model`             | Model that processed the request      |
| messages           | array  | mapped from `.choices`                 | See mapping table in section 4        |
| usage.inputTokens  | number | mapped from `.usage.prompt_tokens`     | Input token count                     |
| usage.outputTokens | number | mapped from `.usage.completion_tokens` | Output token count                    |
| elapsedTime        | number | measured in code                       | LLM API call duration in milliseconds |

### 3.2 Error Responses

| HTTP Status | Error Code       | Exception Type    | Response Body                              | When                                    |
| ----------- | ---------------- | ----------------- | ------------------------------------------ | --------------------------------------- |
| 400         | `invalid_input`  | `InputError`      | `{ error: { code, message, input } }`      | Input validation fails                  |
| 408         | `llm_timeout`    | `LLMTimeoutError` | `{ error: { code, message } }`             | LLM call exceeds timeout                |
| 500         | `provider_error` | `ProviderError`   | `{ error: { code, message } }`             | Provider returns an error               |
| 500         | `network_error`  | `NetworkError`    | `{ error: { code, message, requestURL } }` | fetch() fails (DNS, connection refused) |
| 500         | (fallback)       | `DefaultError`    | `{ error: { code, message } }`             | Any unhandled error                     |

## 4. Response Normalization

Provider returns OpenAI chat completion format. Mapping:

| Provider Field                | Output Field          | Notes                                 |
| ----------------------------- | --------------------- | ------------------------------------- |
| `.id`                         | `id`                  | Direct passthrough                    |
| `.model`                      | `model`               | Direct passthrough                    |
| `.choices[i].message.role`    | `messages[i].role`    | Direct passthrough                    |
| `.choices[i].message.content` | `messages[i].content` | Direct passthrough                    |
| `.choices[i].index`           | —                     | Used for ordering only, not in output |
| `.choices[i].finish_reason`   | —                     | Used in code logic, not in output     |
| `.usage.prompt_tokens`        | `usage.inputTokens`   | snake_case → camelCase                |
| `.usage.completion_tokens`    | `usage.outputTokens`  | snake_case → camelCase                |
| `.usage.total_tokens`         | —                     | Not used (derivable: input + output)  |
| `.object`                     | —                     | Not used                              |
| `.created`                    | —                     | Not used                              |

**Provider response validation:**

- If `.choices` is missing or empty → throw `ProviderError`
- If `.choices[i].message` is missing → throw `ProviderError`
- If `.choices[i].message.role` is missing → throw `ProviderError`
- If `.choices[i].message.content` is missing → throw `ProviderError`

## 5. Exception Hierarchy

```
Error (built-in)
  └── DefaultError (base: code, message)
        ├── InputError          code: invalid_input      status: 400
        ├── LLMTimeoutError     code: llm_timeout         status: 408
        ├── ProviderError       code: provider_error      status: 500
        └── NetworkError        code: network_error       status: 500
```

### Exception Details

**DefaultError** — base class for all app errors.

- Fields: `code: string`, `message: string`
- HTTP status: 500 (fallback for any unhandled error)

**InputError** — input validation failure.

- Extends: `DefaultError`
- Code: `invalid_input`
- Additional fields: `input` (the invalid input, for debugging)
- Thrown when:
  - `model` is not defined
  - `messages` field does not exist
  - `messages` is not an array
  - `messages` is an empty array
  - A message has: undefined role, invalid role (not in MsgRole), missing content, undefined content, non-string content, empty string content

**LLMTimeoutError** — LLM call exceeded timeout.

- Extends: `DefaultError`
- Code: `llm_timeout`
- Constructor parameter: `timeout` (number, milliseconds)
- Message: `"LLM Request approached configured timeout (X ms)"`
- Thrown when: elapsed time exceeds `LLM_DEFAULT_TIMEOUT_MS` or `timeoutMs` input parameter

**ProviderError** — provider returned an error.

- Extends: `DefaultError`
- Code: `provider_error`
- Constructor parameter: `requestModel` (string), `message` (string)
- Message: mapped from provider's error response
- Thrown when:
  - Provider returns non-2xx HTTP status
  - Provider response is malformed (missing choices, missing message fields)
  - Model is not available
  - Budget exhausted

**NetworkError** — fetch() failed at the transport level.

- Extends: `DefaultError`
- Code: `network_error`
- HTTP response fields: `code`, `message`, `requestURL`
- Internal fields (for logging only, NOT in HTTP response):
  - `requestURL`: the URL that failed
  - `body`: the request body (contains user input only, no credentials)
- Thrown when: `fetch()` throws (DNS failure, connection refused, network unreachable)

## 6. Configuration

| Env Variable             | Type   | Required | Default  | Description                                              |
| ------------------------ | ------ | -------- | -------- | -------------------------------------------------------- |
| `LLM_PROVIDER`           | string | yes      | —        | Provider endpoint URL (e.g., `http://127.0.0.1:8000/v1`) |
| `LLM_PROVIDER_API_KEY`   | string | yes      | —        | Bearer token for provider auth                           |
| `LLM_DEFAULT_TIMEOUT_MS` | number | no       | `600000` | Default LLM call timeout in milliseconds                 |

`.env.example` committed to repo. `.env` gitignored.

## 7. File Structure

```
src/
  types.ts          — MsgRole enum, request/response types
  errors.ts         — DefaultError, InputError, LLMTimeoutError, ProviderError, NetworkError
  config.ts         — env var resolution
  provider.ts       — LLM client (fetch + normalize + throw typed errors)
  server.ts         — Fastify setup + route registration + error handler
specs/
  v0-spec.md
.env.example
.gitignore
```

## 8. Acceptance Criteria

- [ ] POST /ask with valid body returns 200 with normalized response
- [ ] POST /ask with missing model returns 400 with `invalid_input` code
- [ ] POST /ask with empty messages returns 400 with `invalid_input` code
- [ ] POST /ask with malformed message returns 400 with `invalid_input` code
- [ ] Provider timeout returns 408 with `llm_timeout` code
- [ ] Provider error returns 500 with `provider_error` code and original error message
- [ ] Network error returns 500 with `network_error` code and requestURL
- [ ] All config via env vars, no hardcoded URLs
- [ ] `.env.example` created, committed; `.env*` ignored except `.env.example`
- [ ] Output matches normalization mapping in section 4
- [ ] All exceptions extend `DefaultError`

## 9. Constraints

- Fastify for HTTP server
- TypeScript strict mode
- ESM only
- Separate type definitions (`types.ts`)
- SOLID principles
- Vite for toolchain

## 10. Interview Question

"How does an HTTP API forward a request to an LLM provider?"

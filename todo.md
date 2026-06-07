# Scam Check Tool TODO

- [x] Add ANTHROPIC_API_KEY env variable via webdev_request_secrets
- [x] Create server/scamCheck.ts — Haiku LLM call, in-memory rate limiter, input validation
- [x] Register scamCheck router in server/routers.ts
- [x] Create client/src/pages/ScamDetector.tsx — ungated /scamdetector page with form + results card
- [x] Add /scamdetector route in client/src/App.tsx
- [x] Write vitest unit tests for the scam-check router
- [x] Test three required messages and capture outputs

## Round 2 additions

- [x] DB schema: scam_check_logs table (id, risk_level, created_at only — no user content)
- [x] Apply migration via webdev_execute_sql
- [x] Server: log risk_level + timestamp in scamCheck.check mutation (no message/user data)
- [x] UI: Copy result button on results card (clean plain-text output)
- [x] UI: Brand Lookup unlock prompt below every result with Typeform link
- [x] UI: "Check a deal" CTA on Home page linking to /scamdetector
- [x] Vitest: test that log procedure stores only allowed fields

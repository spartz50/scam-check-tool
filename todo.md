# Scam Check Tool TODO

- [x] Add ANTHROPIC_API_KEY env variable via webdev_request_secrets
- [x] Create server/scamCheck.ts — Haiku LLM call, in-memory rate limiter, input validation
- [x] Register scamCheck router in server/routers.ts
- [x] Create client/src/pages/ScamDetector.tsx — ungated /scamdetector page with form + results card
- [x] Add /scamdetector route in client/src/App.tsx
- [x] Write vitest unit tests for the scam-check router
- [x] Test three required messages and capture outputs

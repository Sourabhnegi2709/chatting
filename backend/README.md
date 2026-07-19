# Chattify Backend — v2

## Setup

```bash
npm install
cp .env.example .env   # fill in MONGO_URL and JWT_SECRET at minimum
npm run dev             # or: npm start
```

The server refuses to boot if `MONGO_URL` or `JWT_SECRET` is missing — this is
intentional (see "What changed" below).

## What changed, and why

### Users no longer disappear
The old `user.controller.js` fell back to an in-memory `Map()` whenever
`MONGO_URL` wasn't set. Every restart, redeploy, or crash silently wiped every
registered user. That fallback is gone. The database is now the only source
of truth, and the server fails to start rather than run on a store that
forgets everything.

### Auth
- Password hashing moved into `User`'s pre-save hook — one implementation,
  can't be forgotten on a future write path.
- `requireAuth` middleware re-verifies the user still exists in the DB on
  every request (a deleted account can't keep using an old token).
- `JWT_SECRET` no longer has an insecure hardcoded fallback.
- Login/register are rate-limited (20 attempts / 15 min) to blunt brute-force
  and credential-stuffing.
- Fixed a real cookie bug: `sameSite: 'Strict'` blocks the auth cookie on
  cross-site requests entirely, which breaks a frontend hosted on a different
  domain than the API (e.g. Vercel frontend + Render/Railway backend). It's
  now `'None'` when `COOKIE_SECURE=true`, `'Lax'` otherwise.

### Chat persistence & scale
- `Message` now references `User` via `ObjectId` (so you can `.populate()`
  sender/recipient details) and has a compound index on
  `{ roomId, createdAt }` — the index that actually matches how messages are
  queried. Without it, conversation loads become full collection scans as the
  table grows.
- `join-chat` now loads the most recent 50 messages instead of the entire
  history. A new `load-more-messages` socket event and a REST endpoint
  (`GET /api/messages/:contactId?before=<id>`) support paginated/infinite
  scroll for older messages.
- Messages are persisted **before** being broadcast, and the broadcast now
  carries the real database `_id` — previously the client-generated id was
  trusted as-is.
- Multi-device support: a user connected from two tabs/devices no longer
  overwrites their own presence entry.

### Calls
- The `Meeting` model existed but was never imported anywhere. It's now a
  functional call log — every call writes a record (ringing → connected /
  rejected / ended, with duration) — backing a new
  `GET /api/calls/history` endpoint.
- The broken `socket.route.js` (wrong import, no router exported, and
  conceptually unnecessary since Socket.IO attaches directly to the raw HTTP
  server, not through Express routes) has been removed.

### Scaling to multiple instances
Everything currently runs correctly on a single server instance out of the
box. To run multiple instances behind a load balancer:

1. `npm install @socket.io/redis-adapter redis`
2. Set `REDIS_URL` in your environment.
3. That's it — `socket/chat.js` detects `REDIS_URL` and attaches the Redis
   adapter automatically, so `io.emit(...)` / `io.to(room).emit(...)` fan out
   across all instances instead of only reaching clients on the instance that
   received the event.

Note: presence (`userSocketMap`) and in-flight call state (`activeCalls`)
still live in each instance's memory. That's fine for realtime routing
(a user's socket is always on exactly one instance), but if you need
presence/call-state to be queryable cluster-wide (e.g. an admin dashboard),
move those two maps into Redis as well — ask and I can wire that up.

### API surface — unchanged where your frontend depends on it
All existing endpoints and socket events keep the same names and payload
shapes:
- `POST /api/users/login`, `/register`, `/logout`, `GET /me`, `PUT /profile`,
  `GET /` (contacts)
- Socket events: `register-user`, `join-chat`, `send-message`,
  `receive-message`, `message-history`, `start-call`, `incoming-call`,
  `accept-call`, `call-accepted`, `reject-call`, `call-rejected`,
  `ice-candidate`, `end-call`, `call-ended`, `users-online`, `user-online`,
  `user-offline`

New, additive-only (safe to ignore if your frontend doesn't use them yet):
- `GET /api/messages/:contactId` (paginated history), `PATCH
  /api/messages/:contactId/read`
- `GET /api/calls/history`
- Socket: `load-more-messages` → `more-messages`, `typing-start` /
  `typing-stop` → `user-typing` / `user-stopped-typing`

## Folder structure

```
config/       env validation, DB connection, CORS policy
models/       User, Message, Meeting (Mongoose schemas)
middlewares/  auth, error handling, rate limiting, sanitization
controllers/  request handlers, no DB/session logic duplicated across routes
routes/       thin route -> controller wiring
socket/       Socket.IO connection + event handlers
```

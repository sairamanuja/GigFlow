# GigFlow Architecture & Operations

## Overview
Full-stack freelance marketplace with realtime hire notifications and cross-site auth.
- Frontend: React (Vite), React Router SPA, Tailwind utilities, Socket.io client.
- Backend: Node/Express, MongoDB (Mongoose), JWT auth via HttpOnly cookies, Socket.io realtime.
- Hosting (current): Frontend on Vercel; Backend on Render; MongoDB via `MONGODB_URI`.

## Domain Model
- User: `{ _id, name, email, passwordHash, createdAt, updatedAt }`
- Gig: `{ _id, title, description, budget, ownerId: ObjectId(User), status: open|assigned, createdAt, updatedAt }`
- Bid: `{ _id, gigId: ObjectId(Gig), freelancerId: ObjectId(User), message, price, status: pending|hired|rejected, createdAt, updatedAt }`

## Backend Architecture
- Entry: `src/server.js` builds Express + HTTP server + Socket.io; CORS origin = `CLIENT_ORIGIN`; credentials true.
- Middleware stack: helmet (CORP/COEP relaxed for cross-origin requests), cors, express.json, cookie-parser, request logging (via console), error handler.
- Routing: modular controllers under `src/controllers/*` with Zod validation via `validateRequest` and auth via `authRequired` where needed.
- Auth:
  - JWT signed with `JWT_SECRET`, stored in HttpOnly cookie `COOKIE_NAME`.
  - Cookies: `SameSite=None; Secure` in production, `Lax` in dev; path `/`.
- Core routes:
  - Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`.
  - Gigs: `/api/gigs` GET (open list + search), `/api/gigs/:id` GET (detail + owner), `/api/gigs` POST (create; auth), `/api/gigs/mine` GET (owner gigs; auth).
  - Bids: `/api/bids` POST (place bid; auth), `/api/bids/:gigId` GET (owner views bids; auth), `/api/bids/mine` GET (freelancer bids; auth), `/api/bids/:bidId/hire` PATCH (owner hires; auth).
- Hiring transaction: Mongo session with snapshot readConcern and majority writeConcern; sets gig to assigned, target bid to hired, other bids to rejected. Concurrent hires resolve to one winner via atomic update semantics.
- Realtime: Socket.io registry in `src/realtime/socket.js`; users join room = userId; hire event emits `{ bidId, gigId }` to hired freelancer.
- Validation: Zod schemas per route; 400 on validation errors with field-level details.
- Error handling: central handler maps known errors to 400/401/403/404; unexpected → 500 with message.
- Commands: `npm start` (node src/server.js). `npm run dev` uses nodemon for local only.
- Env (Render): `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN` (frontend origin), `COOKIE_NAME` (default gigflow_token), `NODE_ENV=production`, `PORT` (Render sets).

## Request Lifecycles
- Auth (login/register): request validated → user created/found → password hashed/verified → JWT issued → HttpOnly cookie set with appropriate SameSite/Secure → `/auth/me` used by frontend to hydrate session.
- Protected API call: `authRequired` reads cookie, verifies JWT, loads user, attaches `req.user`, continues to controller.
- Hire: owner PATCH `/api/bids/:bidId/hire` → transaction updates gig/bids → Socket emit `hire` to freelancer room → controller responds with updated records.

## Security & Compliance
- Cookies: HttpOnly, SameSite=None+Secure in prod to allow cross-site requests from Vercel to Render; ensure HTTPS in production.
- CORS: origin restricted to `CLIENT_ORIGIN`, credentials allowed.
- Helmet: baseline protections; CORP/COEP relaxed to allow cross-site cookies and Socket.io.
- Passwords: bcrypt hashes only; never returned.
- Input: Zod validation on all bodies/params; rejects malformed data early.

## Realtime Flow
1) Socket connects with query `userId`; server joins room = userId.
2) On hire, server emits `hire` to the hired freelancer room.
3) Client `SocketProvider` listens → shows toast → `MyBids` triggers refetch to reflect new status.

## Frontend Architecture
- Entry: Vite + React Router SPA; `vercel.json` rewrites all routes to `index.html`.
- State/Providers:
  - `AuthProvider`: manages login/register/logout; hydrates via `/auth/me`; stores user.
  - `SocketProvider`: connects to `VITE_SOCKET_URL` (or derived from `VITE_API_URL` minus `/api`); joins with userId; listens for `hire`.
  - `ToastProvider`: global toasts for success/errors and hire events.
- Data fetching: `apiFetch` wraps fetch with `credentials: include`, base URL `VITE_API_URL` (default http://localhost:5000/api), raises validation errors with messages.
- Pages and flows:
  - Home: marketing hero, responsive layout.
  - BrowseGigs: list/search gigs; cards link to detail.
  - GigDetail: fetch gig + owner; owner sees bids and hires; freelancers can bid.
  - PostGig: authenticated gig creation.
  - MyGigs: owner’s gigs.
  - MyBids: freelancer’s bids; listens for realtime hire to update.
  - Auth screens: login/register; update AuthContext on success.
- Layout: `Layout` wraps `Navbar` and `Footer`; mobile nav uses drawer pattern when enabled.
- Styling: Tailwind utility classes; responsive tweaks on hero, forms, lists, buttons.

## Environment & Config
- Frontend (Vercel): `VITE_API_URL=https://gigflow-vpij.onrender.com/api`, `VITE_SOCKET_URL=https://gigflow-vpij.onrender.com` (or omit to auto-derive), `VITE_NODE_ENV=production` optional.
- Backend (Render): `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN` (match Vercel origin), `COOKIE_NAME` (optional), `NODE_ENV=production`.
- Local dev: frontend at `http://localhost:5173`, backend at `http://localhost:5000`.

## Operational Notes
- Run locally: backend `npm install && npm run dev`; frontend `npm install && npm run dev`; ensure env vars set as above.
- Health: backend `GET /health` responds when server and DB are up.
- SPA routing: `vercel.json` rewrites `/(.*)` → `/index.html` so deep links work.
- Deployment: Render command `npm start`; Vercel auto-builds Vite; set env vars before deploy; clear cookies after cookie policy changes.

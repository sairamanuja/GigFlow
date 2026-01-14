# 🚀 GigFlow – Full-Stack Freelance Marketplace

GigFlow is a full-stack freelance marketplace that enables clients to post gigs, freelancers to bid, and both parties to receive realtime hire notifications.
It is designed with modern web architecture, secure cross-site authentication, and scalable realtime communication.

---

## 📌 Features

- Secure authentication with JWT + HttpOnly cookies
- Cross-site auth (Vercel frontend ↔ Render backend)
- Gig posting & browsing
- Bidding system with hire workflow
- Realtime hire notifications using Socket.io
- Atomic hiring with MongoDB transactions
- Strong validation and security practices
- Fully responsive UI with Tailwind CSS

---

## 🧱 Tech Stack

### Frontend
- React (Vite)
- React Router (SPA)
- Tailwind CSS
- Socket.io Client
- Context API

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.io
- JWT Authentication
- Zod Validation
- bcrypt

### Hosting
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## 🧠 System Architecture

Vercel (React SPA)
→ HTTPS + Cookies  
→ Render (Node + Express + Socket.io)  
→ MongoDB Atlas

---

## 🔁 Backend Flow (Code-Level)

This section explains the backend flow exactly as implemented in the codebase.

### 1) Entry / Server Boot

**File:** `backend/src/server.js`

- Creates Express app and HTTP server, then attaches Socket.IO.
- Adds middleware:
	- `helmet()` for security headers
	- `cors({ origin: env.clientOrigin, credentials: true })` for cookie-based cross-site requests
	- `express.json()` for JSON bodies
	- `cookieParser()` so auth middleware can read cookies
- Mounts routes:
	- `/api/auth` → `auth.routes.js`
	- `/api/gigs` → `gigs.routes.js`
	- `/api/bids` → `bids.routes.js`
- Adds a `/health` endpoint.
- Registers `errorHandler` at the end (global error middleware).
- Connects to MongoDB (`connectDB()`), then starts listening.

### 2) Environment + DB Connection

**Files:**

- `backend/src/config/env.js`
	- Loads `.env` via `dotenv.config()`.
	- Centralizes runtime configuration like `MONGODB_URI`, `CLIENT_ORIGIN`, `JWT_SECRET`, `COOKIE_NAME`.
- `backend/src/config/db.js`
	- Connects Mongoose to MongoDB using `mongoose.connect(env.mongoUri)`.

### 3) Models (MongoDB Collections)

**Files:**

- `backend/src/models/User.js`
	- Stores `name`, `email`, `password` (hashed string).
- `backend/src/models/Gig.js`
	- Stores gig data and `status`:
		- `open` (accepting bids)
		- `assigned` (someone hired)
- `backend/src/models/Bid.js`
	- Stores bid data and `status`:
		- `pending` (default)
		- `hired`
		- `rejected`

### 4) Request Validation (Zod)

**File:** `backend/src/middleware/validateRequest.js`

- Each route defines a Zod schema.
- `validateRequest(schema)` runs `schema.safeParse({ body, params, query })`.
- If invalid → returns `400` with `{ message: "Validation failed", issues: [...] }`.

### 5) Authentication (JWT in HttpOnly Cookie)

**Files:**

- `backend/src/utils/jwt.js`
	- `signToken(payload)` creates JWT (expires in 7 days).
	- `verifyToken(token)` verifies JWT.
- `backend/src/middleware/authRequired.js`
	- Reads JWT from `req.cookies[env.cookieName]`.
	- Verifies token and attaches decoded payload to `req.user`.
	- If missing/invalid → `401 Unauthorized`.
- `backend/src/controllers/auth.controller.js`
	- `register`:
		- checks if email exists
		- hashes password using bcrypt
		- creates user
		- signs JWT and sets cookie
	- `login`:
		- validates password using bcrypt
		- signs JWT and sets cookie
	- `logout` clears cookie
	- `me` returns the current user profile (based on `req.user.id`)
- `backend/src/routes/auth.routes.js`
	- Wires endpoints and applies validation/auth middleware.

### 6) Gigs Flow

**Files:** `backend/src/routes/gigs.routes.js`, `backend/src/controllers/gigs.controller.js`

- `GET /api/gigs`
	- Public endpoint.
	- Returns only gigs with `status: open`.
	- Supports a simple title search via `?search=`.
- `GET /api/gigs/mine`
	- Protected endpoint.
	- Returns gigs where `ownerId === req.user.id`.
- `GET /api/gigs/:id`
	- Public endpoint.
	- Returns gig + `owner` info (name/email).
- `POST /api/gigs`
	- Protected + validated.
	- Creates a gig with `ownerId = req.user.id`.

### 7) Bids Flow

**Files:** `backend/src/routes/bids.routes.js`, `backend/src/controllers/bids.controller.js`

- `POST /api/bids` (create bid)
	- Protected + validated.
	- Business rules enforced:
		- gig must exist
		- gig must be `open`
		- gig owner cannot bid on their own gig
	- Creates a bid with `freelancerId = req.user.id`.

- `GET /api/bids/:gigId` (list bids for a gig)
	- Protected.
	- Only the gig owner can view bids.
	- Populates freelancer info and returns a normalized payload.

- `GET /api/bids/mine` (list my bids)
	- Protected.
	- Returns bids for the logged-in freelancer, with gig summary.

### 8) Hiring = MongoDB Transaction (Atomic “Hire One, Reject Others”)

**File:** `backend/src/controllers/bids.controller.js` (`hireBid`)

Hiring is the only place where a **MongoDB transaction** is used.

How it works:

1. Starts a Mongoose session: `mongoose.startSession()`.
2. Runs `session.withTransaction(async () => { ... })` with:
	 - `readConcern: { level: "snapshot" }`
	 - `writeConcern: { w: "majority" }`
3. Loads bid + gig inside the session.
4. Validates constraints:
	 - request user must be the gig owner
	 - gig must still be `open`
5. Uses conditional updates to prevent race conditions:
	 - update gig only if `status: "open"` → set to `assigned`
	 - update bid only if `status: "pending"` → set to `hired`
6. Rejects all other bids for the same gig using `updateMany`.

Why a transaction is needed:

- Without it, two owners/actions could “hire” concurrently and cause mixed states.
- The combination of:
	- session transaction
	- conditional `findOneAndUpdate` checks on status
	ensures only one bid can be hired and data stays consistent.

### 9) Real-time Notifications (Socket.IO)

**Files:** `backend/src/realtime/socket.js`, `backend/src/server.js`

- Server initializes Socket.IO in `server.js` and calls `initSocket(io)`.
- On connection:
	- reads `userId` from `socket.handshake.query.userId`
	- joins the room with that `userId`
	- tracks sockets in-memory (`Map<userId, Set<socketId>>`)
- When a bid is hired:
	- backend responds to the HTTP request
	- then emits a best-effort socket event to the hired freelancer:
		- event: `hire`
		- payload: `{ gigId, gigTitle }`

Note: the socket auth is currently “userId in query” (no JWT verification on socket connect). The HTTP APIs are still protected via cookie JWT.

### 10) Error Handling

**File:** `backend/src/middleware/errorHandler.js`

- Any controller calling `next(err)` ends up here.
- Responds with `{ message }` and status (default `500`).

---

## 📂 Domain Model

### User
{ _id, name, email, passwordHash, createdAt, updatedAt }

### Gig
{ _id, title, description, budget, ownerId, status, createdAt, updatedAt }

### Bid
{ _id, gigId, freelancerId, message, price, status, createdAt, updatedAt }

---

## 🔌 API Routes

### Auth
POST /api/auth/register  
POST /api/auth/login  
POST /api/auth/logout  
GET  /api/auth/me  

### Gigs
GET  /api/gigs  
GET  /api/gigs/:id  
POST /api/gigs  
GET  /api/gigs/mine  

### Bids
POST /api/bids  
GET  /api/bids/:gigId  
GET  /api/bids/mine  
PATCH /api/bids/:bidId/hire  

---

## ⚙️ Hiring Transaction

- MongoDB transaction
- Only one bid can be hired
- Other bids automatically rejected
- Realtime event emitted to freelancer

---

## ⚡ Realtime Flow

1. Client connects with userId
2. Server joins socket room
3. Hire event emitted
4. Client receives toast + refetches data

---

## 🎨 Frontend Architecture (React + Context API + WebSockets)

This frontend is a React SPA (Vite) that talks to the backend via HTTP (cookies) and listens for realtime events via Socket.IO.

### 1) App Composition

**File:** `frontend/src/App.jsx`

Providers are nested like this:

1. `AuthProvider`
2. `ToastProvider`
3. `SocketProvider`
4. `BrowserRouter`

This matters because:

- Socket depends on the current authenticated user (from AuthContext).
- Socket uses ToastContext to show realtime notifications.

### 2) HTTP Layer (apiFetch)

**File:** `frontend/src/lib/api.js`

- `apiFetch(path, options)` wraps `fetch()`.
- Uses `credentials: "include"` so the browser sends the HttpOnly auth cookie.
- On backend errors, throws an Error with:
	- `error.message` from backend `{ message }`
	- optional `error.issues` for Zod validation errors

Env var:

- `VITE_API_URL` defaults to `http://localhost:5000/api`

### 3) AuthContext (Session + Login/Register/Logout)

**File:** `frontend/src/context/AuthContext.jsx`

- On first load, it “hydrates” the session by calling `GET /auth/me`.
	- If cookie is valid → sets `user`
	- If not logged in → silently continues
- Exposes:
	- `user`, `isLoggedIn`
	- `login()` → `POST /auth/login`
	- `register()` → `POST /auth/register`
	- `logout()` → `POST /auth/logout` then clears local user

### 4) SocketContext (Socket.IO Client)

**File:** `frontend/src/context/SocketContext.jsx`

- Creates a socket only when a user is logged in.
- Connects using:
	- `VITE_SOCKET_URL` if provided
	- else derives it from `VITE_API_URL` by removing `/api`
- Sends `userId` as a query param: `io(url, { query: { userId: user.id } })`
- Listens for:
	- `hire` → shows success toast (“You’ve been hired!”)
	- `connect_error` → shows warning toast
- On logout/unmount, disconnects the socket.

### 5) ToastContext (UI Notifications)

**File:** `frontend/src/context/ToastContext.jsx`

- Provides `addToast({ title, description, variant })`.
- Displays toasts in the bottom-right.
- Auto-dismisses after a duration.

### 6) Where realtime updates affect pages

- `frontend/src/pages/MyBids.jsx`
	- Subscribes to the socket `hire` event.
	- When `hire` arrives, it refetches `GET /bids/mine` so the UI reflects status changes.
- `frontend/src/pages/GigDetail.jsx`
	- Owners can call `PATCH /bids/:bidId/hire`.
	- After hiring, it updates local state optimistically for the bids list.

- AuthProvider
- SocketProvider
- ToastProvider

Pages:
- Home
- Browse Gigs
- Gig Detail
- Post Gig
- My Gigs
- My Bids
- Login / Register

---

## 🔐 Security

- HttpOnly cookies
- SameSite=None; Secure (production)
- bcrypt password hashing
- Zod request validation
- Helmet security headers
- Strict CORS

---

## 🌱 Environment Variables

### Frontend (Vercel)
VITE_API_URL  
VITE_SOCKET_URL  

### Backend (Render)
MONGODB_URI  
JWT_SECRET  
CLIENT_ORIGIN  
COOKIE_NAME  
NODE_ENV  

---

## 🧪 Local Development

Backend:
npm install  
npm run dev  

Frontend:
npm install  
npm run dev  

---

## 🩺 Health Check

GET /health

---

## 🚀 Deployment Notes

- SPA routing handled by Vercel
- Render runs npm start
- HTTPS required for cookies

---

## 👨‍💻 Author

Ramanuja  
Full-Stack Developer | Backend | Realtime Systems | System Design


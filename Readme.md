# 🚀 GigFlow – Full-Stack Freelance Marketplace (Extended)

GigFlow is a **production-grade full-stack freelance marketplace** featuring secure cross-site authentication, realtime hire notifications, and transactional hiring logic.

This document provides **deep architectural insight**, **API specifications**, and **operational details** suitable for **system design interviews, open-source review, and production onboarding**.

---

## 📌 Core Features

- JWT authentication via **HttpOnly cookies**
- Cross-origin auth (Vercel ↔ Render)
- Gig posting & bidding system
- Atomic hire workflow using MongoDB transactions
- Realtime hire notifications (Socket.io)
- Strong request validation (Zod)
- Secure cookies, CORS, Helmet
- Responsive Tailwind UI

---

## 🧱 Tech Stack

### Frontend
- React (Vite)
- React Router (SPA)
- Tailwind CSS
- Socket.io Client

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.io
- JWT + bcrypt
- Zod validation

### Infrastructure
- Frontend: **Vercel**
- Backend: **Render**
- Database: **MongoDB Atlas**

---

## 🧠 High-Level Architecture

```
┌──────────────┐
│   Browser    │
│  (React SPA) │
└──────┬───────┘
       │ HTTPS + Cookies
       ▼
┌──────────────────────┐
│  Node.js + Express   │
│  JWT | Zod | Helmet  │
│  Socket.io Server    │
└──────┬───────────────┘
       │ Mongoose
       ▼
┌──────────────────────┐
│   MongoDB Atlas      │
│ Transactions Enabled │
└──────────────────────┘
```

---

## 📂 Domain Model

### User
```ts
{
  _id,
  name,
  email,
  passwordHash,
  createdAt,
  updatedAt
}
```

### Gig
```ts
{
  _id,
  title,
  description,
  budget,
  ownerId,
  status: "open" | "assigned",
  createdAt,
  updatedAt
}
```

### Bid
```ts
{
  _id,
  gigId,
  freelancerId,
  message,
  price,
  status: "pending" | "hired" | "rejected",
  createdAt,
  updatedAt
}
```

---

## 🔐 Authentication Flow

```
Login/Register
   ↓
JWT Issued
   ↓
Stored in HttpOnly Cookie
   ↓
Sent automatically on every request
   ↓
authRequired middleware
```

- Cookie settings:
  - `HttpOnly`
  - `SameSite=None`
  - `Secure` (production)

---

## 🔌 API Specification

### Auth APIs

| Method | Endpoint | Description | Auth |
|------|---------|-------------|------|
| POST | /api/auth/register | Register user | ❌ |
| POST | /api/auth/login | Login user | ❌ |
| POST | /api/auth/logout | Logout | ✅ |
| GET | /api/auth/me | Current user | ✅ |

---

### Gig APIs

| Method | Endpoint | Description | Auth |
|------|---------|-------------|------|
| GET | /api/gigs | Browse gigs | ❌ |
| GET | /api/gigs/:id | Gig detail | ❌ |
| POST | /api/gigs | Create gig | ✅ |
| GET | /api/gigs/mine | Owner gigs | ✅ |

---

### Bid APIs

| Method | Endpoint | Description | Auth |
|------|---------|-------------|------|
| POST | /api/bids | Place bid | ✅ |
| GET | /api/bids/:gigId | View bids (owner) | ✅ |
| GET | /api/bids/mine | My bids | ✅ |
| PATCH | /api/bids/:bidId/hire | Hire freelancer | ✅ |

---

## ⚙️ Hiring Transaction (Critical Section)

```
Start Mongo Session
  ├─ Validate ownership
  ├─ Set gig → assigned
  ├─ Set chosen bid → hired
  ├─ Reject other bids
Commit Transaction
Emit socket event
```

- Guarantees **single winner**
- Handles concurrent hire attempts safely

---

## ⚡ Realtime System

### Flow
1. Client connects with `userId`
2. Server joins room = `userId`
3. Hire triggers `hire` event
4. Client shows toast + refetch

```
Client ──▶ Socket Server ──▶ User Room
```

---

## 🎨 Frontend Structure

```
src/
 ├─ pages/
 ├─ components/
 ├─ context/
 │   ├─ AuthProvider
 │   ├─ SocketProvider
 │   └─ ToastProvider
 ├─ api/
 │   └─ apiFetch.js
```

---

## 🛡️ Security Practices

- No tokens in localStorage
- HttpOnly cookies
- bcrypt hashing
- Zod request validation
- Helmet security headers
- Strict CORS origin

---

## 🩺 Health Check

```
GET /health
```

Returns server + DB status.

---

## 🚀 Deployment Notes

- Vercel SPA routing via `vercel.json`
- Render runs `npm start`
- HTTPS required for cookies
- Clear cookies after auth config changes

---

## 📈 Future Enhancements

- Payments (Stripe)
- Ratings & reviews
- Redis for Socket.io scaling
- Background jobs
- Admin dashboard

---

## 👨‍💻 Author

**Ramanuja**  
Full-Stack Developer | Backend | Realtime Systems | System Design

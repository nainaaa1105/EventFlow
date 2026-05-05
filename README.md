# ⚡ EventFlow — Full-Stack MERN Event Management Platform

A complete event management web application built with the MERN stack (MongoDB, Express, React, Node.js), featuring real-time updates via Socket.io.

---

## 🚀 Features

- 🔐 **JWT Authentication** — Register & Login with secure token-based auth
- 🔍 **Explore Events** — Browse events with category filters
- 📝 **Create Events** — Logged-in users can publish events
- 🎟️ **RSVP System** — One RSVP per user per event, with capacity management
- ⚡ **Real-Time Updates** — Capacity updates across clients via Socket.io
- 📱 **Responsive Design** — Works on all screen sizes

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, React Router v6, Bootstrap 5 |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB, Mongoose                   |
| Auth       | JWT (jsonwebtoken), bcryptjs        |
| Real-time  | Socket.io                           |
| Build Tool | Vite                                |

---

## 📁 Project Structure

```
we-project/
├── server/                   # Backend (Node.js + Express)
│   ├── models/
│   │   ├── User.js           # User schema (name, email, hashed password)
│   │   └── Event.js          # Event schema (title, date, attendees, etc.)
│   ├── controllers/
│   │   ├── authController.js # Register & Login logic
│   │   └── eventController.js# CRUD + RSVP logic
│   ├── routes/
│   │   ├── authRoutes.js     # /api/auth/*
│   │   └── eventRoutes.js    # /api/events/*
│   ├── middleware/
│   │   └── authMiddleware.js # JWT verification
│   ├── .env                  # Environment variables
│   └── index.js              # Server entry point
│
└── client/                   # Frontend (React + Vite)
    └── src/
        ├── components/
        │   └── Navbar.jsx
        ├── pages/
        │   ├── ExplorePage.jsx
        │   ├── EventDetailPage.jsx
        │   ├── CreateEventPage.jsx
        │   └── AuthPage.jsx
        ├── services/
        │   └── api.js        # Axios instance + API calls
        ├── context/
        │   └── AuthContext.jsx
        ├── App.jsx
        └── index.css         # Custom design system
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (local or MongoDB Atlas)
- npm

---

### 1. Clone / Open the Project

```bash
cd we-project
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Edit `.env` with your config:
```env
MONGO_URI=mongodb://localhost:27017/eventflow
JWT_SECRET=your_secret_key_here
PORT=5000
```

Start the server:
```bash
npm run dev       # Development (nodemon)
# or
npm start         # Production
```

The API will run at **http://localhost:5000**

---

### 3. Frontend Setup

Open a new terminal:
```bash
cd client
npm install
npm run dev
```

The React app will run at **http://localhost:5173**

---

## 🔌 API Documentation

### Auth Routes

| Method | Endpoint              | Body                          | Description        |
|--------|-----------------------|-------------------------------|--------------------|
| POST   | `/api/auth/register`  | `{name, email, password}`     | Register new user  |
| POST   | `/api/auth/login`     | `{email, password}`           | Login user         |

**Response (both):**
```json
{
  "message": "...",
  "token": "JWT_TOKEN",
  "user": { "id": "...", "name": "...", "email": "..." }
}
```

---

### Event Routes

| Method | Endpoint                  | Auth? | Description              |
|--------|---------------------------|-------|--------------------------|
| GET    | `/api/events`             | No    | Get all events           |
| GET    | `/api/events?category=Tech` | No  | Filter by category       |
| GET    | `/api/events/:id`         | No    | Get single event         |
| POST   | `/api/events`             | ✅ Yes | Create new event         |
| PUT    | `/api/events/:id`         | ✅ Yes | Update event (owner only)|
| POST   | `/api/events/:id/rsvp`    | ✅ Yes | RSVP to event            |

**Create Event Body:**
```json
{
  "title": "AI Summit 2025",
  "description": "...",
  "category": "Tech",
  "date": "2025-09-15T10:00:00.000Z",
  "location": "New York, NY",
  "capacity": 200,
  "imageUrl": "https://example.com/image.jpg"
}
```

**Protected Routes** — Add header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

### Real-Time Events (Socket.io)

On RSVP, the server emits `rsvp-update` to all connected clients:
```json
{
  "eventId": "...",
  "attendeesCount": 42,
  "spotsLeft": 158
}
```

---

## 🗄️ Database Models

### User
| Field     | Type   | Notes                 |
|-----------|--------|-----------------------|
| name      | String | Required              |
| email     | String | Required, unique      |
| password  | String | Hashed with bcryptjs  |

### Event
| Field       | Type     | Notes                        |
|-------------|----------|------------------------------|
| title       | String   | Required                     |
| description | String   | Required                     |
| category    | String   | Enum: Tech, Business, etc.   |
| date        | Date     | Required                     |
| location    | String   | Required                     |
| capacity    | Number   | Required, min 1              |
| attendees   | [ObjectId] | References to Users        |
| imageUrl    | String   | Optional                     |
| createdBy   | ObjectId | Reference to User            |

---

## 🎨 Pages Overview

| Page         | Route          | Auth Required |
|--------------|----------------|---------------|
| Explore      | `/`            | No            |
| Event Detail | `/events/:id`  | No (RSVP needs auth) |
| Auth         | `/auth`        | No            |
| Create Event | `/create`      | ✅ Yes         |

---

## 📝 Environment Variables

```env
# server/.env
MONGO_URI=mongodb://localhost:27017/eventflow
JWT_SECRET=your_super_secret_key
PORT=5000
```

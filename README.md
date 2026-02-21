# ChatKings (Prediction King)

## 1. App Summary

ChatKings solves the problem of keeping a group of sports fans engaged and accountable around game predictions. The primary user is a sports fan who wants to compete with friends by wagering in-app points on game outcomes. Users join group chats, where one member holds the "King" title and creates predictions for the group to wager on. When a prediction resolves, points are redistributed based on correct picks, and a daily strike system discourages bad-faith behavior. Over time, a leaderboard tracks who has accumulated the most points within each chat, creating an ongoing, season-long competition. The app brings together group chat, live-score context, and prediction wagering into a single mobile-first experience.

---

## 2. Tech Stack

**Frontend**
- React 18 with TypeScript
- Vite (build tool and dev server)
- Tailwind CSS + shadcn/ui component library
- React Router v6
- TanStack React Query

**Backend**
- Node.js (v18+)
- Express 4

**Database**
- PostgreSQL 15

**Authentication**
- Not yet implemented (planned for a future iteration)

**External Services / APIs**
- None (live scores are currently mocked; a sports-data API integration is planned)

---

## 3. Architecture Diagram

```
  ┌──────┐  browser interactions
  │ User │──────────────────────────────────────────────┐
  └──────┘                                              ▼
                                           ┌────────────────────────┐
                                           │  Frontend (Browser)    │
                                           │  React + Vite          │
                                           │  port 5173             │
                                           └───────────┬────────────┘
                                                       │  HTTP / JSON
                              GET /api/chats/:id/msgs  │
                              POST /api/chats/:id/msgs │
                                                       ▼
                                           ┌────────────────────────┐
                                           │  Backend               │
                                           │  Node.js + Express     │
                                           │  port 3001             │
                                           └───────────┬────────────┘
                                                       │  SQL (pg driver)
                                                       ▼
                                           ┌────────────────────────┐
                                           │  Database              │
                                           │  PostgreSQL            │
                                           │  port 5432             │
                                           │  db: chatkings         │
                                           └────────────────────────┘
```

---

## 4. Prerequisites

| Software | Minimum Version | Verify with | Install |
|---|---|---|---|
| Node.js | 18 | `node -v` | https://nodejs.org |
| npm | 9 | `npm -v` | (bundled with Node) |
| PostgreSQL | 14 | `psql --version` | https://www.postgresql.org/download/ |
| psql (CLI) | 14 | `psql --version` | (bundled with PostgreSQL) |

Make sure `psql` is available in your system PATH before proceeding.

---

## 5. Installation and Setup

### Clone the repository

```bash
git clone https://github.com/JacobDishman/prediction-king.git
cd prediction-king
```

### Install frontend dependencies

```bash
npm install
```

### Install backend dependencies

```bash
cd server
npm install
cd ..
```

### Create the PostgreSQL database

```bash
psql -U postgres -c "CREATE DATABASE chatkings;"
```

### Run the schema and seed scripts

```bash
psql -U postgres -d chatkings -f db/schema.sql
psql -U postgres -d chatkings -f db/seed.sql
```

This creates all 13 tables and populates them with sample users, chats, messages, teams, games, bets, and more.

### Configure environment variables

```bash
cp server/.env.example server/.env
```

Open `server/.env` and fill in your PostgreSQL credentials:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chatkings
DB_USER=postgres
DB_PASSWORD=your_password_here

PORT=3001
FRONTEND_URL=http://localhost:5173
```

---

## 6. Running the Application

Open two terminal windows from the project root.

**Terminal 1 — Start the backend:**

```bash
cd server
npm start
```

You should see: `ChatKings API running on http://localhost:3001`

**Terminal 2 — Start the frontend:**

```bash
npm run dev
```

You should see: `Local: http://localhost:5173`

Open **http://localhost:5173** in your browser.

---

## 7. Verifying the Vertical Slice

The working feature is **Send Message in a Chat**. It follows a full end-to-end path: the React frontend calls the Express backend, which inserts a row into the `messages` table in PostgreSQL and returns the new message to the UI.

### Steps to trigger the feature

1. Open http://localhost:5173 in your browser.
2. Tap **Chats** in the bottom navigation.
3. Tap any chat (e.g., **NFL Sunday**).
4. The message history loads from the database (seeded messages appear immediately).
5. Type any text in the input field at the bottom and press **Enter** or tap the send button.
6. The new message appears at the bottom of the chat thread instantly.

### Confirm the database was updated

In a terminal, query the messages table:

```bash
psql -U postgres -d chatkings -c "SELECT message_id, user_id, message_text, sent_at FROM messages ORDER BY sent_at DESC LIMIT 5;"
```

Your new message should appear as the most recent row.

### Confirm the change persists after a page refresh

1. After sending a message, **refresh the browser** (Cmd+R / Ctrl+R).
2. Navigate back to the same chat.
3. Your message is still visible — it was retrieved from the database, not held in memory.

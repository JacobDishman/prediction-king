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
- PostgreSQL 14+

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
                                           │  port 5173 or 8080*    │
                                           └───────────┬────────────┘
                                                       │  HTTP / JSON
                                                       │
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

*Vite defaults to 5173 but will use the next available port (e.g. 8080) if 5173 is taken. Check your terminal output for the actual URL.

---

## 4. Prerequisites

| Software | Minimum Version | Verify with | Install |
|---|---|---|---|
| Node.js | 18 | `node -v` | https://nodejs.org |
| npm | 9 | `npm -v` | (bundled with Node) |
| PostgreSQL | 14 | `psql --version` | https://www.postgresql.org/download/ |
| psql (CLI) | 14 | `psql --version` | (bundled with PostgreSQL) |

**Mac:** Make sure `psql` is in your PATH. If installed via Homebrew, run `brew services start postgresql@15` to ensure the service is running.

**Windows:** PostgreSQL installs `psql` at `C:\Program Files\PostgreSQL\<version>\bin\`. Either add that folder to your system PATH or prefix every `psql` command with the full path (e.g. `& "C:\Program Files\PostgreSQL\16\bin\psql.exe"`). Confirm the PostgreSQL service is running in Task Manager → Services.

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

**Mac / Linux:**
```bash
psql -U postgres -c "CREATE DATABASE chatkings;"
psql -U postgres -d chatkings -f db/schema.sql
psql -U postgres -d chatkings -f db/seed.sql
```

**Windows (PowerShell):**
```powershell
psql -U postgres -h localhost -c "CREATE DATABASE chatkings;"
psql -U postgres -h localhost -d chatkings -f db/schema.sql
psql -U postgres -h localhost -d chatkings -f db/seed.sql
```

Each command will prompt for your PostgreSQL password. After `seed.sql` you should see a series of `INSERT` confirmations — this means all 13 tables have sample data loaded.

### Configure environment variables

```bash
# Mac / Linux
cp server/.env.example server/.env

# Windows
copy server\.env.example server\.env
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

> **Important:** After starting the frontend (Step 6), check the terminal for the actual Vite URL. If Vite reports `http://localhost:8080` instead of `5173`, update `FRONTEND_URL=http://localhost:8080` in `server/.env` and restart the backend. This ensures CORS is configured correctly.

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

Check the terminal output for the local URL — it will say something like:

```
Local: http://localhost:5173
```

or

```
Local: http://localhost:8080
```

Open whichever URL is shown in your browser.

---

## 7. Verifying the Vertical Slice

The working feature is **Send Message in a Chat**. It follows a complete end-to-end path: the React frontend calls the Express backend, which inserts a row into the `messages` table in PostgreSQL and returns the new message to the UI.

### Steps to trigger the feature

1. Open the local URL shown in your terminal (e.g. `http://localhost:5173` or `http://localhost:8080`).
2. Tap **Chats** in the bottom navigation.
3. Tap any chat (e.g. **NFL Sunday**).
4. Seeded messages load automatically from the database.
5. Type any text in the input field at the bottom and press **Enter** or tap the send button.
6. The new message appears immediately at the bottom of the chat thread.

### Confirm the database was updated

In a terminal, query the messages table:

**Mac / Linux:**
```bash
psql -U postgres -d chatkings -c "SELECT message_id, user_id, message_text, sent_at FROM messages ORDER BY sent_at DESC LIMIT 5;"
```

**Windows:**
```powershell
psql -U postgres -h localhost -d chatkings -c "SELECT message_id, user_id, message_text, sent_at FROM messages ORDER BY sent_at DESC LIMIT 5;"
```

Your new message should appear as the most recent row.

### Confirm the change persists after a page refresh

1. After sending a message, hard-refresh the browser (Cmd+R on Mac, Ctrl+R on Windows).
2. Navigate back to the same chat.
3. Your message is still visible — it was retrieved from the database, not held in memory.

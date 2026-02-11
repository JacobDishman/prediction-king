
# ChatKings — Implementation Plan

## Overview
A mobile-first social prediction app where friends compete in group chats by answering prediction questions for points. No real money — just bragging rights and the crown. We'll build the full UI with mock data first, no authentication or backend.

---

## Phase 1: Foundation & Branding

### App Shell & Navigation
- Bottom navigation bar with icons: Home, Chats, Friends, Menu
- Mobile-first layout (max-width container centered on desktop)
- Design a simple ChatKings logo/icon (interlocking letters or crown motif) used in the header

### Color System & Theme
- **Green** (#22C55E range) — correct predictions, 0 strikes, positive feedback
- **Yellow/Amber** — 1 strike warning
- **Orange** (#F97316 range) — 2 strikes, King actions, active predictions
- **Red** (#EF4444 range) — 3 strikes lockout
- Dark header/nav with white content areas
- Sports-inspired typography (bold headings, clean body text)

---

## Phase 2: Home Screen

- **Live Games section** — horizontal scrollable cards showing placeholder matchups (Utah vs BYU, Bears vs Packers, etc.) with placeholder team logos
- **My Group Chats section** — card grid showing chat names, member avatars, and activity indicators
- **Followed Events section** — grid of upcoming game cards with team logos and dates
- **Strike indicator badge** in the header showing current day's strike count (0/3) with color coding

---

## Phase 3: Group Chat Screen

- Chat message bubbles (gray for others, green for user, orange for prediction/system messages)
- Current King displayed prominently at top with crown icon
- User's point total and strike count visible
- **Active prediction card** pinned in chat showing:
  - Question text
  - Answer option buttons
  - Point input field
  - Total pot size
  - Strike warning messages (at 2 strikes) or lockout state (at 3 strikes)
- "Make Prediction" button (visible only when user is King)
- Leaderboard access button

---

## Phase 4: Prediction Creation (King Only)

- Clean form with:
  - Free-form question text input
  - Dynamic "Add Answer Option" fields (minimum 2 options)
  - Minimum wager setting
  - Resolution date/time picker
- King must place their own points before publishing
- Preview card showing how the prediction will look in chat
- Post to chat button

---

## Phase 5: Leaderboard

- Ranked list of chat members sorted by points
- Crown icon and special styling for the current King
- Each row shows: rank, username, total points, minority bonus wins, daily strike count
- Weekly reset indicator at top

---

## Phase 6: Menu & Supporting Screens

### Menu Screen
- Navigation links to: Chats, My Activity, King Status, Friends, History & Stats, Rules & Fair Play
- Each item with icon and short description

### Friends Screen
- User's unique 8-digit Add Code displayed prominently
- Friend list with status
- Pending friend requests with Accept/Reject buttons
- Input field + "Send Request" button to add by code

### My Activity Screen
- Prediction history list (won/lost, points gained/lost)
- Personal stats summary
- Strike history log

### Rules & Fair Play Screen
- Clear explanation of points-only system
- King rules
- Three-strikes system explanation
- Minority bonus explanation

---

## Phase 7: Strike System UI Logic

- Global strike counter in mock data (shared across all chats)
- Visual state changes at each strike level (0→green, 1→yellow, 2→orange, 3→red)
- Lockout overlay on prediction inputs when at 3 strikes
- Countdown timer to midnight reset when locked out
- Strike indicators on Home screen, in chat, and on leaderboard

---

## Mock Data
All screens will use realistic placeholder data:
- 3-4 sample group chats with member names
- 6-8 placeholder game matchups with team names and placeholder logos
- Sample predictions (active and resolved)
- Sample leaderboard rankings
- Pre-set strike states to demonstrate all visual states

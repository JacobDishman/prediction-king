// ChatKings Mock Data

export interface User {
  id: string;
  name: string;
  avatar: string;
  addCode: string;
  strikes: number; // 0-3, global daily
}

export interface ChatMember {
  userId: string;
  points: number;
  isKing: boolean;
  minorityWins: number;
}

export interface Chat {
  id: string;
  name: string;
  members: ChatMember[];
  lastActivity: string;
  activePrediction?: Prediction;
}

export interface PredictionOption {
  id: string;
  text: string;
  wagers: { userId: string; amount: number }[];
}

export interface Prediction {
  id: string;
  question: string;
  options: PredictionOption[];
  createdBy: string;
  minWager: number;
  resolvesAt: string;
  resolved: boolean;
  correctOptionId?: string;
}

export interface Game {
  id: string;
  teamA: { name: string; abbrev: string; color: string };
  teamB: { name: string; abbrev: string; color: string };
  time: string;
  live: boolean;
  scoreA?: number;
  scoreB?: number;
}

export interface Message {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
  type: "user" | "system" | "prediction";
}

// Current user
export const currentUser: User = {
  id: "u1",
  name: "You",
  avatar: "Y",
  addCode: "48291035",
  strikes: 1,
};

export const users: User[] = [
  currentUser,
  { id: "u2", name: "Alex", avatar: "A", addCode: "73920184", strikes: 0 },
  { id: "u3", name: "Jordan", avatar: "J", addCode: "19384756", strikes: 2 },
  { id: "u4", name: "Sam", avatar: "S", addCode: "56473829", strikes: 3 },
  { id: "u5", name: "Casey", avatar: "C", addCode: "82910374", strikes: 0 },
  { id: "u6", name: "Riley", avatar: "R", addCode: "64738291", strikes: 1 },
];

export const chats: Chat[] = [
  {
    id: "c1",
    name: "NFL 2025 Family",
    members: [
      { userId: "u2", points: 300, isKing: true, minorityWins: 3 },
      { userId: "u1", points: 250, isKing: false, minorityWins: 1 },
      { userId: "u3", points: 180, isKing: false, minorityWins: 2 },
      { userId: "u5", points: 120, isKing: false, minorityWins: 0 },
    ],
    lastActivity: "2 min ago",
    activePrediction: {
      id: "p1",
      question: "Who wins Bears vs Packers?",
      options: [
        { id: "o1", text: "Bears", wagers: [{ userId: "u2", amount: 50 }] },
        { id: "o2", text: "Packers", wagers: [] },
      ],
      createdBy: "u2",
      minWager: 10,
      resolvesAt: "2025-02-12T20:00:00",
      resolved: false,
    },
  },
  {
    id: "c2",
    name: "College Ballers",
    members: [
      { userId: "u1", points: 410, isKing: true, minorityWins: 4 },
      { userId: "u3", points: 350, isKing: false, minorityWins: 2 },
      { userId: "u4", points: 290, isKing: false, minorityWins: 1 },
      { userId: "u6", points: 200, isKing: false, minorityWins: 0 },
    ],
    lastActivity: "15 min ago",
  },
  {
    id: "c3",
    name: "Work League",
    members: [
      { userId: "u5", points: 520, isKing: true, minorityWins: 5 },
      { userId: "u1", points: 310, isKing: false, minorityWins: 2 },
      { userId: "u6", points: 280, isKing: false, minorityWins: 1 },
      { userId: "u4", points: 150, isKing: false, minorityWins: 0 },
    ],
    lastActivity: "1 hr ago",
  },
];

export const games: Game[] = [
  { id: "g1", teamA: { name: "Bears", abbrev: "CHI", color: "hsl(24 95% 40%)" }, teamB: { name: "Packers", abbrev: "GB", color: "hsl(142 71% 30%)" }, time: "LIVE", live: true, scoreA: 14, scoreB: 21 },
  { id: "g2", teamA: { name: "Utah", abbrev: "UTAH", color: "hsl(0 84% 45%)" }, teamB: { name: "BYU", abbrev: "BYU", color: "hsl(220 60% 35%)" }, time: "LIVE", live: true, scoreA: 7, scoreB: 10 },
  { id: "g3", teamA: { name: "Lakers", abbrev: "LAL", color: "hsl(270 60% 40%)" }, teamB: { name: "Celtics", abbrev: "BOS", color: "hsl(142 60% 30%)" }, time: "7:30 PM", live: false },
  { id: "g4", teamA: { name: "Chiefs", abbrev: "KC", color: "hsl(0 84% 45%)" }, teamB: { name: "Bills", abbrev: "BUF", color: "hsl(220 60% 40%)" }, time: "8:15 PM", live: false },
  { id: "g5", teamA: { name: "Cowboys", abbrev: "DAL", color: "hsl(220 30% 35%)" }, teamB: { name: "Eagles", abbrev: "PHI", color: "hsl(160 50% 30%)" }, time: "Tomorrow", live: false },
  { id: "g6", teamA: { name: "Warriors", abbrev: "GSW", color: "hsl(43 96% 50%)" }, teamB: { name: "Suns", abbrev: "PHX", color: "hsl(24 95% 45%)" }, time: "Tomorrow", live: false },
];

export const chatMessages: Record<string, Message[]> = {
  c1: [
    { id: "m1", userId: "u2", text: "Alex created a prediction!", timestamp: "2:30 PM", type: "system" },
    { id: "m2", userId: "u2", text: "Bears are taking it tonight 🐻", timestamp: "2:31 PM", type: "user" },
    { id: "m3", userId: "u3", text: "No way, Packers all the way", timestamp: "2:32 PM", type: "user" },
    { id: "m4", userId: "u1", text: "Let's go! I'm in", timestamp: "2:33 PM", type: "user" },
    { id: "m5", userId: "u5", text: "This is gonna be close...", timestamp: "2:34 PM", type: "user" },
  ],
};

export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function getStrikeColor(strikes: number): string {
  switch (strikes) {
    case 0: return "ck-green";
    case 1: return "ck-yellow";
    case 2: return "ck-orange";
    case 3: return "ck-red";
    default: return "ck-green";
  }
}

export function getStrikeLabel(strikes: number): string {
  switch (strikes) {
    case 0: return "All clear";
    case 1: return "1 strike";
    case 2: return "Careful!";
    case 3: return "Locked out";
    default: return "";
  }
}

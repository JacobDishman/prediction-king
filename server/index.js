const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const pool = require('./db');

const app  = express();
const PORT = process.env.PORT || 3001;

// ---------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// ---------------------------------------------------------------
// Health check
// ---------------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------
// GET /api/chats/:chatId/messages
// Returns all messages for a chat, oldest first.
// Each row is joined with the sender's username so the frontend
// doesn't need a second request.
// ---------------------------------------------------------------
app.get('/api/chats/:chatId/messages', async (req, res) => {
  const chatId = parseInt(req.params.chatId, 10);
  if (isNaN(chatId)) return res.status(400).json({ error: 'Invalid chat ID' });

  try {
    const result = await pool.query(
      `SELECT
         m.message_id   AS id,
         m.chat_id,
         m.user_id,
         u.username     AS user_name,
         m.message_type AS type,
         m.message_text AS text,
         m.sent_at      AS timestamp
       FROM messages m
       LEFT JOIN users u ON u.user_id = m.user_id
       WHERE m.chat_id = $1
       ORDER BY m.sent_at ASC`,
      [chatId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /messages error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ---------------------------------------------------------------
// POST /api/chats/:chatId/messages
// Body: { userId: number, messageText: string, messageType?: string }
// Inserts the new message and returns the full row (joined with
// username) so the frontend can append it immediately.
// ---------------------------------------------------------------
app.post('/api/chats/:chatId/messages', async (req, res) => {
  const chatId = parseInt(req.params.chatId, 10);
  if (isNaN(chatId)) return res.status(400).json({ error: 'Invalid chat ID' });

  const { userId, messageText, messageType = 'user' } = req.body;

  if (!messageText || typeof messageText !== 'string' || messageText.trim() === '') {
    return res.status(400).json({ error: 'messageText is required' });
  }
  if (!userId || isNaN(parseInt(userId, 10))) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO messages (chat_id, user_id, message_type, message_text)
       VALUES ($1, $2, $3, $4)
       RETURNING message_id AS id, chat_id, user_id, message_type AS type,
                 message_text AS text, sent_at AS timestamp`,
      [chatId, parseInt(userId, 10), messageType, messageText.trim()]
    );

    // Fetch the sender's username to return a complete object
    const msg = result.rows[0];
    const userResult = await pool.query(
      'SELECT username FROM users WHERE user_id = $1',
      [msg.user_id]
    );
    msg.user_name = userResult.rows[0]?.username || 'Unknown';

    res.status(201).json(msg);
  } catch (err) {
    console.error('POST /messages error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ---------------------------------------------------------------
// Start
// ---------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`ChatKings API running on http://localhost:${PORT}`);
});

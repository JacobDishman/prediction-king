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

// ===============================================================
// MESSAGES
// ===============================================================

// GET /api/chats/:chatId/messages
// Returns all messages for a chat, oldest first.
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

// POST /api/chats/:chatId/messages
// Body: { userId, messageText, messageType? }
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

// ===============================================================
// BETS / WAGERS
// ===============================================================

// GET /api/chats/:chatId/bets/active
// Returns the open bet for a chat with live wager totals per option.
app.get('/api/chats/:chatId/bets/active', async (req, res) => {
  const chatId = parseInt(req.params.chatId, 10);
  if (isNaN(chatId)) return res.status(400).json({ error: 'Invalid chat ID' });

  try {
    const result = await pool.query(
      `SELECT bet_id, question, prediction_options_json, min_wager, points_in_pot
       FROM bets
       WHERE chat_id = $1 AND status = 'open'
       LIMIT 1`,
      [chatId]
    );

    if (result.rows.length === 0) return res.json(null);

    const bet = result.rows[0];

    // Build a clean option-totals map for the frontend
    const optionTotals = {};
    for (const opt of bet.prediction_options_json) {
      optionTotals[opt.id] = (opt.wagers || []).reduce((s, w) => s + w.amount, 0);
    }

    res.json({
      betId:        bet.bet_id,
      potTotal:     bet.points_in_pot,
      minWager:     bet.min_wager,
      optionTotals,
    });
  } catch (err) {
    console.error('GET /bets/active error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/chats/:chatId/bets/active/wagers
// Body: { userId, optionId, amount }
// Appends the wager to the correct option inside the JSONB column,
// increments points_in_pot, and returns the updated totals.
app.post('/api/chats/:chatId/bets/active/wagers', async (req, res) => {
  const chatId = parseInt(req.params.chatId, 10);
  if (isNaN(chatId)) return res.status(400).json({ error: 'Invalid chat ID' });

  const { userId, optionId, amount } = req.body;
  const parsedAmount = parseInt(amount, 10);

  if (!optionId || isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'optionId and a positive amount are required' });
  }

  try {
    // Find the active bet
    const betResult = await pool.query(
      `SELECT bet_id, prediction_options_json, min_wager, points_in_pot
       FROM bets WHERE chat_id = $1 AND status = 'open' LIMIT 1`,
      [chatId]
    );
    if (betResult.rows.length === 0) {
      return res.status(404).json({ error: 'No active bet in this chat' });
    }

    const bet = betResult.rows[0];

    if (parsedAmount < bet.min_wager) {
      return res.status(400).json({ error: `Minimum wager is ${bet.min_wager} points` });
    }

    const optionExists = bet.prediction_options_json.some(o => o.id === optionId);
    if (!optionExists) {
      return res.status(404).json({ error: 'Option not found in this bet' });
    }

    // Build the new wager entry as a JSONB literal
    const newWagerJson = JSON.stringify([{ userId: parseInt(userId, 10), amount: parsedAmount }]);

    // Update: append the new wager to the matching option's wagers array
    const updateResult = await pool.query(
      `UPDATE bets
       SET
         prediction_options_json = (
           SELECT jsonb_agg(
             CASE
               WHEN opt->>'id' = $1
               THEN jsonb_set(opt, '{wagers}', (opt->'wagers') || $2::jsonb)
               ELSE opt
             END
           )
           FROM jsonb_array_elements(prediction_options_json) AS opt
         ),
         points_in_pot = points_in_pot + $3
       WHERE bet_id = $4
       RETURNING prediction_options_json, points_in_pot`,
      [optionId, newWagerJson, parsedAmount, bet.bet_id]
    );

    const updated = updateResult.rows[0];

    // Return the new totals for each option so the UI can update immediately
    const optionTotals = {};
    for (const opt of updated.prediction_options_json) {
      optionTotals[opt.id] = (opt.wagers || []).reduce((s, w) => s + w.amount, 0);
    }

    res.status(201).json({
      success:      true,
      potTotal:     updated.points_in_pot,
      optionTotals,
    });
  } catch (err) {
    console.error('POST /wagers error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ===============================================================
// FRIEND REQUESTS
// ===============================================================

// GET /api/friend-requests/incoming/:userId
// Returns all pending friend requests addressed to this user.
app.get('/api/friend-requests/incoming/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user ID' });

  try {
    const result = await pool.query(
      `SELECT fr.request_id, fr.sender_id, u.username AS sender_name
       FROM friend_requests fr
       JOIN users u ON u.user_id = fr.sender_id
       WHERE fr.receiver_id = $1 AND fr.status = 'pending'
       ORDER BY fr.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /friend-requests error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/friend-requests
// Body: { senderUserId, addCode }
// Looks up the target user by their add_code and inserts a pending request.
app.post('/api/friend-requests', async (req, res) => {
  const { senderUserId, addCode } = req.body;
  const senderId = parseInt(senderUserId, 10);

  if (!addCode || isNaN(senderId)) {
    return res.status(400).json({ error: 'senderUserId and addCode are required' });
  }

  try {
    // Find receiver by add_code
    const receiverResult = await pool.query(
      'SELECT user_id, username FROM users WHERE add_code = $1',
      [addCode.trim()]
    );
    if (receiverResult.rows.length === 0) {
      return res.status(404).json({ error: 'No user found with that code' });
    }

    const receiver = receiverResult.rows[0];

    if (receiver.user_id === senderId) {
      return res.status(400).json({ error: 'You cannot add yourself' });
    }

    // Check for an existing request in either direction
    const existing = await pool.query(
      `SELECT request_id FROM friend_requests
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)`,
      [senderId, receiver.user_id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'A friend request already exists between these users' });
    }

    // Check for existing friendship
    const [uid1, uid2] = [senderId, receiver.user_id].sort((a, b) => a - b);
    const friendship = await pool.query(
      'SELECT friendship_id FROM friendships WHERE user_id_1 = $1 AND user_id_2 = $2',
      [uid1, uid2]
    );
    if (friendship.rows.length > 0) {
      return res.status(409).json({ error: 'You are already friends with this user' });
    }

    // Insert the request
    const insertResult = await pool.query(
      `INSERT INTO friend_requests (sender_id, receiver_id)
       VALUES ($1, $2)
       RETURNING request_id`,
      [senderId, receiver.user_id]
    );

    res.status(201).json({
      success:      true,
      requestId:    insertResult.rows[0].request_id,
      receiverName: receiver.username,
    });
  } catch (err) {
    console.error('POST /friend-requests error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// PATCH /api/friend-requests/:requestId
// Body: { action: 'accept' | 'decline' }
// Accepts or declines a pending request. On accept, creates a friendship row.
app.patch('/api/friend-requests/:requestId', async (req, res) => {
  const requestId = parseInt(req.params.requestId, 10);
  if (isNaN(requestId)) return res.status(400).json({ error: 'Invalid request ID' });

  const { action } = req.body;
  if (action !== 'accept' && action !== 'decline') {
    return res.status(400).json({ error: 'action must be "accept" or "decline"' });
  }

  try {
    const reqResult = await pool.query(
      'SELECT * FROM friend_requests WHERE request_id = $1',
      [requestId]
    );
    if (reqResult.rows.length === 0) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    const fr = reqResult.rows[0];

    // Update status
    await pool.query(
      `UPDATE friend_requests
       SET status = $1, responded_at = NOW()
       WHERE request_id = $2`,
      [action === 'accept' ? 'accepted' : 'declined', requestId]
    );

    // On accept, create a friendship (enforcing uid1 < uid2 for the unique constraint)
    if (action === 'accept') {
      const [uid1, uid2] = [fr.sender_id, fr.receiver_id].sort((a, b) => a - b);
      await pool.query(
        `INSERT INTO friendships (user_id_1, user_id_2)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [uid1, uid2]
      );
    }

    res.json({ success: true, action });
  } catch (err) {
    console.error('PATCH /friend-requests error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ---------------------------------------------------------------
// Start
// ---------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`ChatKings API running on http://localhost:${PORT}`);
});

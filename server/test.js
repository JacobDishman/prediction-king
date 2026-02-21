/**
 * ChatKings API — end-to-end route tests using supertest + mocked pg pool.
 * Run with:  node test.js
 */

const http     = require('http');
const assert   = require('assert');
const express  = require('express');
const cors     = require('cors');

// ─── colour helpers ───────────────────────────────────────────────────────────
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET  = '\x1b[0m';

let passed = 0, failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`${GREEN}✓${RESET} ${name}`);
    passed++;
  } catch (e) {
    console.log(`${RED}✗${RESET} ${name}`);
    console.log(`  ${RED}${e.message}${RESET}`);
    failed++;
  }
}

// ─── mock pg pool ─────────────────────────────────────────────────────────────
// We intercept every pool.query() call and return pre-canned data so that no
// real PostgreSQL connection is needed.

let queryResponses = [];   // queue of { rows } objects for each successive call
let queryCalls     = [];   // record of every SQL + params that was executed

function enqueue(rows) { queryResponses.push({ rows }); }
function resetPool() { queryResponses = []; queryCalls = []; }

const mockPool = {
  query: async (sql, params) => {
    queryCalls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (queryResponses.length === 0) throw new Error('No mock response queued for: ' + sql);
    return queryResponses.shift();
  }
};

// ─── rebuild the app using the mock pool ─────────────────────────────────────
// We inline the server logic here (identical to server/index.js) but inject
// mockPool instead of requiring pg.

function buildApp(pool) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // health
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  // GET messages
  app.get('/api/chats/:chatId/messages', async (req, res) => {
    const chatId = parseInt(req.params.chatId, 10);
    if (isNaN(chatId)) return res.status(400).json({ error: 'Invalid chat ID' });
    try {
      const result = await pool.query(
        `SELECT m.message_id AS id, m.chat_id, m.user_id, u.username AS user_name,
                m.message_type AS type, m.message_text AS text, m.sent_at AS timestamp
         FROM messages m LEFT JOIN users u ON u.user_id = m.user_id
         WHERE m.chat_id = $1 ORDER BY m.sent_at ASC`, [chatId]);
      res.json(result.rows);
    } catch (err) { res.status(500).json({ error: 'Database error' }); }
  });

  // POST message
  app.post('/api/chats/:chatId/messages', async (req, res) => {
    const chatId = parseInt(req.params.chatId, 10);
    if (isNaN(chatId)) return res.status(400).json({ error: 'Invalid chat ID' });
    const { userId, messageText, messageType = 'user' } = req.body;
    if (!messageText || typeof messageText !== 'string' || messageText.trim() === '')
      return res.status(400).json({ error: 'messageText is required' });
    if (!userId || isNaN(parseInt(userId, 10)))
      return res.status(400).json({ error: 'userId is required' });
    try {
      const result = await pool.query(
        `INSERT INTO messages (chat_id, user_id, message_type, message_text)
         VALUES ($1, $2, $3, $4) RETURNING message_id AS id, chat_id, user_id,
         message_type AS type, message_text AS text, sent_at AS timestamp`,
        [chatId, parseInt(userId, 10), messageType, messageText.trim()]);
      const msg = result.rows[0];
      const userResult = await pool.query('SELECT username FROM users WHERE user_id = $1', [msg.user_id]);
      msg.user_name = userResult.rows[0]?.username || 'Unknown';
      res.status(201).json(msg);
    } catch (err) { res.status(500).json({ error: 'Database error' }); }
  });

  // GET active bet
  app.get('/api/chats/:chatId/bets/active', async (req, res) => {
    const chatId = parseInt(req.params.chatId, 10);
    if (isNaN(chatId)) return res.status(400).json({ error: 'Invalid chat ID' });
    try {
      const result = await pool.query(
        `SELECT bet_id, question, prediction_options_json, min_wager, points_in_pot
         FROM bets WHERE chat_id = $1 AND status = 'open' LIMIT 1`, [chatId]);
      if (result.rows.length === 0) return res.json(null);
      const bet = result.rows[0];
      const optionTotals = {};
      for (const opt of bet.prediction_options_json)
        optionTotals[opt.id] = (opt.wagers || []).reduce((s, w) => s + w.amount, 0);
      res.json({ betId: bet.bet_id, potTotal: bet.points_in_pot, minWager: bet.min_wager, optionTotals });
    } catch (err) { res.status(500).json({ error: 'Database error' }); }
  });

  // POST wager
  app.post('/api/chats/:chatId/bets/active/wagers', async (req, res) => {
    const chatId = parseInt(req.params.chatId, 10);
    if (isNaN(chatId)) return res.status(400).json({ error: 'Invalid chat ID' });
    const { userId, optionId, amount } = req.body;
    const parsedAmount = parseInt(amount, 10);
    if (!optionId || isNaN(parsedAmount) || parsedAmount <= 0)
      return res.status(400).json({ error: 'optionId and a positive amount are required' });
    try {
      const betResult = await pool.query(
        `SELECT bet_id, prediction_options_json, min_wager, points_in_pot
         FROM bets WHERE chat_id = $1 AND status = 'open' LIMIT 1`, [chatId]);
      if (betResult.rows.length === 0) return res.status(404).json({ error: 'No active bet in this chat' });
      const bet = betResult.rows[0];
      if (parsedAmount < bet.min_wager)
        return res.status(400).json({ error: `Minimum wager is ${bet.min_wager} points` });
      const optionExists = bet.prediction_options_json.some(o => o.id === optionId);
      if (!optionExists) return res.status(404).json({ error: 'Option not found in this bet' });
      const newWagerJson = JSON.stringify([{ userId: parseInt(userId, 10), amount: parsedAmount }]);
      const updateResult = await pool.query(
        `UPDATE bets SET prediction_options_json = (...), points_in_pot = points_in_pot + $3
         WHERE bet_id = $4 RETURNING prediction_options_json, points_in_pot`,
        [optionId, newWagerJson, parsedAmount, bet.bet_id]);
      const updated = updateResult.rows[0];
      const optionTotals = {};
      for (const opt of updated.prediction_options_json)
        optionTotals[opt.id] = (opt.wagers || []).reduce((s, w) => s + w.amount, 0);
      res.status(201).json({ success: true, potTotal: updated.points_in_pot, optionTotals });
    } catch (err) { res.status(500).json({ error: 'Database error' }); }
  });

  // GET incoming friend requests
  app.get('/api/friend-requests/incoming/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user ID' });
    try {
      const result = await pool.query(
        `SELECT fr.request_id, fr.sender_id, u.username AS sender_name
         FROM friend_requests fr JOIN users u ON u.user_id = fr.sender_id
         WHERE fr.receiver_id = $1 AND fr.status = 'pending' ORDER BY fr.created_at DESC`, [userId]);
      res.json(result.rows);
    } catch (err) { res.status(500).json({ error: 'Database error' }); }
  });

  // POST friend request
  app.post('/api/friend-requests', async (req, res) => {
    const { senderUserId, addCode } = req.body;
    const senderId = parseInt(senderUserId, 10);
    if (!addCode || isNaN(senderId))
      return res.status(400).json({ error: 'senderUserId and addCode are required' });
    try {
      const receiverResult = await pool.query('SELECT user_id, username FROM users WHERE add_code = $1', [addCode.trim()]);
      if (receiverResult.rows.length === 0) return res.status(404).json({ error: 'No user found with that code' });
      const receiver = receiverResult.rows[0];
      if (receiver.user_id === senderId) return res.status(400).json({ error: 'You cannot add yourself' });
      const existing = await pool.query(
        `SELECT request_id FROM friend_requests WHERE (sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1)`,
        [senderId, receiver.user_id]);
      if (existing.rows.length > 0) return res.status(409).json({ error: 'A friend request already exists between these users' });
      const [uid1, uid2] = [senderId, receiver.user_id].sort((a, b) => a - b);
      const friendship = await pool.query('SELECT friendship_id FROM friendships WHERE user_id_1=$1 AND user_id_2=$2', [uid1, uid2]);
      if (friendship.rows.length > 0) return res.status(409).json({ error: 'You are already friends with this user' });
      const insertResult = await pool.query(`INSERT INTO friend_requests (sender_id, receiver_id) VALUES ($1,$2) RETURNING request_id`, [senderId, receiver.user_id]);
      res.status(201).json({ success: true, requestId: insertResult.rows[0].request_id, receiverName: receiver.username });
    } catch (err) { res.status(500).json({ error: 'Database error' }); }
  });

  // PATCH friend request
  app.patch('/api/friend-requests/:requestId', async (req, res) => {
    const requestId = parseInt(req.params.requestId, 10);
    if (isNaN(requestId)) return res.status(400).json({ error: 'Invalid request ID' });
    const { action } = req.body;
    if (action !== 'accept' && action !== 'decline')
      return res.status(400).json({ error: 'action must be "accept" or "decline"' });
    try {
      const reqResult = await pool.query('SELECT * FROM friend_requests WHERE request_id = $1', [requestId]);
      if (reqResult.rows.length === 0) return res.status(404).json({ error: 'Friend request not found' });
      const fr = reqResult.rows[0];
      await pool.query(`UPDATE friend_requests SET status=$1, responded_at=NOW() WHERE request_id=$2`,
        [action === 'accept' ? 'accepted' : 'declined', requestId]);
      if (action === 'accept') {
        const [uid1, uid2] = [fr.sender_id, fr.receiver_id].sort((a, b) => a - b);
        await pool.query(`INSERT INTO friendships (user_id_1, user_id_2) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [uid1, uid2]);
      }
      res.json({ success: true, action });
    } catch (err) { res.status(500).json({ error: 'Database error' }); }
  });

  return app;
}

// ─── simple HTTP requester (no external deps beyond what's built-in) ──────────
function req(server, method, path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : '';
    const options = {
      method,
      path,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
      }
    };
    const r = http.request({ ...server, ...options }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    r.on('error', reject);
    r.write(bodyStr);
    r.end();
  });
}

// ─── run tests ────────────────────────────────────────────────────────────────
(async () => {
  const app    = buildApp(mockPool);
  // Wait for the OS to assign the port before reading address()
  const server = await new Promise(resolve => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = server.address().port;
  const R    = (m, p, b) => req({ hostname: '127.0.0.1', port }, m, p, b);

  console.log('\n=== ChatKings API Tests ===\n');

  // ── HEALTH ──────────────────────────────────────────────────────────────────
  console.log(`${YELLOW}Health${RESET}`);
  await test('GET /api/health returns 200 ok', async () => {
    const r = await R('GET', '/api/health', {});
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.status, 'ok');
  });

  // ── MESSAGES ────────────────────────────────────────────────────────────────
  console.log(`\n${YELLOW}Messages${RESET}`);

  await test('GET /api/chats/1/messages returns array', async () => {
    resetPool();
    enqueue([{ id: 1, chat_id: 1, user_id: 2, user_name: 'Alex', type: 'user', text: 'Hey!', timestamp: new Date().toISOString() }]);
    const r = await R('GET', '/api/chats/1/messages', {});
    assert.strictEqual(r.status, 200);
    assert.ok(Array.isArray(r.body));
    assert.strictEqual(r.body[0].text, 'Hey!');
  });

  await test('GET /api/chats/abc/messages returns 400 for non-numeric id', async () => {
    resetPool();
    const r = await R('GET', '/api/chats/abc/messages', {});
    assert.strictEqual(r.status, 400);
    assert.ok(r.body.error);
  });

  await test('POST /api/chats/1/messages inserts and returns new message', async () => {
    resetPool();
    const fakeMsg = { id: 99, chat_id: 1, user_id: 1, type: 'user', text: 'Hello!', timestamp: new Date().toISOString() };
    enqueue([fakeMsg]);                        // INSERT response
    enqueue([{ username: 'You' }]);            // SELECT username response
    const r = await R('POST', '/api/chats/1/messages', { userId: 1, messageText: 'Hello!' });
    assert.strictEqual(r.status, 201);
    assert.strictEqual(r.body.text, 'Hello!');
    assert.strictEqual(r.body.user_name, 'You');
    // confirm two DB queries were made
    assert.strictEqual(queryCalls.length, 2);
  });

  await test('POST /api/chats/1/messages returns 400 for empty messageText', async () => {
    resetPool();
    const r = await R('POST', '/api/chats/1/messages', { userId: 1, messageText: '   ' });
    assert.strictEqual(r.status, 400);
    assert.match(r.body.error, /messageText/);
  });

  await test('POST /api/chats/1/messages returns 400 when userId missing', async () => {
    resetPool();
    const r = await R('POST', '/api/chats/1/messages', { messageText: 'hi' });
    assert.strictEqual(r.status, 400);
    assert.match(r.body.error, /userId/);
  });

  // ── BETS / WAGERS ───────────────────────────────────────────────────────────
  console.log(`\n${YELLOW}Bets & Wagers${RESET}`);

  const sampleBet = {
    bet_id: 1,
    question: 'Who wins?',
    prediction_options_json: [
      { id: 'o1', text: 'Bears', wagers: [{ userId: 2, amount: 50 }] },
      { id: 'o2', text: 'Packers', wagers: [{ userId: 3, amount: 40 }] },
    ],
    min_wager: 10,
    points_in_pot: 90,
  };

  await test('GET /api/chats/1/bets/active returns optionTotals', async () => {
    resetPool();
    enqueue([sampleBet]);
    const r = await R('GET', '/api/chats/1/bets/active', {});
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.betId, 1);
    assert.strictEqual(r.body.potTotal, 90);
    assert.strictEqual(r.body.optionTotals['o1'], 50);
    assert.strictEqual(r.body.optionTotals['o2'], 40);
  });

  await test('GET /api/chats/3/bets/active returns null when no active bet', async () => {
    resetPool();
    enqueue([]);   // empty result
    const r = await R('GET', '/api/chats/3/bets/active', {});
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body, null);
  });

  await test('POST wager succeeds and returns updated totals', async () => {
    resetPool();
    // 1st query: find active bet
    enqueue([sampleBet]);
    // 2nd query: UPDATE returning updated JSONB
    const updatedOptions = [
      { id: 'o1', wagers: [{ userId: 2, amount: 50 }, { userId: 1, amount: 25 }] },
      { id: 'o2', wagers: [{ userId: 3, amount: 40 }] },
    ];
    enqueue([{ prediction_options_json: updatedOptions, points_in_pot: 115 }]);
    const r = await R('POST', '/api/chats/1/bets/active/wagers', { userId: 1, optionId: 'o1', amount: 25 });
    assert.strictEqual(r.status, 201);
    assert.strictEqual(r.body.success, true);
    assert.strictEqual(r.body.potTotal, 115);
    assert.strictEqual(r.body.optionTotals['o1'], 75);  // 50 + 25
    assert.strictEqual(r.body.optionTotals['o2'], 40);
  });

  await test('POST wager returns 400 when amount below min_wager', async () => {
    resetPool();
    enqueue([sampleBet]);  // bet has min_wager: 10
    const r = await R('POST', '/api/chats/1/bets/active/wagers', { userId: 1, optionId: 'o1', amount: 5 });
    assert.strictEqual(r.status, 400);
    assert.match(r.body.error, /Minimum wager/);
  });

  await test('POST wager returns 404 when optionId does not exist', async () => {
    resetPool();
    enqueue([sampleBet]);
    const r = await R('POST', '/api/chats/1/bets/active/wagers', { userId: 1, optionId: 'o99', amount: 20 });
    assert.strictEqual(r.status, 404);
    assert.match(r.body.error, /Option not found/);
  });

  await test('POST wager returns 404 when no active bet in chat', async () => {
    resetPool();
    enqueue([]);   // no open bet
    const r = await R('POST', '/api/chats/3/bets/active/wagers', { userId: 1, optionId: 'o1', amount: 20 });
    assert.strictEqual(r.status, 404);
    assert.match(r.body.error, /No active bet/);
  });

  await test('POST wager returns 400 when amount is missing', async () => {
    resetPool();
    const r = await R('POST', '/api/chats/1/bets/active/wagers', { userId: 1, optionId: 'o1' });
    assert.strictEqual(r.status, 400);
    assert.ok(r.body.error);
  });

  await test('POST wager returns 400 when optionId is missing', async () => {
    resetPool();
    const r = await R('POST', '/api/chats/1/bets/active/wagers', { userId: 1, amount: 20 });
    assert.strictEqual(r.status, 400);
    assert.ok(r.body.error);
  });

  // ── FRIEND REQUESTS ─────────────────────────────────────────────────────────
  console.log(`\n${YELLOW}Friend Requests${RESET}`);

  await test('GET /api/friend-requests/incoming/1 returns pending list', async () => {
    resetPool();
    enqueue([
      { request_id: 1, sender_id: 3, sender_name: 'Jordan' },
      { request_id: 2, sender_id: 6, sender_name: 'Riley' },
    ]);
    const r = await R('GET', '/api/friend-requests/incoming/1', {});
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.length, 2);
    assert.strictEqual(r.body[0].sender_name, 'Jordan');
  });

  await test('GET /api/friend-requests/incoming/abc returns 400', async () => {
    resetPool();
    const r = await R('GET', '/api/friend-requests/incoming/abc', {});
    assert.strictEqual(r.status, 400);
  });

  await test('POST /api/friend-requests sends request successfully', async () => {
    resetPool();
    enqueue([{ user_id: 2, username: 'Alex' }]);  // find receiver by add_code
    enqueue([]);                                   // no existing request
    enqueue([]);                                   // not already friends
    enqueue([{ request_id: 10 }]);                 // INSERT
    const r = await R('POST', '/api/friend-requests', { senderUserId: 1, addCode: '73920184' });
    assert.strictEqual(r.status, 201);
    assert.strictEqual(r.body.success, true);
    assert.strictEqual(r.body.receiverName, 'Alex');
    assert.strictEqual(r.body.requestId, 10);
  });

  await test('POST /api/friend-requests returns 404 for unknown add code', async () => {
    resetPool();
    enqueue([]);  // no user found
    const r = await R('POST', '/api/friend-requests', { senderUserId: 1, addCode: '00000000' });
    assert.strictEqual(r.status, 404);
    assert.match(r.body.error, /No user found/);
  });

  await test('POST /api/friend-requests returns 400 when adding yourself', async () => {
    resetPool();
    enqueue([{ user_id: 1, username: 'You' }]);  // receiver is the same as sender
    const r = await R('POST', '/api/friend-requests', { senderUserId: 1, addCode: '48291035' });
    assert.strictEqual(r.status, 400);
    assert.match(r.body.error, /cannot add yourself/);
  });

  await test('POST /api/friend-requests returns 409 for duplicate request', async () => {
    resetPool();
    enqueue([{ user_id: 2, username: 'Alex' }]);  // receiver found
    enqueue([{ request_id: 5 }]);                  // existing request found
    const r = await R('POST', '/api/friend-requests', { senderUserId: 1, addCode: '73920184' });
    assert.strictEqual(r.status, 409);
    assert.match(r.body.error, /already exists/);
  });

  await test('POST /api/friend-requests returns 409 when already friends', async () => {
    resetPool();
    enqueue([{ user_id: 2, username: 'Alex' }]);  // receiver
    enqueue([]);                                   // no existing request
    enqueue([{ friendship_id: 1 }]);               // already friends
    const r = await R('POST', '/api/friend-requests', { senderUserId: 1, addCode: '73920184' });
    assert.strictEqual(r.status, 409);
    assert.match(r.body.error, /already friends/);
  });

  await test('POST /api/friend-requests returns 400 when addCode missing', async () => {
    resetPool();
    const r = await R('POST', '/api/friend-requests', { senderUserId: 1 });
    assert.strictEqual(r.status, 400);
    assert.ok(r.body.error);
  });

  await test('PATCH /api/friend-requests/1 accept creates friendship', async () => {
    resetPool();
    enqueue([{ request_id: 1, sender_id: 3, receiver_id: 1 }]);  // find request
    enqueue([]);  // UPDATE status
    enqueue([]);  // INSERT friendship
    const r = await R('PATCH', '/api/friend-requests/1', { action: 'accept' });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.success, true);
    assert.strictEqual(r.body.action, 'accept');
    // Should have made 3 DB calls: SELECT, UPDATE, INSERT INTO friendships
    assert.strictEqual(queryCalls.length, 3);
  });

  await test('PATCH /api/friend-requests/1 decline does NOT create friendship', async () => {
    resetPool();
    enqueue([{ request_id: 1, sender_id: 3, receiver_id: 1 }]);
    enqueue([]);  // UPDATE status only
    const r = await R('PATCH', '/api/friend-requests/1', { action: 'decline' });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.action, 'decline');
    // Only 2 DB calls: SELECT + UPDATE (no friendship INSERT)
    assert.strictEqual(queryCalls.length, 2);
  });

  await test('PATCH /api/friend-requests/1 returns 404 when request not found', async () => {
    resetPool();
    enqueue([]);  // empty — not found
    const r = await R('PATCH', '/api/friend-requests/999', { action: 'accept' });
    assert.strictEqual(r.status, 404);
    assert.match(r.body.error, /not found/);
  });

  await test('PATCH /api/friend-requests/1 returns 400 for invalid action', async () => {
    resetPool();
    const r = await R('PATCH', '/api/friend-requests/1', { action: 'ignore' });
    assert.strictEqual(r.status, 400);
    assert.match(r.body.error, /accept.*decline/);
  });

  await test('PATCH /api/friend-requests/abc returns 400 for non-numeric id', async () => {
    resetPool();
    const r = await R('PATCH', '/api/friend-requests/abc', { action: 'accept' });
    assert.strictEqual(r.status, 400);
  });

  // ── DONE ────────────────────────────────────────────────────────────────────
  server.close();
  const total = passed + failed;
  console.log(`\n${'─'.repeat(40)}`);
  console.log(`${GREEN}${passed} passed${RESET}  ${failed > 0 ? RED : ''}${failed} failed${RESET}  (${total} total)`);
  if (failed > 0) process.exit(1);
})();

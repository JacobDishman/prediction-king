-- =============================================================
-- ChatKings Seed Data
-- Run AFTER schema.sql:  psql -U <user> -d <dbname> -f db/seed.sql
-- =============================================================

-- =============================================================
-- USERS  (mirrors mock.ts)
-- =============================================================
INSERT INTO users (user_id, username, email, phone_number, add_code, all_time_points, strikes) VALUES
  (1, 'You',    'you@example.com',    '555-0001', '48291035', 980,  1),
  (2, 'Alex',   'alex@example.com',   '555-0002', '73920184', 1240, 0),
  (3, 'Jordan', 'jordan@example.com', '555-0003', '19384756', 870,  2),
  (4, 'Sam',    'sam@example.com',    '555-0004', '56473829', 750,  3),
  (5, 'Casey',  'casey@example.com',  '555-0005', '82910374', 1820, 0),
  (6, 'Riley',  'riley@example.com',  '555-0006', '64738291', 720,  1),
  (7, 'Morgan', 'morgan@example.com', '555-0007', '91827364', 540,  0),
  (8, 'Taylor', 'taylor@example.com', '555-0008', '37281946', 960,  1);

-- Reset sequence so new rows don't clash
SELECT setval('users_user_id_seq', 8, true);

-- =============================================================
-- TEAMS
-- =============================================================
INSERT INTO teams (team_id, team_name, team_abbreviation, league, conference, primary_color) VALUES
  (1,  'Bears',       'CHI',  'NFL',   'NFC North',  '#C83200'),
  (2,  'Packers',     'GB',   'NFL',   'NFC North',  '#203731'),
  (3,  'Chiefs',      'KC',   'NFL',   'AFC West',   '#E31837'),
  (4,  'Bills',       'BUF',  'NFL',   'AFC East',   '#00338D'),
  (5,  'Cowboys',     'DAL',  'NFL',   'NFC East',   '#003594'),
  (6,  'Eagles',      'PHI',  'NFL',   'NFC East',   '#004C54'),
  (7,  'Lakers',      'LAL',  'NBA',   'Pacific',    '#552583'),
  (8,  'Celtics',     'BOS',  'NBA',   'Atlantic',   '#007A33'),
  (9,  'Warriors',    'GSW',  'NBA',   'Pacific',    '#1D428A'),
  (10, 'Suns',        'PHX',  'NBA',   'Pacific',    '#E56020'),
  (11, 'Utah Utes',   'UTAH', 'NCAAF', 'Pac-12',     '#CC0000'),
  (12, 'BYU Cougars', 'BYU',  'NCAAF', 'Pac-12',     '#002E5D'),
  (13, 'Yankees',     'NYY',  'MLB',   'AL East',    '#003087'),
  (14, 'Red Sox',     'BOS',  'MLB',   'AL East',    '#BD3039'),
  (15, 'Maple Leafs', 'TOR',  'NHL',   'Atlantic',   '#00205B'),
  (16, 'Bruins',      'BOS',  'NHL',   'Atlantic',   '#FFB81C');

SELECT setval('teams_team_id_seq', 16, true);

-- =============================================================
-- GAMES
-- =============================================================
INSERT INTO games (game_id, home_team_id, away_team_id, game_datetime, venue, home_score, away_score, status) VALUES
  (1,  1,  2,  NOW() - INTERVAL '2 hours', 'Soldier Field',         14, 21, 'live'),
  (2,  11, 12, NOW() - INTERVAL '1 hour',  'Rice-Eccles Stadium',   27, 31, 'live'),
  (3,  7,  8,  NOW() + INTERVAL '3 hours', 'Crypto.com Arena',      NULL, NULL, 'scheduled'),
  (4,  3,  4,  NOW() + INTERVAL '4 hours', 'Arrowhead Stadium',     NULL, NULL, 'scheduled'),
  (5,  5,  6,  NOW() + INTERVAL '1 day',   'AT&T Stadium',          NULL, NULL, 'scheduled'),
  (6,  9,  10, NOW() + INTERVAL '1 day',   'Chase Center',          NULL, NULL, 'scheduled'),
  (7,  13, 14, NOW() + INTERVAL '3 days',  'Yankee Stadium',        NULL, NULL, 'scheduled'),
  (8,  15, 16, NOW() + INTERVAL '4 days',  'Scotiabank Arena',      NULL, NULL, 'scheduled');

SELECT setval('games_game_id_seq', 8, true);

-- =============================================================
-- CHATS
-- =============================================================
INSERT INTO chats (chat_id, chat_name, admin_id) VALUES
  (1, 'NFL Sunday',      2),
  (2, 'College Ballers', 1),
  (3, 'Work League',     5),
  (4, 'Hoops Heads',     8);

SELECT setval('chats_chat_id_seq', 4, true);

-- =============================================================
-- CHAT_MEMBERS
-- =============================================================
INSERT INTO chat_members (chat_id, user_id, points, is_king, minority_wins) VALUES
  -- NFL Sunday (c1)
  (1, 2, 1240, TRUE,  3),
  (1, 1,  980, FALSE, 1),
  (1, 3,  870, FALSE, 2),
  (1, 5,  650, FALSE, 0),
  (1, 7,  540, FALSE, 1),
  -- College Ballers (c2)
  (2, 1, 1410, TRUE,  4),
  (2, 3, 1150, FALSE, 2),
  (2, 4,  890, FALSE, 1),
  (2, 6,  720, FALSE, 0),
  -- Work League (c3)
  (3, 5, 1820, TRUE,  5),
  (3, 1, 1310, FALSE, 2),
  (3, 6,  980, FALSE, 1),
  (3, 4,  750, FALSE, 0),
  (3, 8,  620, FALSE, 1),
  -- Hoops Heads (c4)
  (4, 8,  960, TRUE,  2),
  (4, 1,  840, FALSE, 1),
  (4, 7,  730, FALSE, 0),
  (4, 2,  680, FALSE, 1);

-- =============================================================
-- CHAT_TEAMS
-- =============================================================
INSERT INTO chat_teams (chat_id, team_id) VALUES
  (1, 1), (1, 2), (1, 3), (1, 4),  -- NFL Sunday follows NFL teams
  (2, 11),(2, 12),                   -- College Ballers follows NCAAF
  (3, 3), (3, 6),                    -- Work League
  (4, 7), (4, 8), (4, 9), (4, 10);  -- Hoops Heads follows NBA

-- =============================================================
-- BETS (active predictions)
-- =============================================================
INSERT INTO bets (bet_id, chat_id, game_id, created_by_user_id, question, prediction_options_json, min_wager, points_in_pot, status) VALUES
  (1, 1, 1, 2,
   'Who wins Bears vs Packers?',
   '[{"id":"o1","text":"Bears","wagers":[{"userId":2,"amount":50},{"userId":7,"amount":30}]},{"id":"o2","text":"Packers","wagers":[{"userId":3,"amount":40}]}]',
   10, 120, 'open'),
  (2, 2, 2, 1,
   'Utah vs BYU — total points over/under 52.5?',
   '[{"id":"o5","text":"Over 52.5","wagers":[{"userId":1,"amount":60}]},{"id":"o6","text":"Under 52.5","wagers":[{"userId":3,"amount":45}]}]',
   15, 105, 'open');

SELECT setval('bets_bet_id_seq', 2, true);

-- =============================================================
-- MESSAGES
-- =============================================================
INSERT INTO messages (message_id, chat_id, user_id, message_type, message_text, sent_at) VALUES
  -- NFL Sunday
  (1,  1, 2,    'system', 'New prediction is up! Who wins tonight?',                   NOW() - INTERVAL '30 min'),
  (2,  1, 2,    'user',   'Bears are taking it tonight. Jordan is getting wrecked',     NOW() - INTERVAL '29 min'),
  (3,  1, 3,    'user',   'No shot. Packers by 10 easy. Put your points where your mouth is', NOW() - INTERVAL '28 min'),
  (4,  1, 1,    'user',   'Let''s go! I''m riding with the Bears on this one',          NOW() - INTERVAL '27 min'),
  (5,  1, 5,    'user',   'This is gonna be a close one... not touching it yet',        NOW() - INTERVAL '26 min'),
  (6,  1, 7,    'user',   'Gotta go Bears. All in.',                                    NOW() - INTERVAL '24 min'),
  (7,  1, 2,    'user',   'That''s what I''m talking about! King knows best',           NOW() - INTERVAL '23 min'),
  -- College Ballers
  (20, 2, 1,    'system', 'Created a new prediction on the Holy War game',              NOW() - INTERVAL '60 min'),
  (21, 2, 3,    'user',   'Under 52.5 all day. Both defenses are legit this year',      NOW() - INTERVAL '58 min'),
  (22, 2, 1,    'user',   'Nah these offenses are cooking. Over hits easy',             NOW() - INTERVAL '57 min'),
  (23, 2, 4,    'user',   'I''m locked out so can''t bet but I''d go over too',         NOW() - INTERVAL '55 min'),
  (24, 2, 6,    'user',   'Tough one. Sitting this out for now',                        NOW() - INTERVAL '50 min'),
  -- Work League
  (30, 3, 5,    'system', 'No active predictions right now. Taking a break this week',  NOW() - INTERVAL '3 hours'),
  (31, 3, 1,    'user',   'Casey you scared to put one up? Been quiet',                 NOW() - INTERVAL '175 min'),
  (32, 3, 5,    'user',   'I''m the King. I post when I want',                          NOW() - INTERVAL '174 min'),
  (33, 3, 8,    'user',   'lol somebody dethrone Casey already',                        NOW() - INTERVAL '170 min'),
  -- Hoops Heads
  (40, 4, 8,    'user',   'Lakers vs Celtics tonight. Anyone want to make it interesting?', NOW() - INTERVAL '2 hours'),
  (41, 4, 1,    'user',   'Drop a prediction. Lakers easy',                             NOW() - INTERVAL '115 min'),
  (42, 4, 7,    'user',   'Celtics are rolling right now though',                       NOW() - INTERVAL '114 min');

SELECT setval('messages_message_id_seq', 42, true);

-- =============================================================
-- FRIEND_REQUESTS
-- =============================================================
INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES
  (3, 1, 'pending'),
  (6, 1, 'pending');

-- =============================================================
-- FRIENDSHIPS
-- =============================================================
INSERT INTO friendships (user_id_1, user_id_2) VALUES
  (1, 2),
  (1, 5),
  (2, 5);

-- =============================================================
-- GAME_STATS  (for the two live games)
-- =============================================================
INSERT INTO game_stats (game_id, team_id, passing_yards, rushing_yards, total_yards, turnovers, time_of_possession_seconds) VALUES
  (1, 1, 178, 85, 263, 1, 1740),  -- Bears
  (1, 2, 241, 62, 303, 0, 1860),  -- Packers
  (2, 11, 198, 110, 308, 2, 1800), -- Utah
  (2, 12, 172, 95,  267, 1, 1800); -- BYU

-- =============================================================
-- DAILY_STRIKES
-- =============================================================
INSERT INTO daily_strikes (user_id, strike_date, strike_count, reason) VALUES
  (1, CURRENT_DATE,              1, 'Changed prediction after lock'),
  (3, CURRENT_DATE,              2, 'Late submission x2'),
  (4, CURRENT_DATE,              3, 'Accumulated strikes');

-- =============================================================
-- BET_HISTORY  (resolved past bets)
-- =============================================================
INSERT INTO bet_history (user_id, chat_id, game_id, bet_id, points_change) VALUES
  (1, 1, 4, 1,  80),
  (2, 1, 4, 1,  50),
  (1, 4, 3, 2, -30),
  (1, 2, 2, 2,  65),
  (3, 2, 2, 2, -60);

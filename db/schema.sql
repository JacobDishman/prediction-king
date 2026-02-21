-- =============================================================
-- ChatKings Database Schema
-- Run: psql -U <user> -d <dbname> -f db/schema.sql
-- =============================================================

-- Drop tables in reverse dependency order for clean re-runs
DROP TABLE IF EXISTS bet_history CASCADE;
DROP TABLE IF EXISTS daily_strikes CASCADE;
DROP TABLE IF EXISTS game_stats CASCADE;
DROP TABLE IF EXISTS bets CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_teams CASCADE;
DROP TABLE IF EXISTS chat_members CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS friend_requests CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================================
-- USERS
-- =============================================================
CREATE TABLE users (
    user_id       SERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    phone_number  VARCHAR(20),
    add_code      VARCHAR(20)  NOT NULL UNIQUE,
    profile_image_url TEXT,
    all_time_points   INT NOT NULL DEFAULT 0,
    strikes       INT NOT NULL DEFAULT 0 CHECK (strikes BETWEEN 0 AND 3),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- CHATS
-- =============================================================
CREATE TABLE chats (
    chat_id        SERIAL PRIMARY KEY,
    chat_name      VARCHAR(100) NOT NULL,
    admin_id       INT          NOT NULL REFERENCES users(user_id),
    end_date       DATE,
    bet_permission BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =============================================================
-- CHAT_MEMBERS
-- =============================================================
CREATE TABLE chat_members (
    member_id      SERIAL PRIMARY KEY,
    chat_id        INT         NOT NULL REFERENCES chats(chat_id) ON DELETE CASCADE,
    user_id        INT         NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    points         INT         NOT NULL DEFAULT 0,
    is_king        BOOLEAN     NOT NULL DEFAULT FALSE,
    minority_wins  INT         NOT NULL DEFAULT 0,
    joined_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    left_at        TIMESTAMPTZ,
    UNIQUE (chat_id, user_id)
);

-- =============================================================
-- TEAMS
-- =============================================================
CREATE TABLE teams (
    team_id           SERIAL PRIMARY KEY,
    team_name         VARCHAR(100) NOT NULL,
    team_abbreviation VARCHAR(10)  NOT NULL,
    logo_url          TEXT,
    league            VARCHAR(20)  NOT NULL,
    conference        VARCHAR(50),
    primary_color     VARCHAR(10),
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =============================================================
-- GAMES
-- =============================================================
CREATE TABLE games (
    game_id        SERIAL PRIMARY KEY,
    home_team_id   INT         NOT NULL REFERENCES teams(team_id),
    away_team_id   INT         NOT NULL REFERENCES teams(team_id),
    game_datetime  TIMESTAMPTZ NOT NULL,
    venue          VARCHAR(150),
    home_score     INT,
    away_score     INT,
    status         VARCHAR(20) NOT NULL DEFAULT 'scheduled'
                   CHECK (status IN ('scheduled','live','final','postponed')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- CHAT_TEAMS  (which teams a chat follows)
-- =============================================================
CREATE TABLE chat_teams (
    chat_team_id SERIAL PRIMARY KEY,
    chat_id      INT NOT NULL REFERENCES chats(chat_id)  ON DELETE CASCADE,
    team_id      INT NOT NULL REFERENCES teams(team_id)  ON DELETE CASCADE,
    added_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (chat_id, team_id)
);

-- =============================================================
-- BETS  (predictions / wagers)
-- =============================================================
CREATE TABLE bets (
    bet_id                 SERIAL PRIMARY KEY,
    chat_id                INT         NOT NULL REFERENCES chats(chat_id) ON DELETE CASCADE,
    game_id                INT         REFERENCES games(game_id),
    created_by_user_id     INT         NOT NULL REFERENCES users(user_id),
    question               TEXT        NOT NULL,
    prediction_options_json JSONB      NOT NULL DEFAULT '[]',
    min_wager              INT         NOT NULL DEFAULT 0,
    points_in_pot          INT         NOT NULL DEFAULT 0,
    status                 VARCHAR(20) NOT NULL DEFAULT 'open'
                           CHECK (status IN ('open','locked','resolved','cancelled')),
    correct_option_id      VARCHAR(50),
    placed_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at            TIMESTAMPTZ,
    resolved_by_user_id    INT         REFERENCES users(user_id)
);

-- =============================================================
-- MESSAGES
-- =============================================================
CREATE TABLE messages (
    message_id    SERIAL PRIMARY KEY,
    chat_id       INT         NOT NULL REFERENCES chats(chat_id) ON DELETE CASCADE,
    user_id       INT         REFERENCES users(user_id),
    message_type  VARCHAR(20) NOT NULL DEFAULT 'user'
                  CHECK (message_type IN ('user','system','prediction')),
    message_text  TEXT        NOT NULL,
    related_bet_id INT        REFERENCES bets(bet_id),
    sent_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- FRIEND_REQUESTS
-- =============================================================
CREATE TABLE friend_requests (
    request_id   SERIAL PRIMARY KEY,
    sender_id    INT         NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    receiver_id  INT         NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status       VARCHAR(20) NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','accepted','declined')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    UNIQUE (sender_id, receiver_id)
);

-- =============================================================
-- FRIENDSHIPS
-- =============================================================
CREATE TABLE friendships (
    friendship_id SERIAL PRIMARY KEY,
    user_id_1     INT         NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    user_id_2     INT         NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (user_id_1 < user_id_2),
    UNIQUE (user_id_1, user_id_2)
);

-- =============================================================
-- GAME_STATS
-- =============================================================
CREATE TABLE game_stats (
    stat_id                    SERIAL PRIMARY KEY,
    game_id                    INT NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    team_id                    INT NOT NULL REFERENCES teams(team_id),
    passing_yards              INT,
    rushing_yards              INT,
    total_yards                INT,
    turnovers                  INT,
    time_of_possession_seconds INT,
    other_stats_json           JSONB,
    UNIQUE (game_id, team_id)
);

-- =============================================================
-- DAILY_STRIKES
-- =============================================================
CREATE TABLE daily_strikes (
    strike_id    SERIAL PRIMARY KEY,
    user_id      INT  NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    chat_id      INT  REFERENCES chats(chat_id) ON DELETE SET NULL,
    strike_date  DATE NOT NULL DEFAULT CURRENT_DATE,
    strike_count INT  NOT NULL DEFAULT 0 CHECK (strike_count >= 0),
    reason       TEXT,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, strike_date)
);

-- =============================================================
-- BET_HISTORY
-- =============================================================
CREATE TABLE bet_history (
    history_id    SERIAL PRIMARY KEY,
    user_id       INT         NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    chat_id       INT         NOT NULL REFERENCES chats(chat_id) ON DELETE CASCADE,
    game_id       INT         REFERENCES games(game_id),
    bet_id        INT         NOT NULL REFERENCES bets(bet_id) ON DELETE CASCADE,
    points_change INT         NOT NULL,
    recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    username text NOT NULL
);

CREATE UNIQUE INDEX users_username_lower_unique
ON users (lower(username));

CREATE TABLE sessions (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id integer NOT NULL,
    token_hash text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL,

    CONSTRAINT sessions_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX sessions_expires_at_idx
ON sessions (expires_at);


CREATE TABLE otps (
    email text NOT NULL,
    code text NOT NULL,
    purpose text NOT NULL DEFAULT 'login',
    expires_at timestamptz NOT NULL DEFAULT now() + INTERVAL '5 minute',
    challenge_id text NOT NULL,
    verified boolean NOT NULL DEFAULT FALSE,
    CONSTRAINT otps_email_purpose_key UNIQUE (email, purpose)
);
--\c postgres postgres

SELECT cron.schedule_in_database('otp_cleanup', '* * * * *' ,'DELETE FROM otps WHERE expires_at <= now()', 'gridnexus', 'postgres', true);
--Parameters: Job Name, Schedule, Query, Database Name, Username, Active

-- Have to work more here!!!

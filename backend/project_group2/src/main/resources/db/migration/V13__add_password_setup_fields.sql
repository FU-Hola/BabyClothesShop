ALTER TABLE shop.users
    ALTER COLUMN password_hash DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS password_reset_token_hash varchar(64),
    ADD COLUMN IF NOT EXISTS password_reset_expires_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS uk_users_password_reset_token_hash
    ON shop.users (password_reset_token_hash);

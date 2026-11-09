ALTER TABLE shop.users
    ADD COLUMN IF NOT EXISTS address varchar(1000),
    ADD COLUMN IF NOT EXISTS date_of_birth date,
    ADD COLUMN IF NOT EXISTS gender varchar(16)
        CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    ADD COLUMN IF NOT EXISTS last_login_at timestamptz,
    ADD COLUMN IF NOT EXISTS refresh_token_hash varchar(64),
    ADD COLUMN IF NOT EXISTS refresh_token_expires_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS uk_users_refresh_token_hash
    ON shop.users (refresh_token_hash);

# BabyClothesShop backend authentication

The backend uses stateless Spring Security authentication with signed JWT access and refresh tokens. Passwords are stored with BCrypt. Refresh tokens are stored only as SHA-256 hashes in `auth_sessions` so the raw token is never persisted.

## Local configuration

Copy `.env.example` to `.env`, fill in the PostgreSQL passwords, and generate a JWT secret containing at least 32 random bytes:

```powershell
Copy-Item .env.example .env
openssl rand -base64 32
```

Set the generated value as `JWT_SECRET_BASE64`. Never commit `.env` or a real JWT secret. The main JWT settings are:

| Variable | Default | Purpose |
|---|---:|---|
| `JWT_ACCESS_TTL_SECONDS` | `900` | Access token lifetime, 15 minutes |
| `JWT_REFRESH_TTL_SECONDS` | `604800` | Session and refresh token lifetime, 7 days |
| `JWT_ISSUER` | `baby-clothes-shop-api` | Required `iss` claim |
| `JWT_AUDIENCE` | `baby-clothes-shop` | Required `aud` claim |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated frontend origins |

Start PostgreSQL as described in `../../docker/postgres/README.md`, then run:

```powershell
.\mvnw.cmd spring-boot:run
```

The current development configuration uses `spring.jpa.hibernate.ddl-auto=create`. Restarting the backend recreates the tables and removes all accounts and authentication sessions.

## Authentication flow

1. `POST /api/v1/auth/register` creates an active `CUSTOMER` account. Registration cannot choose a role.
2. `POST /api/v1/auth/login` checks the password with BCrypt and returns an access token, refresh token, `tokenType`, `expiresIn`, and the public user data.
3. Protected requests send `Authorization: Bearer <accessToken>`. The JWT filter checks the signature, algorithm, issuer, audience, token type, expiry, session, and current account status.
4. `POST /api/v1/auth/refresh` rotates the refresh token while keeping the original seven-day session deadline. A refresh token can be used only once.
5. `POST /api/v1/auth/logout` revokes the selected session. Access and refresh tokens from that session stop working immediately; other sessions remain active.

Both tokens contain `sub` as the user UUID and `sid` as the authentication-session UUID. The access token has `token_type=access`; the refresh token has `token_type=refresh` and a unique `jti`.

## API examples

Register:

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "fullName": "Nguyen Van An",
  "email": "an@example.com",
  "password": "secret123"
}
```

Login:

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "an@example.com",
  "password": "secret123"
}
```

Get the current user:

```http
GET /api/v1/auth/me
Authorization: Bearer <accessToken>
```

Refresh or logout:

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{"refreshToken":"<refreshToken>"}
```

Use the same JSON body with `POST /api/v1/auth/logout`. Every endpoint returns the existing `ApiResponse` envelope. Invalid credentials return error code `1003`; missing authentication returns `1001`; invalid or expired tokens return `1004`; insufficient roles return `1002`.

Registration trims names, lowercases and trims email, and accepts passwords from 6 characters up to 72 UTF-8 bytes. Passwords are not trimmed.

## Role boundaries

| Path | Required role |
|---|---|
| `/api/v1/store-staff/**` | `STORE_STAFF` |
| `/api/v1/warehouse-staff/**` | `WAREHOUSE_STAFF` |
| `/api/v1/admin/**` | `ADMIN` |

`ADMIN` does not inherit staff access. `GET /api/v1/categories` and the register, login, refresh, and logout endpoints are public. All other endpoints require a valid access token. Controllers take the acting user ID from the verified principal; `X-User-Id` is ignored.

## Verification

With Docker available, Testcontainers is the default isolated PostgreSQL provider:

```powershell
.\mvnw.cmd verify
```

On a Windows machine without Docker, use the isolated embedded PostgreSQL fallback:

```powershell
.\mvnw.cmd '-Dtest.database=embedded' verify
```

The integration suite covers registration races, password authentication, JWT validation, refresh rotation, simultaneous refresh, immediate logout revocation, CORS, the complete authentication flow, role boundaries, and forged `X-User-Id` headers.

# Chirpy API

A RESTful HTTP server built with TypeScript, Node.js and Express.js, backed by PostgreSQL. Chirpy is a social-media-style backend API similar to the old-school edition of Twitter. The server supports user management, authentication, content creation, database persistence and membership upgrades.

Developed as part of learning HTTP Servers within the Boot.dev Backend Developer curriculum, this project demonstrates practical backend engineering concepts, including REST API design, HTTP request handling, authentication, authorisation, middleware and relational database integration.

## Tech Stack

| Technology | Purpose |
|---|---|
| TypeScript | Server-side application development |
| Node.js | JavaScript runtime |
| Express.js 5 | HTTP server and routing |
| PostgreSQL | Relational database |
| Drizzle ORM | Database queries and schema management |
| Drizzle Kit | Database migrations |
| Argon2 | Secure password hashing |
| JSON Web Tokens (JWT) | Access token authentication |
| Vitest | Testing framework |
| Git & GitHub | Version control |

## Features

### User Management
- User registration and login.
- Secure password hashing using Argon2.
- Authenticated account updates, including email and password changes.
- Persistent user account management.

### Authentication & Authorisation
- JWT-based authentication using bearer tokens.
- Access token generation and validation.
- Refresh token generation, validation and revocation.
- Persistent refresh token management.
- Resource ownership checks to ensure users can only delete their own chirps.
- API key authentication for webhook requests.

### Chirp Management
- Create chirps associated with authenticated users.
- Retrieve all chirps or individual chirps by ID.
- Filter chirps by author ID.
- Sort chirps by creation date in ascending or descending order.
- Delete chirps with ownership verification.
- Profanity filtering for submitted content.
- Maximum chirp length validation of 140 characters.

### Webhooks & Membership
- Integration with Polka webhook services.
- API key verification for incoming webhook requests.
- Processing membership upgrade events.
- Updating user membership status through webhook integrations.

### Server Administration & Middleware
- Request logging middleware.
- Centralised HTTP error handling.
- Server readiness endpoint.
- Static file serving.
- File-server request metrics.
- Development-only administrative reset functionality.

## Architecture

The application follows a modular client-server architecture, separating HTTP routing, request handling, authentication and database operations.

```
Client
  |
  | HTTP Request
  v
Express.js Server
  |
  v
Middleware
  |
  v
Route Handlers
  |
  +-----------------------+
  |                       |
  v                       v
Authentication        Business Logic
(JWT / Argon2)              |
  |                       |
  +-----------+-----------+
              |
              v
         Drizzle ORM
              |
              v
          PostgreSQL
              |
              v
         HTTP Response
              |
              v
            Client
```

## Database Design

PostgreSQL provides persistent storage, with Drizzle ORM handling database queries and schema management.

The database consists of three primary tables:

| Table | Description |
|---|---|
| `users` | Stores user accounts, hashed passwords and membership status. |
| `chirps` | Stores user-generated content and associated author IDs. |
| `refresh_tokens` | Stores refresh tokens, associated users, expiration dates and revocation timestamps. |

**Relationships:**
- Each user can create multiple chirps.
- Each chirp belongs to a user.
- Each user can have multiple refresh tokens.
- Foreign-key constraints maintain referential integrity.

Database schema changes are managed through Drizzle migrations.

## API Documentation

### Health & Chirps

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/healthz` | Server readiness check |
| POST | `/api/chirps` | Create a chirp (authenticated) |
| GET | `/api/chirps` | Retrieve chirps |
| GET | `/api/chirps/:chirpId` | Retrieve a chirp by ID |
| DELETE | `/api/chirps/:chirpId` | Delete an owned chirp (authenticated) |

The chirps endpoint supports optional query parameters:

| Parameter | Description |
|---|---|
| `authorId` | Filter chirps by author UUID |
| `sort` | Sort results using `asc` or `desc` |

Example:

```
HTTP:
GET /api/chirps?authorId=USER_UUID&sort=desc
```

### User Management & Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users` | Register a new user |
| POST | `/api/login` | Authenticate and generate tokens |
| PUT | `/api/users` | Update authenticated user details |
| POST | `/api/refresh` | Generate a new access token |
| POST | `/api/revoke` | Revoke a refresh token |

### Webhooks & Administration

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/polka/webhooks` | Process membership upgrade events |
| GET | `/admin/metrics` | View file-server usage metrics |
| POST | `/admin/reset` | Reset development data and metrics |

**Note:** Administrative reset functionality is restricted to the development environment.

## Getting Started

### Prerequisites

- Node.js 22.14.0 or later.
- npm.
- PostgreSQL.
- Git.

### 1. Clone the repository

```bash
git clone https://github.com/kieranbarry7/Chirpy.git
cd Chirpy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=8080
PLATFORM=dev
DB_URL=postgres://username:password@localhost:5432/chirpy
JWT_SECRET=your_jwt_secret
POLKA_KEY=your_polka_api_key
```

Replace the database credentials and secrets with your own values.

**Important:** Never commit your `.env` file or expose credentials in version control.

### 4. Start the server

Run the development server:

```bash
npm run dev
```

The server applies database migrations during startup and listens on the configured port.

By default, the API is available at:

```text
http://localhost:8080
```

### Available npm Scripts

| Command | Description |
|---|---|
| `npm run dev` | Compile TypeScript and start the development server |
| `npm run build` | Compile TypeScript |
| `npm start` | Start the compiled server |
| `npm test` | Execute the Vitest test suite |

## Technical Concepts Demonstrated

This project provided practical experience with:

- Building HTTP servers using Node.js and Express.js.
- Designing and implementing RESTful APIs.
- Handling HTTP methods, status codes and request/response cycles.
- Implementing middleware and centralised error handling.
- Designing relational database schemas and foreign-key relationships.
- Integrating PostgreSQL through an ORM.
- Managing database schemas and migrations.
- Implementing secure password hashing and JWT authentication.
- Managing access and refresh token lifecycles.
- Implementing resource ownership and authorisation checks.
- Processing authenticated webhook integrations.
- Using TypeScript to structure backend applications.
- Debugging and testing server-side functionality.

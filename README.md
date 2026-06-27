# User Registration API

Express.js backend for user registration, login, and profile management with JWT authentication.

## Folder Structure

```
Assignment21/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection setup
│   ├── constants/
│   │   └── bloodGroups.js        # Allowed blood group values
│   ├── controllers/
│   │   └── userController.js     # HTTP request/response handlers
│   ├── services/
│   │   └── userService.js        # Business logic & database operations
│   ├── middleware/
│   │   └── auth.js               # JWT + cookie authentication
│   ├── models/
│   │   ├── User.js               # User Mongoose schema & model
│   │   └── index.js              # Export all models
│   ├── routes/
│   │   ├── userRoutes.js         # User API routes
│   │   └── index.js              # Route aggregator
│   ├── utils/
│   │   └── token.js              # JWT sign & cookie helpers
│   ├── app.js                    # Express app configuration
│   └── index.js                  # Server entry point
├── .env                          # Environment variables (not committed)
├── .env.example                  # Environment template
├── .gitignore
├── package.json
└── README.md
```

## User Model (Mongoose Schema)

| Field        | Type   | Required | Notes                          |
|--------------|--------|----------|--------------------------------|
| firstName    | String | Yes      |                                |
| lastName     | String | Yes      |                                |
| NIDNumber    | String | Yes      | Unique                         |
| phoneNumber  | String | Yes      | Unique                         |
| password     | String | Yes      | Hashed, min 6 chars            |
| bloodGroup   | String | Yes      | A+, A-, B+, B-, AB+, AB-, O+, O- |
| createdAt    | Date   | Auto     | Timestamp                      |
| updatedAt    | Date   | Auto     | Timestamp                      |

## Setup

```bash
npm install
cp .env.example .env
npm start
```

Dev mode with auto-reload:

```bash
npm run dev
```

## API Endpoints

Base URL: `http://localhost:3000/api/users`

| Method | Endpoint    | Auth | Description              |
|--------|-------------|------|--------------------------|
| POST   | /register   | No   | Register new user        |
| POST   | /login      | No   | Login user               |
| POST   | /logout     | Yes  | Logout user              |
| GET    | /profile    | Yes  | Get logged-in user       |
| GET    | /           | Yes  | Get all users            |
| GET    | /:id        | Yes  | Get single user by ID    |
| PUT    | /:id        | Yes  | Update single user       |
| DELETE | /:id        | Yes  | Delete single user       |

Auth: send JWT via `Authorization: Bearer <token>` header or `token` httpOnly cookie.

## Register Example

```json
POST /api/users/register
{
  "firstName": "John",
  "lastName": "Doe",
  "NIDNumber": "1234567890",
  "phoneNumber": "01712345678",
  "password": "secret123",
  "bloodGroup": "A+"
}
```

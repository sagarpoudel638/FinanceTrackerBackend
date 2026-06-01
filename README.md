# Finance Tracker — Backend API

REST API for the Finance Tracker application. Handles user authentication, transaction management, and AI-powered financial suggestions via Google Gemini.

## Tech Stack

- **Runtime:** Node.js (ESM)
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Mongoose)
- **Auth:** JSON Web Tokens (JWT) + Bcrypt
- **Email:** Resend (HTTP API)
- **AI:** Google Generative AI — Gemini 2.5 Flash
- **Validation:** Joi
- **Deployment:** Render.com

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- A [Resend](https://resend.com) account with a verified sending domain
- A [Google AI Studio](https://aistudio.google.com) API key (billing enabled on Google Cloud)

### Installation

```bash
cd FinanceTrackerBackEnd
npm install
```

### Environment Variables

Create a `.env` file in the root of `FinanceTrackerBackEnd/`:

```env
PORT=5000
MONGODB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/financetracker
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxx
FRONTEND_URL=http://localhost:5173
```

> **Production:** Set these in your Render dashboard under Environment Variables. Never commit `.env` to version control.

### Running Locally

```bash
# Development (nodemon auto-reload)
npm run dev

# Production
npm start
```

Server starts at `http://localhost:5000` by default.

---

## Project Structure

```
FinanceTrackerBackEnd/
├── server.js                     # Entry point — loads env, mounts routers
└── src/
    ├── config/
    │   └── config.js             # Reads and exports env vars
    ├── middleware/
    │   ├── AuthMiddleware.js     # JWT verification — attaches req.user
    │   └── joiValidation.js      # Request body validation (signup/login)
    ├── models/
    │   ├── userSchema.js         # User model + DB helper functions
    │   └── transactionsSchema.js # Transaction model + DB helper functions
    ├── router/
    │   ├── authRouter.js         # Auth routes (signup, login, email verification)
    │   └── transactionRouter.js  # Transaction CRUD + AI suggestions
    └── utils/
        ├── helper.js             # Gemini API call + prompt builder
        └── mailer.js             # Sends verification emails via Resend
```

---

## API Reference

All protected routes require the header:
```
Authorization: Bearer <jwt_token>
```

### Auth — `/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | No | Register a new user |
| POST | `/auth/login` | No | Login and receive a JWT |
| GET | `/auth/verify` | Yes | Check if current JWT is valid |
| GET | `/auth/useremailverification/:token` | No | Verify email address from link |
| POST | `/auth/resend-verification` | No | Resend the email verification link |

**POST `/auth/signup`**
```json
{
  "name": "Sagar",
  "email": "user@example.com",
  "password": "mypassword",
  "confirmPassword": "mypassword"
}
```

**POST `/auth/login`**
```json
{
  "email": "user@example.com",
  "password": "mypassword"
}
```
Returns `{ data: { username, userId, token } }` on success.

---

### Transactions — `/transactions`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/transactions` | Yes | Get all transactions for current user |
| POST | `/transactions/transaction` | Yes | Create a new transaction |
| GET | `/transactions/suggestions` | Yes | Get AI-generated financial suggestions |
| GET | `/transactions/:id` | Yes | Get a single transaction by ID |
| PATCH | `/transactions/:id` | Yes | Update a transaction |
| DELETE | `/transactions/:id` | Yes | Delete a transaction |

**POST `/transactions/transaction`**
```json
{
  "title": "Salary",
  "income": 5000,
  "expenses": 0,
  "createdAt": "2024-01-15"
}
```

---

## Authentication Flow

1. User signs up → account created (`isVerified: false`) → verification email sent via Resend.
2. User clicks the link → `GET /auth/useremailverification/:token` → `isVerified` set to `true`.
3. User logs in → bcrypt password check → `isVerified` check → JWT returned.
4. Protected routes verify the JWT via `authMiddleware` and expose `req.user`.
5. Unverified users receive HTTP 403 on login.

---

## AI Suggestions

`GET /transactions/suggestions` does the following:

1. Fetches all transactions for the requesting user.
2. Strips MongoDB metadata — only sends `title`, `income`, `expenses`, `date` to Gemini.
3. Pre-calculates summary stats (total income, expenses, net balance, savings rate).
4. Sends a structured prompt asking for exactly 5 numbered plain-text suggestions.
5. Returns the text, or a user-friendly message if the daily quota is exceeded (HTTP 429).

**Requirements:**
- Billing must be enabled on the Google Cloud project linked to the API key.
- Model: `gemini-2.5-flash`.

---

## Email (Resend)

Verification emails are sent via Resend's HTTPS API — not SMTP.

> **Important:** Render.com free tier blocks all outbound SMTP ports (25, 465, 587). Nodemailer and any SMTP-based library will always time out on Render. Resend is not affected.

**Setup:**
1. Add and verify your domain in the [Resend dashboard](https://resend.com/domains).
2. Add the DNS records (MX, SPF TXT, DKIM CNAME) to your domain registrar.
3. Update the `from` address in `src/utils/mailer.js` to use your domain.

---

## Deployment (Render.com)

1. Push to GitHub.
2. Create a new **Web Service** on Render and connect your repo.
3. Set **Build Command:** `npm install`
4. Set **Start Command:** `npm start`
5. Add all environment variables in the Render dashboard.
6. Set `FRONTEND_URL` to your deployed frontend URL.

> **Free tier:** The service spins down after 15 minutes of inactivity. The first request after a spin-down takes ~30 seconds. This is expected on the free plan.

---

## License

MIT

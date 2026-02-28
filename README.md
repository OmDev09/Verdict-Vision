# Verdict Vision

AI-powered legal assistant for Indian law. Helps citizens understand legal situations and lawyers generate professional arguments using Supreme Court & Delhi High Court judgments. Freemium credit model with Razorpay.

## Features

- **Normal users**: Search legal situations, simplified advice, similar cases, next steps
- **Lawyers**: Register with Bar Council enrollment number; get citations, arguments, draft templates
- **Auth**: Email/password, JWT, roles (USER, LAWYER, ADMIN)
- **Credits**: 10 free credits; 1 search = 1 credit; Razorpay for Basic / Pro / Lawyer Premium
- **RAG**: Semantic + keyword search → retrieve similar judgments → LLM (OpenAI) response
- **Legal compliance**: Disclaimer on all outputs; Indian IT Act; public judgments only

## Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Framer Motion
- **Backend**: NestJS, Prisma, PostgreSQL, JWT, Argon2, Razorpay
- **AI**: OpenAI (embeddings + chat), keyword search (Prisma); optional Pinecone for vectors

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL
- (Optional) Redis

### 1. Clone and install

```bash
cd "Verdict Vision"
npm install
```

### 2. Environment

Copy `.env.example` to `apps/api/.env` and `apps/web/.env.local`. Set at least:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — long random string (e.g. 32+ chars)
- `OPENAI_API_KEY` — for AI search and responses
- `NEXT_PUBLIC_API_URL` — e.g. `http://localhost:4000`
- For payments: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`

### 3. Database

```bash
npm run db:generate
npm run db:push
```

To create an ADMIN user, use Prisma Studio or run a one-off script that hashes a password and inserts a user with `role: 'ADMIN'`.


### 4. Run

```bash
# API (port 4000)
npm run dev:api

# Web (port 3000), in another terminal
npm run dev:web
```

Or both: `npm run dev`

- Frontend: http://localhost:3000  
- API: http://localhost:4000  

## Project structure

```
├── apps/
│   ├── api/                 # NestJS backend
│   │   ├── prisma/          # Schema, migrations
│   │   └── src/
│   │       ├── auth/        # JWT, register/login, lawyer verification
│   │       ├── users/
│   │       ├── search/      # 1 credit per search, AI response
│   │       ├── payments/    # Plans, Razorpay order/confirm, webhook
│   │       ├── cases/       # Keyword/suggest; RAG uses this + optional vector DB
│   │       ├── ai/          # Embeddings, retrieve cases, generate response
│   │       ├── admin/       # Stats, users, approve lawyers, create case
│   │       └── audit/
│   └── web/                 # Next.js frontend
│       └── src/
│           ├── app/         # Landing, login, register, dashboard, search, wallet, profile, admin
│           ├── components/ # UI, disclaimer banner, dashboard nav
│           ├── contexts/   # Auth
│           └── lib/        # api client, utils
├── .env.example
└── README.md
```

## API overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | No | Register user |
| POST | /auth/register/lawyer | No | Register lawyer (enrollment no) |
| POST | /auth/login | No | Login |
| GET | /users/me | JWT | Current user |
| POST | /search | JWT | Run search (1 credit), get AI + similar cases |
| GET | /search/history | JWT | Search history |
| GET | /payments/plans | No | List plans |
| POST | /payments/create-order | JWT | Create Razorpay order |
| POST | /payments/confirm | JWT | Confirm payment, add credits |
| POST | /payments/webhook | No | Razorpay webhook |
| GET | /cases/suggest | No | Autocomplete suggestions |
| GET/POST | /admin/* | JWT + ADMIN | Stats, users, lawyers, cases, payments |

## Disclaimer

**Verdict Vision provides AI-generated legal information and does not replace professional legal advice.** Shown in the UI and appended to AI responses.

## Security

- **Rate limiting**: Global throttle (100 requests/minute) via `@nestjs/throttler`.
- **Passwords**: Argon2 (argon2id).
- **JWT**: Stored in memory/localStorage on client; use short expiry and refresh token.
- **Razorpay webhook**: Signature verification requires the raw request body. If using NestJS with body parser, exclude `/payments/webhook` from JSON parser and parse raw for that route, or use a proxy that forwards raw body.
- **HTTPS**: Use in production; set `FRONTEND_URL` and CORS accordingly.

## License

Proprietary. Use in compliance with Indian law and data sources (Supreme Court, Delhi High Court, eCourts, etc.).

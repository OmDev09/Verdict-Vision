# Verdict Vision

Verdict Vision is a next-generation AI-powered legal assistant designed specifically for the complex landscape of Indian jurisprudence. By leveraging a novel **Vectorless RAG (Retrieval-Augmented Generation)** architecture, it delivers precise, hallucination-free legal insights using historical Supreme Court and High Court judgments.

The platform recognizes that legal data must be communicated differently depending on the audience, offering strictly differentiated user journeys:
- **Citizens (Normal Users)**: Receive simplified, empathetic legal advice, actionable next steps, and plain-English explanations of complex procedures within a modern, ChatGPT-styled interface.
- **Lawyers (Professionals)**: Authenticated legal professionals receive high-density analytical outputs including precise case citations, drafted courtroom arguments, and document templates within a specialized professional dashboard.

## Key Innovations & Technical Highlights

1. **Vectorless RAG Retrieval Pipeline**
   - **Problem**: Traditional dense vector embeddings often struggle with the exact phrasing of legal citations (e.g., "AIR 1999 SC 1234"), leading to retrieved cases that are semantically similar but legally irrelevant.
   - **Solution**: Verdict Vision utilizes highly optimized **Lexical Search (PostgreSQL BM25 Full-Text Search)**. This ensures exact matches on legal terminology, case names, and citations. 
   - **Relevance**: Retrieved candidate cases are then passed through an AI-driven relevance pipeline (or Neural Reranker) before being injected into the generative context window.

2. **Role-Based Prompt Engineering & AI Generation**
   - **Dynamic Context**: The NestJS backend intercepts all searches and dynamically modifies the system prompt based on the user's JWT role constraint.
   - **Output Framing**: Legal queries from a `USER` tell the AI to prioritize "simplified advice and next steps", whereas queries from a `LAWYER` command the AI to output "drafting templates, legal arguments, and exact precedent analysis".

3. **Differentiated Frontend Architecture**
   - Built on Next.js 14 (App Router), the application conditionally mounts entirely different React hierarchies.
   - **Citizen UI**: A clean, accessible layout featuring a sliding sidebar, inline AI-search execution, zero-credit history reloading, and minimal distractions.
   - **Lawyer UI**: A data-dense, analytical workspace featuring saved citation trackers, drafting assistants, and multi-pane data visibility.

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Framer Motion, Radix UI (Shadcn)
- **Backend**: NestJS, Prisma ORM, PostgreSQL
- **AI Integration**: Groq API / Llama-3 (for hyper-fast generation), Langchain concepts
- **Auth & Payments**: JWT Access/Refresh flow, Razorpay Integration

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL Server
- Razorpay Account Credentials
- Groq / OpenAI API Keys

### 1. Clone and Install
```bash
git clone https://github.com/OmDev09/Verdict-Vision.git
cd Verdict-Vision
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `apps/api/.env` and `apps/web/.env.local`. Set your `DATABASE_URL`, `JWT_SECRET`, `GROQ_API_KEY`, and `RAZORPAY_*` keys.

### 3. Database Generation
```bash
npx prisma generate
npx prisma db push
```
*Note: Bulk dataset ingestion scripts for Supreme Court and Delhi High Court data are located in the `/scripts` directory.*

### 4. Run the Platform
Open two terminals to run the monorepo-style setup:
```bash
# Terminal 1: Run the Backend API (Port 4000)
npm run dev:api

# Terminal 2: Run the Frontend Next.js app (Port 3000)
npm run dev:web
```
Go to `http://localhost:3000` to launch Verdict Vision.

## Disclaimer & Security
- **Disclaimer**: Verdict Vision provides AI-generated legal information and does not replace professional legal advice from an enrolled advocate.
- **Security**: The platform utilizes Argon2 hashing, strict role-based access control (RBAC), API rate-limiting, and sanitized raw-body webhooks for secure payment processing.

## License
Proprietary. Data usage must comply with Supreme Court and Delhi High Court fair-use reporting standards.

# CCB System

## Overview
Fullstack CCB (Credit Certificate) system with authentication, customer management, and loan simulation capabilities.

## Tech Stack
- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL (Docker container)
- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Testing**: Jest + React Testing Library + Playwright
- **Auth**: JWT + bcrypt
- **Database**: PostgreSQL (via Docker)

## Architecture

```
┌──────────┐    ┌─────────────────┐    ┌────────────────────┐
| Frontend |    | Backend Service |    |    PostgreSQL DB   |
| (Next.Js)|◄──►|    (Nest.js)    |◄──►| (CRUD + CCB + Auth)|
└──────────┘    └─────────────────┘    └────────────────────┘
```

## Project Structure:
```
in coming
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- npm or yarn

### Initial Setup

```bash
# 1. Start PostgreSQL Database
docker run -d --name ccb-postgres -e POSTGRES_USER=ccb_user -e POSTGRES_PASSWORD=ccb_password -e POSTGRES_DB=ccb_db -p 5432:5432 -v ccb_postgres_data:/var/lib/postgresql/data postgres:15-alpine

# 2. Setup Backend
cd backend-ccb
npm install                    # Install all dependencies from package.json
npx prisma migrate dev         # Run database migrations
npx prisma generate            # Generate Prisma Client
npm run start:dev              # Start backend (http://localhost:3001)

# 3. Setup Frontend (in a new terminal)
cd frontend-ccb
npm install                    # Install all dependencies from package.json
npm run dev                    # Start frontend (http://localhost:3000)
```

## Requirements (From Technical Challenge)

### Mandatory
- User authentication (secure method)
- Customer CRUD with individual interest rates
- Database persistence (PostgreSQL)
- Loan simulation (amount, installments, customer interest rate)
- Save simulations to database
- Public Git repository with README

### Optional (Included)
- Generate installment schedule
- Generate CCB document (PDF)

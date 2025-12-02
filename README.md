# CCB System
Sistema Fullstack de CCB (Cédula de Crédito Bancário) com autenticação, gerenciamento de clientes e simulação de empréstimos.

## Stack Tecnológica
- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL (Docker container)
- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Testing**: Jest + React Testing Library
- **Auth**: JWT + bcrypt
- **Database**: PostgreSQL (via Docker)

## Arquitetura
```
┌──────────┐    ┌─────────────────┐    ┌────────────────────┐
| Frontend |    | Backend Service |    |    Banco PostgreSQL|
| (Next.Js)|◄──►|    (Nest.js)    |◄──►| (CRUD + CCB + Auth)|
└──────────┘    └─────────────────┘    └────────────────────┘
```

## Estrutura do Projeto
```
.
├── backend-ccb
│   ├── prisma
│   ├── src
│   │   ├── common
│   │   │   ├── decorators
│   │   │   │   ├── public
│   │   │   │   ├── roles
│   │   │   │   └── user
│   │   │   ├── dto
│   │   │   ├── filters
│   │   │   ├── guards
│   │   │   │   ├── jwt
│   │   │   │   └── roles
│   │   │   └── interceptors
│   │   ├── database
│   │   │   └── prisma
│   │   └── modules
│   │       ├── auth
│   │       │   ├── controllers
│   │       │   ├── dto
│   │       │   ├── interfaces
│   │       │   ├── services
│   │       │   └── strategies
│   │       ├── customer
│   │       │   ├── controllers
│   │       │   ├── dto
│   │       │   ├── entities
│   │       │   └── services
│   │       └── simulations
│   │           ├── controllers
│   │           ├── dto
│   │           ├── services
│   │           └── templates
│   └── test
│       └── modules
│           ├── auth
│           ├── customer
│           └── simulations
└── frontend-ccb
    ├── public
    └── src
        ├── app
        │   ├── (auth)
        │   │   ├── login
        │   │   └── signup
        │   └── (dashboard)
        │       ├── customers
        │       │   └── new
        │       └── simulations
        │           ├── [id]
        │           └── new
        ├── components
        │   ├── auth
        │   ├── features
        │   │   ├── customers
        │   │   └── simulations
        │   ├── layout
        │   ├── shared
        │   │   └── form
        │   └── ui
        ├── hooks
        ├── lib
        └── types
```

## Como Rodar o projeto

### Pré-requisitos
- Node.js 18+
- Docker and Docker Compose
- npm or yarn

### Setup Inicial
```
# 1. Iniciar o Banco PostgreSQL
docker run -d --name ccb-postgres -e POSTGRES_USER=ccb_user -e POSTGRES_PASSWORD=ccb_password -e POSTGRES_DB=ccb_db -p 5432:5432 -v ccb_postgres_data:/var/lib/postgresql/data postgres:15-alpine

# 2. Configurar o Backend
cd backend-ccb
npm install                    # Instalar dependências
npx prisma migrate dev         # Rodar migrações do banco
npx prisma generate            # Gerar Prisma Client
npm run start:dev              # Iniciar backend (http://localhost:8080)

# 3. Configurar o Frontend (em outro terminal)
cd frontend-ccb
npm install                    # Instalar dependências
npm run dev                    # Iniciar frontend (http://localhost:3000)
```

## Requisitos:

### Obrigatórios
- ~~Autenticação de usuários (método seguro)~~
- ~~CRUD de clientes com taxas de juros individuais~~
- ~~Persistência no banco (PostgreSQL)~~
- ~~Simulação de empréstimo (valor, parcelas, taxa do cliente)~~
- ~~Salvar simulações no banco~~
- ~~Repositório público com README~~
### Opcionais
- ~~Geração da tabela de parcelas~~
- ~~Geração do documento CCB (HTML)~~

---

# CCB System - EN

## Overview
Fullstack CCB (Credit Certificate) system with authentication, customer management, and loan simulation capabilities.

## Tech Stack
- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL (Docker container)
- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Testing**: Jest + React Testing Library
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
.
├── backend-ccb
│   ├── prisma
│   ├── src
│   │   ├── common
│   │   │   ├── decorators
│   │   │   │   ├── public
│   │   │   │   ├── roles
│   │   │   │   └── user
│   │   │   ├── dto
│   │   │   ├── filters
│   │   │   ├── guards
│   │   │   │   ├── jwt
│   │   │   │   └── roles
│   │   │   └── interceptors
│   │   ├── database
│   │   │   └── prisma
│   │   └── modules
│   │       ├── auth
│   │       │   ├── controllers
│   │       │   ├── dto
│   │       │   ├── interfaces
│   │       │   ├── services
│   │       │   └── strategies
│   │       ├── customer
│   │       │   ├── controllers
│   │       │   ├── dto
│   │       │   ├── entities
│   │       │   └── services
│   │       └── simulations
│   │           ├── controllers
│   │           ├── dto
│   │           ├── services
│   │           └── templates
│   └── test
│       └── modules
│           ├── auth
│           ├── customer
│           └── simulations
└── frontend-ccb
    ├── public
    └── src
        ├── app
        │   ├── (auth)
        │   │   ├── login
        │   │   └── signup
        │   └── (dashboard)
        │       ├── customers
        │       │   └── new
        │       └── simulations
        │           ├── [id]
        │           └── new
        ├── components
        │   ├── auth
        │   ├── features
        │   │   ├── customers
        │   │   └── simulations
        │   ├── layout
        │   ├── shared
        │   │   └── form
        │   └── ui
        ├── hooks
        ├── lib
        └── types
```

## Quick Start

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
npm run start:dev              # Start backend (http://localhost:8080)

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
- Generate CCB document (HTML)

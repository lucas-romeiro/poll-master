# Realtime Poll Master API

This project is a backend system for creating and managing realtime
polls. It was built using Clean Architecture and Domain-Driven Design
(DDD) principles.

## 🚀 Features

- Create, edit, delete and list polls
- Filter polls by status
- Unlimited options per poll
- Realtime vote updates (WebSocket)
- Input validation with Zod
- API documentation with Swagger
- Automated tests with Vitest

## 🛠 Tech Stack

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL
- Docker
- Zod
- Swagger
- Jest
- Socket.IO

## 📁 Project Structure

    src/
     ├── domain/
     ├── application/
     ├── infrastructure/
     ├── presentation/
     ├── tests/
     └── main.ts

## 📦 Installation

### Prerequisites

- Node.js \>= 22
- Docker & Docker Compose

### Setup

```bash
git clone <repository-url>
cd poll-master
npm install
```

## 🐳 Run with Docker

```bash
docker-compose up -d
```

## ⚙️ Environment Variables

Create a `.env` file:

    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/polls
    PORT=3000

## 🗄 Database Setup

```bash
npx prisma migrate dev
npx prisma generate
```

## ▶️ Run Project

Development:

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

## 📡 Realtime

This project uses Socket.IO for realtime vote updates.

Clients can listen to:

    vote:update

## 🧪 Tests

Run all tests:

```bash
npm run test
```

## 📌 Business Rules

- A poll must have a question
- A poll must have start and end dates
- A poll must have at least 3 options
- A poll cannot be edited after it starts
  -tatus: not_started, started, running, finished

## 📜 License

This project is open source and available under the **MIT License**. See [LICENSE]('./LICENSE).

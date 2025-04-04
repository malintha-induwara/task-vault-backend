# Task Vault Backend

Task Vault is a robust and secure RESTful API for managing todo tasks with authentication and task management features.

## Features

- **User Authentication System**
  - Register new user accounts
  - Login with JWT-based authentication
  - Token refresh mechanism
  - Secure password reset flow with email verification
  - Password change functionality
- **Todo Management**
  - Create, read, update, and delete todos
  - Mark todos as complete/incomplete
  - Set due dates for todos
  - Sort and filter todos
- **Security Features**
  - Password hashing with bcrypt
  - JWT token authentication
  - Refresh token rotation
  - Request validation with Zod

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (local installation or MongoDB Atlas account)

### Installing

1. Clone the repository

   ```sh
   git clone https://github.com/malintha-induwara/task-vault-backend.git
   cd task-vault-backend
   ```

2. Install dependencies

   ```sh
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   ```sh
   cp .env.example .env
   ```
   Edit the `.env` file and fill in the required values:
   - `DATABASE_URL`: MongoDB connection string
   - `JWT_*_SECRET`: Generate secure random strings for JWT secrets
   - `EMAIL_USER` & `EMAIL_PASS`: Credentials for sending emails

### Configuration

1. Generate Prisma client

   ```sh
   npm run prisma:generate
   # or
   yarn prisma:generate
   ```

2. Setup your MongoDB database
   - Use a local MongoDB instance or create a free MongoDB Atlas cluster
   - Update the `DATABASE_URL` in `.env` file with your connection string

### Running the Application

#### Development mode

```sh
npm run dev
# or
yarn dev
```

#### Production mode

```sh
npm run build
npm start
# or
yarn build
yarn start
```

#### Prisma Studio (Database GUI)

```sh
npm run prisma:studio
# or
yarn prisma:studio
```

## Tech Stack

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Zod](https://img.shields.io/badge/Zod-3068B7?style=for-the-badge&logo=zod&logoColor=white)](https://zod.dev/)
[![Bcrypt](https://img.shields.io/badge/Bcrypt-003A70?style=for-the-badge&logo=lock&logoColor=white)](https://www.npmjs.com/package/bcrypt)

## API Documentation

Detailed API documentation is available through Postman:
[View API Documentation](https://documenter.getpostman.com/view/33030562/2sB2cUAhiN)

## Frontend Repository

The frontend repository for this project can be found here:
[Task Vault Frontend](https://github.com/malintha-induwara/task-vault-frontend)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

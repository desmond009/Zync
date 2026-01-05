# Zync Backend - Real-time Collaborative Task Management SaaS

A production-grade Node.js backend for Zync, a real-time team collaboration platform built with Express, PostgreSQL, Prisma, Socket.io, and JWT authentication.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication with access & refresh tokens
  - HTTP-only cookie storage for enhanced security
  - Email verification system
  - Password reset functionality
  - Role-based access control (OWNER, ADMIN, MEMBER, VIEWER)

- **Real-time Collaboration**
  - Socket.io for real-time updates
  - Live task updates
  - Project chat with typing indicators
  - Online presence tracking
  - Real-time notifications

- **Core Modules**
  - User management with profile customization
  - Team creation and member management
  - Project organization
  - Task management with comments
  - Real-time notifications

- **Security**
  - Helmet.js for security headers
  - Rate limiting on sensitive routes
  - Input validation with Joi
  - CORS protection
  - Password hashing with bcrypt (12 rounds)

- **Production Ready**
  - Structured logging with Winston
  - Error handling with custom error classes
  - Database connection pooling
  - Graceful shutdown handling
  - Environment variable validation with Zod

## 📁 Project Structure

```
Backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.js      # Prisma client singleton
│   │   ├── redis.js         # Redis client configuration
│   │   ├── cloudinary.js    # File upload configuration
│   │   └── env.js           # Environment validation (Zod)
│   ├── middleware/          # Express middleware
│   │   ├── auth.middleware.js
│   │   ├── errorHandler.js
│   │   ├── validation.js
│   │   ├── rateLimiter.js
│   │   └── logger.js
│   ├── modules/             # Feature modules
│   │   ├── auth/
│   │   ├── users/
│   │   ├── teams/
│   │   ├── projects/
│   │   ├── tasks/
│   │   └── notifications/
│   ├── socket/              # Socket.io implementation
│   │   ├── socket.handler.js
│   │   ├── socket.middleware.js
│   │   └── events/
│   ├── utils/               # Utility functions
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   ├── jwt.utils.js
│   │   ├── email.service.js
│   │   └── pagination.js
│   ├── prisma/              # Database
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── app.js               # Express app setup
│   └── server.js            # Server entry point
├── .env.example
├── .gitignore
├── package.json
├── docker-compose.yml
└── README.md
```

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache**: Redis
- **Real-time**: Socket.io
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi & Zod
- **File Upload**: Cloudinary
- **Email**: Nodemailer
- **Logging**: Winston
- **Security**: Helmet, bcrypt, express-rate-limit

## 📦 Installation

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14
- Redis >= 7
- npm >= 9.0.0

### Setup Steps

1. **Clone the repository**
   ```bash
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   - Database credentials
   - JWT secrets (use strong random strings)
   - Email SMTP settings
   - Cloudinary credentials
   - Redis connection details

4. **Start PostgreSQL and Redis** (using Docker)
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

6. **Seed the database** (optional)
   ```bash
   npm run db:seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start at `http://localhost:5000`

## 🔧 Available Scripts

```bash
npm run dev              # Start development server with nodemon
npm start                # Start production server
npm run db:migrate       # Run Prisma migrations
npm run db:generate      # Generate Prisma client
npm run db:seed          # Seed database with demo data
npm run db:studio        # Open Prisma Studio
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run lint             # Lint code
npm run lint:fix         # Lint and fix code
```

## 🔐 Authentication Flow

### Registration
```
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login
```
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

### Refresh Token
```
POST /api/v1/auth/refresh
```

### Verify Email
```
GET /api/v1/auth/verify-email?token=<verification-token>
```

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/verify-email` - Verify email
- `POST /api/v1/auth/resend-verification` - Resend verification email
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/change-password` - Change password
- `GET /api/v1/auth/me` - Get current user

### Users
- `GET /api/v1/users/:userId` - Get user by ID
- `PATCH /api/v1/users/profile` - Update profile
- `DELETE /api/v1/users/account` - Delete account
- `GET /api/v1/users/search` - Search users
- `GET /api/v1/users/teams` - Get user's teams
- `GET /api/v1/users/projects` - Get user's projects
- `GET /api/v1/users/tasks` - Get user's tasks

### Teams
- `POST /api/v1/teams` - Create team
- `GET /api/v1/teams/:teamId` - Get team details
- `PATCH /api/v1/teams/:teamId` - Update team
- `DELETE /api/v1/teams/:teamId` - Delete team
- `POST /api/v1/teams/join` - Join team with invite code
- `POST /api/v1/teams/:teamId/invite` - Invite member
- `PATCH /api/v1/teams/:teamId/members/:memberId` - Update member role
- `DELETE /api/v1/teams/:teamId/members/:memberId` - Remove member
- `POST /api/v1/teams/:teamId/leave` - Leave team
- `POST /api/v1/teams/:teamId/regenerate-invite` - Regenerate invite code

### Projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects/:projectId` - Get project details
- `PATCH /api/v1/projects/:projectId` - Update project
- `DELETE /api/v1/projects/:projectId` - Delete project
- `POST /api/v1/projects/:projectId/members` - Add project member
- `PATCH /api/v1/projects/:projectId/members/:memberId` - Update member role
- `DELETE /api/v1/projects/:projectId/members/:memberId` - Remove member
- `GET /api/v1/projects/:projectId/messages` - Get project messages

### Tasks
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks/:taskId` - Get task details
- `PATCH /api/v1/tasks/:taskId` - Update task
- `DELETE /api/v1/tasks/:taskId` - Delete task
- `POST /api/v1/tasks/:taskId/comments` - Add comment
- `PATCH /api/v1/tasks/:taskId/comments/:commentId` - Update comment
- `DELETE /api/v1/tasks/:taskId/comments/:commentId` - Delete comment

### Notifications
- `GET /api/v1/notifications` - Get user notifications
- `GET /api/v1/notifications/unread-count` - Get unread count
- `PATCH /api/v1/notifications/:notificationId/read` - Mark as read
- `PATCH /api/v1/notifications/read-all` - Mark all as read
- `DELETE /api/v1/notifications/:notificationId` - Delete notification

## 🔌 Socket.io Events

### Connection
```javascript
socket.emit('project:join', projectId)
socket.emit('project:leave', projectId)
socket.emit('task:join', taskId)
socket.emit('task:leave', taskId)
```

### Tasks
```javascript
socket.on('task:created', (data) => {})
socket.on('task:updated', (data) => {})
socket.on('task:deleted', (data) => {})
socket.on('task:assigned', (data) => {})
socket.on('comment:added', (data) => {})
```

### Chat
```javascript
socket.emit('chat:message', { projectId, content })
socket.emit('chat:typing', { projectId, isTyping })
socket.emit('chat:read', { messageId })

socket.on('chat:message', (message) => {})
socket.on('chat:typing', (data) => {})
socket.on('chat:read', (data) => {})
```

### Presence
```javascript
socket.emit('presence:online')
socket.emit('presence:get', projectId)

socket.on('presence:online', (user) => {})
socket.on('presence:offline', (user) => {})
socket.on('presence:list', (data) => {})
```

### Notifications
```javascript
socket.emit('notification:join')
socket.on('notification:new', (notification) => {})
```

## 🗄️ Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User** - User accounts with authentication
- **Team** - Team workspaces
- **TeamMember** - Team membership with roles
- **Project** - Projects within teams
- **ProjectMember** - Project membership with roles
- **Task** - Individual tasks with status tracking
- **Comment** - Task comments
- **Message** - Project chat messages
- **MessageReadReceipt** - Message read tracking
- **Notification** - User notifications

See [src/prisma/schema.prisma](src/prisma/schema.prisma) for complete schema.

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with 12 rounds
- **HTTP-Only Cookies**: Protection against XSS
- **CORS**: Configured for specific frontend origin
- **Helmet**: Security headers
- **Rate Limiting**: Protection against brute force
- **Input Validation**: Joi validation on all inputs
- **SQL Injection Protection**: Prisma ORM parameterized queries

## 📝 Environment Variables

See [.env.example](.env.example) for all required environment variables:

- Server configuration (PORT, NODE_ENV)
- Database URL
- JWT secrets and expiry times
- Redis configuration
- Cloudinary credentials
- SMTP email settings
- Frontend URL for CORS
- Rate limiting settings

## 🐳 Docker Support

Start PostgreSQL and Redis with Docker Compose:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379

## 📊 Logging

Winston is configured for structured logging:
- Daily rotating log files
- Separate error logs
- Console logging in development
- Production-ready log levels

Logs are stored in the `logs/` directory.

## 🧪 Testing

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

## 🚀 Deployment

1. Set `NODE_ENV=production` in environment
2. Ensure all production environment variables are set
3. Run database migrations on production database
4. Build and deploy the application
5. Set up process manager (PM2, systemd)
6. Configure reverse proxy (nginx, Apache)
7. Set up SSL/TLS certificates

## 📄 License

MIT License

## 👥 Support

For issues and questions, please open an issue on the repository.

---

Built with ❤️ using the PERN stack

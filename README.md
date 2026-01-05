# Zync - Real-Time Team Collaboration Platform

A production-grade, full-stack SaaS platform for seamless team collaboration, real-time task management, and project organization. Built with modern web technologies for performance, scalability, and exceptional user experience.

![Zync Banner](https://via.placeholder.com/1200x400?text=Zync+Real-Time+Collaboration)

## 🌟 Features

### Core Features
- **Real-Time Collaboration**: Instant updates across all team members using Socket.io
- **Smart Task Management**: Kanban boards, task assignments, priorities, and due dates
- **Team Chat**: In-app messaging with typing indicators and message history
- **Project Organization**: Create, manage, and organize multiple projects
- **Role-Based Access Control**: Admin, Manager, and Member roles with granular permissions
- **File Sharing**: Upload and share files within projects and tasks
- **Activity Tracking**: Complete audit trail of all team actions
- **Team Management**: Invite members, set roles, and manage permissions

### User Experience
- **Modern Design System**: Glassmorphism, gradient overlays, and smooth animations
- **Responsive UI**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Support**: Built-in dark/light theme switching
- **Command Palette**: Quick access with ⌘K (Cmd+K) keyboard shortcut
- **Smooth Animations**: 60fps animations powered by Framer Motion
- **Real-Time Notifications**: Stay updated with push notifications

### Landing Page
- **Conversion-Optimized**: High-converting SaaS landing page with 10+ sections
- **Social Proof**: Testimonials, trust badges, and customer logos
- **Feature Showcase**: Interactive product demonstrations
- **Pricing Tiers**: Free, Pro, and Enterprise plans
- **Scroll Animations**: Parallax effects and scroll-triggered reveals
- **Mobile-First**: Fully responsive design with touch-optimized interactions

## 🏗️ Architecture

```
Zync/
├── Backend/          # Node.js/Express API server
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── models/   # Prisma schema & database models
│   │   ├── middleware/ # Auth, validation, error handling
│   │   ├── services/ # Business logic
│   │   ├── socket/   # Socket.io real-time events
│   │   └── utils/    # Helper functions
│   ├── prisma/       # Database migrations & schema
│   └── .env          # Environment variables
│
└── Frontend/         # React/Vite application
    ├── src/
    │   ├── pages/    # Page components
    │   ├── components/ # Reusable UI components
    │   ├── layouts/  # Layout wrappers
    │   ├── store/    # Zustand state management
    │   ├── services/ # API & Socket.io services
    │   ├── hooks/    # Custom React hooks
    │   └── styles/   # Global styles
    ├── public/       # Static assets
    └── .env          # Environment variables
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **Database**: PostgreSQL 16
- **ORM**: Prisma 5.9
- **Real-Time**: Socket.io 4.6
- **Cache**: Redis 7
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer
- **Validation**: Joi

### Frontend
- **Framework**: React 18.2
- **Build Tool**: Vite 5.0
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion 10.18
- **State Management**: Zustand 4.4
- **Routing**: React Router 6.21
- **HTTP Client**: Axios
- **Real-Time**: Socket.io Client
- **UI Components**: Custom + Headless UI
- **Icons**: React Icons
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Date Handling**: Day.js

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL 14+
- Redis 6+
- Git

### Backend Setup

1. **Navigate to Backend directory**
   ```bash
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following in `.env`:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/zync
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   ```

4. **Setup database**
   ```bash
   # Create database
   npx prisma migrate dev --name init
   
   # Seed initial data (optional)
   npm run seed
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```
   
   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to Frontend directory**
   ```bash
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following in `.env`:
   ```
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Application will run on `http://localhost:5173`

## 📂 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user

### Teams
- `GET /api/teams` - Get user's teams
- `POST /api/teams` - Create new team
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `POST /api/teams/:id/members` - Add member to team
- `DELETE /api/teams/:id/members/:memberId` - Remove member

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/tasks` - Get project tasks

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/:id/status` - Update task status
- `PUT /api/tasks/:id/assign` - Assign task to user

### Chat
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message
- `GET /api/messages/:channelId` - Get channel messages

## 🔌 Socket.io Events

### Real-Time Events
- `task:create` - Task created
- `task:update` - Task updated
- `task:delete` - Task deleted
- `message:send` - Message sent
- `user:online` - User came online
- `user:offline` - User went offline
- `notification:new` - New notification
- `project:update` - Project updated
- `team:member:add` - Member added to team
- `team:member:remove` - Member removed from team

## 🎨 Design System

### Color Palette
- **Primary**: Indigo 600 (#4F46E5)
- **Secondary**: Purple 500 (#A855F7)
- **Accent**: Cyan 500 (#06B6D4)
- **Background**: Slate 50 (#F8FAFC)
- **Text**: Slate 900 (#0F172A)

### Typography
- **Headings**: Poppins (Bold)
- **Body**: Inter (Regular)
- **Code**: JetBrains Mono (Regular)

### Components
- Custom form inputs with validation
- Modal dialogs with animations
- Toast notifications
- Cards with glassmorphism effect
- Buttons with multiple variants
- Loading states and skeletons
- Data tables with sorting/filtering

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **CORS**: Configured for production domains
- **Rate Limiting**: Prevent abuse and brute force attacks
- **Input Validation**: Server-side validation with Joi
- **SQL Injection Prevention**: Parameterized queries with Prisma
- **XSS Protection**: React's built-in XSS protection
- **HTTPS Ready**: TLS/SSL certificate support
- **Environment Variables**: Sensitive data in .env files
- **Role-Based Access Control**: Permission-based endpoints

## 📊 Database Schema

### Key Models
- **User**: Authentication and profile
- **Team**: Organization entity
- **Project**: Project management
- **Task**: Task items with status tracking
- **Comment**: Task comments and discussions
- **Message**: Team chat messages
- **File**: File storage and sharing
- **Activity**: Audit trail of all actions
- **Notification**: User notifications

## 🚢 Deployment

### Backend Deployment (Heroku/Railway)
1. Create database on cloud provider
2. Set environment variables
3. Deploy using `git push`
4. Run migrations: `prisma migrate deploy`

### Frontend Deployment (Vercel/Netlify)
1. Connect GitHub repository
2. Set environment variables
3. Trigger deployment
4. Configure custom domain

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 639px
- **Tablet**: 640px - 1023px
- **Desktop**: 1024px+
- **4K**: 1920px+

## 🎯 Performance Metrics

- **Lighthouse Score**: 90+
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Bundle Size**: < 200KB (gzipped)
- **Animation Frame Rate**: 60 FPS

## 📝 Development Scripts

### Backend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run migrate  # Run database migrations
npm run seed     # Seed initial data
npm test         # Run tests
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm test         # Run tests
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 5000 or 5173
lsof -ti:5000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Reset database
npx prisma db push --force-reset
```

### Socket.io Connection Failed
- Ensure backend server is running on correct port
- Check CORS settings in backend
- Verify Socket.io URL in frontend .env

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
```

## 📚 Documentation

- [API Documentation](./Backend/API.md) - Detailed API endpoints
- [Database Schema](./Backend/DATABASE.md) - Database design
- [Component Library](./Frontend/COMPONENTS.md) - UI components
- [Contributing Guidelines](./CONTRIBUTING.md) - How to contribute

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙋 Support

Need help? Here are some resources:

- 📧 Email: support@zync.app
- 💬 Discord: [Join our community](https://discord.gg/zync)
- 📖 Documentation: [docs.zync.app](https://docs.zync.app)
- 🐛 Issues: [GitHub Issues](https://github.com/zync/app/issues)

## 👥 Team

- **Vijender** - Full-Stack Developer

## 🙏 Acknowledgments

- Built with ❤️ using modern web technologies
- Special thanks to all contributors
- Inspired by industry-leading collaboration tools

---

**Zync** - Transform Team Collaboration ✨

Made with ❤️ for teams that want to work better together.

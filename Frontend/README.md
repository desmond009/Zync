# Zync Frontend

Modern, production-grade React frontend for Zync - a real-time team collaboration platform.

## 🚀 Features

- **Modern Design System**: Glassmorphism effects, gradient color schemes, smooth animations
- **Real-time Collaboration**: Socket.io integration for live updates
- **Responsive Layout**: Mobile-first design with Tailwind CSS
- **Advanced Animations**: Framer Motion for 60fps animations
- **Command Palette**: Quick navigation with ⌘K
- **State Management**: Zustand for efficient state handling
- **Type-safe API**: Axios with interceptors for token refresh

## 🛠️ Tech Stack

- React 18.2
- Vite 5.0
- Tailwind CSS 3.4
- Framer Motion 10.18
- Socket.io Client 4.6
- Zustand 4.4
- React Router DOM 6.21
- Axios 1.6
- React Hot Toast 2.4
- Canvas Confetti 1.9

## 📦 Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

## 🎨 Design System

### Color Palette
- Primary: Indigo-600 to Purple-500 gradient
- Secondary: Cyan-500
- Accent: Amber-400
- Neutral: Slate-50 to Slate-900

### Typography
- **Body & Headings**: Inter (400-800)
- **Display**: Poppins (600-700)
- **Code**: JetBrains Mono (400-600)

### Animations
- Page transitions: 0.3s slide + fade
- Card hover: scale(1.02) + shadow-2xl
- Spring animations: stiffness 300, damping 30

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📁 Project Structure

```
Frontend/
├── src/
│   ├── components/      # Reusable components
│   │   ├── ui/         # Design system components
│   │   └── ...
│   ├── layouts/        # Layout components
│   ├── pages/          # Page components
│   │   ├── auth/       # Authentication pages
│   │   └── ...
│   ├── services/       # API and Socket services
│   ├── store/          # Zustand stores
│   ├── lib/            # Utilities
│   ├── App.jsx         # Root component
│   └── main.jsx        # Entry point
├── public/             # Static assets
└── index.html          # HTML template
```

## 🎯 Key Features

### Glassmorphism Effects
```jsx
<div className="glass rounded-2xl p-6">
  {/* Content with backdrop blur */}
</div>
```

### Gradient Text
```jsx
<h1 className="gradient-text">
  Beautiful Gradient
</h1>
```

### Animated Cards
```jsx
<Card gradient hoverable>
  {/* Card with hover effects */}
</Card>
```

### Command Palette
Press `⌘K` (Mac) or `Ctrl+K` (Windows) to open quick navigation

## 🔐 Authentication

The app uses JWT-based authentication with automatic token refresh:

1. Login/Register pages
2. Protected routes with automatic redirect
3. Token refresh on 401 errors
4. Persistent sessions with localStorage

## 🌐 Real-time Features

Socket.io integration for:
- Live task updates
- Real-time chat
- Presence indicators
- Typing indicators
- Cursor tracking
- Push notifications

## 📱 Responsive Design

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🎨 Custom Utilities

- `.glass`: Glassmorphism effect
- `.gradient-text`: Gradient text color
- `.shimmer`: Animated shimmer effect
- `.gradient-bg`: Animated gradient background
- `.skeleton`: Loading skeleton

## 🚀 Performance

- Code splitting with React.lazy
- Image optimization
- CSS purging in production
- Tree shaking
- Minification

## 🔧 Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
```

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

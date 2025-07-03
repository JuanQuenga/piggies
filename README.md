# Snouts 🐷

A modern location-based social networking app built with Next.js 15, featuring real-time messaging, user discovery, and interactive maps.

## ✨ Features

### 🔐 Authentication

- **Clerk Authentication** with multiple sign-in methods
- Secure JWT-based authentication with Convex backend
- Protected routes and user session management

### 🗺️ Interactive Map

- **Leaflet.js** integration with real-time location tracking
- Dark/light theme support for map tiles
- User location visualization
- Responsive map interface

### 👥 Social Features

- **Real-time messaging** with Convex
- **User discovery** based on proximity
- **Profile management** with customizable avatars
- **People nearby** view with distance calculations

### 🎨 Modern UI/UX

- **Tailwind CSS 4** with modern design system
- **Radix UI** components for accessibility
- **Responsive design** optimized for mobile and desktop
- **Dark/light theme** support throughout the app

### ⚡ Real-time Features

- **Convex backend** for real-time data synchronization
- Live messaging with instant updates
- Real-time user presence and location updates

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4, Radix UI
- **Backend**: Convex (database, real-time, authentication)
- **Authentication**: Clerk
- **Maps**: Leaflet.js, React-Leaflet
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📱 Pages & Features

- **`/`** - Landing page with authentication
- **`/map`** - Interactive map with user locations
- **`/people`** - Discover people nearby
- **`/profile`** - Edit your profile and view others
- **`/chat`** - Real-time messaging interface
- **`/user/[userId]`** - Individual user profiles
- **`/settings`** - App settings and preferences

## 🛠️ Getting Started

### Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Clerk account** ([sign up here](https://clerk.com))
4. **Convex account** ([sign up here](https://convex.dev))

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd piggies
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the project root:

   ```env
   # Convex
   NEXT_PUBLIC_CONVEX_URL=your_convex_url_here

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   CLERK_FRONTEND_API_URL=your_clerk_frontend_api_url_here

   # Weather API (optional)
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here
   ```

4. **Configure Clerk Authentication**

   Follow the detailed setup guide in [SETUP.md](./SETUP.md) to configure Clerk with Convex.

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable                            | Description                                | Required |
| ----------------------------------- | ------------------------------------------ | -------- |
| `NEXT_PUBLIC_CONVEX_URL`            | Your Convex deployment URL                 | ✅       |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key                      | ✅       |
| `CLERK_FRONTEND_API_URL`            | Clerk frontend API URL                     | ✅       |
| `NEXT_PUBLIC_OPENWEATHER_API_KEY`   | OpenWeatherMap API key for weather feature | ❌       |

## 🏗️ Project Structure

```
piggies/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── chat/              # Messaging interface
│   ├── map/               # Interactive map
│   ├── people/            # User discovery
│   ├── profile/           # Profile management
│   └── user/              # Individual user pages
├── components/            # Reusable UI components
│   ├── common/           # Layout and navigation
│   └── ui/               # Radix UI components
├── convex/               # Convex backend functions
│   ├── auth.config.ts    # Authentication configuration
│   ├── messages.ts       # Messaging functions
│   ├── profiles.ts       # User profile functions
│   └── schema.ts         # Database schema
├── lib/                  # Utility functions
└── types/                # TypeScript type definitions
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Development Patterns

1. **Authentication**: All pages are protected by `AppAuthGate`
2. **Real-time**: Use Convex hooks (`useQuery`, `useMutation`) for data
3. **Maps**: Client-side rendering with proper SSR handling
4. **Styling**: Tailwind CSS with component variants

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🎮 Planned Features

### XP & Gamification System

- **Experience Points**: Users earn XP through interactions
- **Unlockable Features**: Use XP to unlock premium features
- **Achievements**: Complete challenges and milestones
- **Leaderboards**: Compare with other users

### Advanced Features

- **Group Chats**: Multi-user conversations
- **Event Planning**: Create and join local events
- **Photo Sharing**: Share moments with nearby users
- **Custom Filters**: Advanced people discovery options

### Global Search Bar

- **Spotlight/Raycast-like Functionality**: A floating search bar at the top of the page, under the header.
- **Search Through Chats**: Quickly find conversations and messages.
- **Example Query**: "Find guys near Detroit, Michigan online now that are hosting."
- **Profile Management**: Change profile picture directly from the search bar.
- **Help and Support**: Access help resources and support options.

This feature aims to enhance user experience by providing quick access to various functionalities through a centralized search interface.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check [SETUP.md](./SETUP.md) for detailed setup instructions
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join the conversation in GitHub Discussions

---

Built with ❤️ using Next.js, Convex, and Clerk

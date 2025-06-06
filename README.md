# LearnSpark - Gamified Learning Platform

Welcome to LearnSpark! 🚀 A gamified learning platform that makes coding, AI, and chess education engaging through interactive challenges, achievements, and progress tracking.

## Features

✨ **Gamification System**
- XP and leveling system
- Achievement badges
- Learning streaks
- Progress tracking

🎮 **Interactive Learning**
- Code editor with real-time feedback
- Multiple learning modules (Code Kingdom, AI Citadel, Chess Arena)
- Hands-on exercises and challenges

🔐 **User Management**
- Secure authentication with NextAuth v5
- User profiles and progress persistence
- Protected routes and dashboard

📊 **Progress Analytics**
- Detailed statistics and insights
- Recent activity tracking
- Achievement showcase

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: NextAuth v5
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **Animations**: Framer Motion
- **Language**: TypeScript

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd learnspark
npm install
```

### 2. Environment Setup

Copy the environment template:

```bash
cp .env.example .env.local
```

Fill in your environment variables in `.env.local`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/learnspark"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-here-make-it-long-and-random"
NEXTAUTH_URL="http://localhost:3000"

# Development
NODE_ENV="development"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed the database with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application!

## Project Structure

```
learnspark/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── learn/             # Learning modules
│   └── page.tsx           # Landing page
├── components/            # Reusable components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard components
│   ├── gamification/      # Gamification components
│   ├── learn/             # Learning components
│   ├── navigation/        # Navigation components
│   └── ui/                # Base UI components
├── lib/                   # Utility libraries
├── prisma/                # Database schema and seeds
└── types/                 # TypeScript type definitions
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push database schema
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
npm run type-check   # Run TypeScript type checking
```

## Learning Modules

### 🏰 Code Kingdom
Learn programming fundamentals through interactive Python and JavaScript exercises:
- Variables and Data Types
- Functions and Scope
- Loops and Control Flow
- Object-Oriented Programming

### 🧠 AI Citadel  
Explore artificial intelligence and machine learning:
- Introduction to AI
- Neural Networks Basics
- Machine Learning Algorithms
- AI Ethics and Responsibility

### ♟️ Chess Arena
Develop strategic thinking through chess:
- Chess Basics and Piece Movement
- Opening Principles
- Tactical Patterns
- Endgame Strategies

## Gamification Features

### XP and Leveling
- Earn XP by completing lessons and challenges
- Level up to unlock new content and features
- Bonus XP for perfect scores and fewer attempts

### Achievements
- Unlock badges for various accomplishments
- Track progress toward upcoming achievements
- Special rewards for streaks and milestones

### Progress Tracking
- Visual progress bars for each module
- Detailed statistics and analytics
- Recent activity feed

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### User Progress
- `GET /api/user/progress` - Get user's learning progress
- `POST /api/user/progress` - Update lesson progress

### Lessons
- `GET /api/lessons` - Get all lessons or by module
- `GET /api/lessons/[lessonId]` - Get specific lesson

## Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: User accounts with XP and level tracking
- **Lessons**: Learning content organized by modules
- **UserProgress**: Individual progress on lessons
- **Achievements**: Unlockable badges and rewards
- **UserAchievements**: Junction table for earned achievements

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Tips

### Adding New Lessons

1. Create lesson content in the database (via seed or admin interface)
2. Update the lesson component to handle new lesson types
3. Add any new test cases or validation logic

### Creating New Achievements

1. Add achievement definition to the database
2. Update the achievement checking logic in the progress API
3. Create appropriate achievement criteria and rewards

### Extending Gamification

The gamification system is modular and can be extended with:
- New XP calculation formulas
- Additional achievement types
- Custom progress tracking metrics
- Social features like leaderboards

### Code Editor Enhancements

The code editor can be enhanced with:
- More programming languages
- Advanced syntax highlighting
- Code completion and hints
- Integration with external code execution services

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the application: `npm run build`
2. Set up production database
3. Configure environment variables
4. Start the production server: `npm start`

## Security Considerations

- All routes are protected with NextAuth middleware
- User input is validated with Zod schemas
- Database queries use Prisma for SQL injection protection
- Passwords are hashed with bcrypt
- CSRF protection is enabled by default

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support, please open an issue on GitHub or contact the development team.

---

Happy learning! 🎓✨
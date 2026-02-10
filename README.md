# Web3 KOL Twitter Account Generator

AI-powered platform for generating authentic Web3 content in the style of top KOLs (Key Opinion Leaders).

## Features

- **AI Tweet Generator**: Generate tweets in the style of specific Web3 KOLs
  - Multiple tweet types: alpha, analysis, hype, educational, meme
  - Thread generation support (2-3 or 5-10 tweets)
  - Style mixing from multiple KOLs
  - Korean to English translation
  - Tweet scheduling and A/B testing

- **AI Image Generator**: Create custom images with KOL visual styles
  - Project image upload and processing
  - Multiple format support (profile banner, tweet image, promotional)
  - Template library
  - Batch generation
  - GIF/animation support

- **Analytics Dashboard**: Track engagement and performance
  - Tweet performance metrics
  - A/B test results
  - Engagement trends
  - Export reports

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand
- **Language**: TypeScript

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: PostgreSQL (primary), Redis (cache)
- **Language**: TypeScript

### AI/ML
- **Text Generation**: Claude API (Anthropic), GPT-4 API (OpenAI)
- **Image Generation**: DALL-E 3
- **Twitter Integration**: Twitter API v2

## Project Structure

```
kol/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express.js backend
├── packages/
│   ├── shared-types/      # Shared TypeScript types
│   ├── shared-utils/      # Shared utilities
│   ├── shared-constants/  # Shared constants
│   └── eslint-config/     # Shared ESLint config
└── scripts/              # Development scripts
```

## Getting Started

### Prerequisites

- Node.js 20+ (use nvm: `nvm use`)
- Yarn 4.1.0+
- PostgreSQL 14+
- Redis 7+

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kol
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
# Frontend
cp apps/web/.env.local.example apps/web/.env.local

# Backend
cp apps/api/.env.example apps/api/.env
```

4. Run database migrations:
```bash
cd apps/api
yarn migrate
```

5. Start development servers:
```bash
# From root directory
yarn dev

# Or run individually
yarn dev:web  # Frontend on http://localhost:3000
yarn dev:api  # Backend on http://localhost:8000
```

## Development

### Available Scripts

- `yarn dev` - Run both frontend and backend in development mode
- `yarn build` - Build all packages
- `yarn lint` - Lint all packages
- `yarn type-check` - Type check all packages
- `yarn test` - Run tests across all packages

### Monorepo Structure

This project uses Yarn Workspaces for managing the monorepo:

- `apps/web` - Next.js frontend application
- `apps/api` - Express.js backend API
- `packages/*` - Shared packages used across apps

## Environment Variables

### Frontend (`apps/web/.env.local`)
- `NEXT_PUBLIC_APP_URL` - Frontend URL
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXTAUTH_URL` - NextAuth.js URL
- `NEXTAUTH_SECRET` - NextAuth.js secret

### Backend (`apps/api/.env`)
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret
- `ANTHROPIC_API_KEY` - Claude API key
- `OPENAI_API_KEY` - OpenAI API key
- `TWITTER_API_KEY` - Twitter API credentials
- `AWS_ACCESS_KEY_ID` - AWS credentials for S3
- `STRIPE_SECRET_KEY` - Stripe payment key

## Deployment

### Frontend (Vercel)
The frontend is optimized for deployment on Vercel:
```bash
cd apps/web
yarn build
```

### Backend (Railway/Render)
The backend can be deployed to Railway or Render:
```bash
cd apps/api
yarn build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For support, please contact the development team or open an issue in the repository.

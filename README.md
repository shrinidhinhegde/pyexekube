# PyExeKube - change

A containerized Python execution platform built with Next.js, Prisma, AWS Cognito, and Kubernetes. PyExeKube provides a web interface for writing, executing, and managing Python code in a scalable cloud environment.

## 🚀 Features

- **Code Editor**: Write and edit Python code with syntax highlighting
- **File Management**: Upload ZIP files and manage your project assets
- **Execution History**: Track and review your code execution results
- **Real-time Logs**: Monitor execution progress with live log streaming
- **User Authentication**: Secure user management with AWS Cognito
- **Containerized Execution**: Run Python code in isolated Kubernetes containers

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes with Prisma ORM
- **Database**: PostgreSQL with Prisma migrations
- **Authentication**: AWS Cognito integration
- **File Storage**: AWS S3 with CloudFront CDN
- **Compute**: Kubernetes Jobs for code execution
- **Deployment**: AWS EKS + Amplify

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database
- AWS Account with Cognito, S3, and EKS access
- Docker (for local development)
- kubectl (for Kubernetes management)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/pyexekube.git
cd pyexekube
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Configuration

Create the required environment files:

#### `.env` (Prisma Database)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/pyexekube"

```

#### `.env.local` (Next.js Application)
```env
# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# AWS Cognito
COGNITO_CLIENT_ID="your-cognito-client-id"
COGNITO_CLIENT_SECRET="your-cognito-client-secret"
COGNITO_ISSUER="https://cognito-idp.us-east-2.amazonaws.com/us-east-2_XXXXXXXXX"
COGNITO_USER_POOL_ID="us-east-2_XXXXXXXXX"

# AWS Services
AWS_REGION="us-east-2"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"

# S3 Storage
S3_BUCKET_NAME="pyexekube"
CLOUDFRONT_DOMAIN="your-cloudfront-domain.cloudfront.net"
CLOUDFRONT_KEY_PAIR_ID="your-cloudfront-key-pair-id"
CLOUDFRONT_PRIVATE_KEY="your-cloudfront-private-key"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed the database
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate   # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio

# Testing
npm test              # Run all tests
npm run test:watch    # Run in watch mode
npm run test:coverage # Run with coverage
npm run test:ci       # Run tests for CI/CD
```

## 🚀 CI/CD Pipeline

This project includes GitHub Actions workflows for automated testing:

### Workflows:
- **`.github/workflows/ci.yml`** - Test and build pipeline
- **`.github/workflows/test.yml`** - Test-only workflow for pull requests

### Features:
- ✅ **Automated testing** on every push to main
- ✅ **Linting** with ESLint
- ✅ **Type checking** with TypeScript
- ✅ **Build verification** for production
- ✅ **Coverage reporting** with Codecov
- ✅ **PR comments** with test results

### Triggers:
- Push to `main` branch
- Pull requests to `main` branch

## 📊 Test Coverage

- **68 tests** across **7 test suites**
- **API routes**: Business logic and validation
- **Components**: User interactions and rendering
- **Services**: Database operations and error handling
- **Utilities**: Helper functions and mock data

Built with ❤️ by the PyExeKube Team
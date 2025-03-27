# Sotaque Brasileiro 🇧🇷

[![Next.js](https://img.shields.io/badge/Next.js-15.2.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.5.0-2D3748?logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-2.x-3ECF8E?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Sotaque Brasileiro is a SaaS platform that connects students worldwide with native Brazilian Portuguese instructors through personalized, culturally immersive online classes. Our platform focuses on authentic language learning experiences tailored to individual goals and schedules.

## ✨ Key Features

- 🎯 **Personalized Learning Paths**
  - Custom curriculum based on proficiency level
  - Goal-oriented lesson planning
  - Progress tracking and assessments

- 👩‍🏫 **Expert Brazilian Instructors**
  - Native speakers from various regions
  - Certified language teachers
  - Cultural immersion focus

- 🌍 **Global Accessibility**
  - Multi-language interface (EN, PT-BR, ES, FR)
  - Flexible scheduling across time zones
  - Browser-based platform

- 💳 **Smart Payments & Subscriptions**
  - Secure payment processing
  - Flexible subscription plans
  - Automated billing management

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15.2.2
- **Language:** TypeScript 5.8.2
- **Styling:** Tailwind CSS 3.4.17
- **Components:** shadcn/ui
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **Icons:** Phosphor Icons

### Backend
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Prisma 6.5.0
- **Auth:** NextAuth.js + Supabase Auth
- **API:** Next.js API Routes
- **File Storage:** Supabase Storage

### Infrastructure
- **Hosting:** Vercel
- **Database:** Supabase
- **Payments:** Stripe
- **Emails:** Resend
- **Media:** Supabase Storage
- **Monitoring:** Vercel Analytics

## 🚀 Getting Started

### Prerequisites

```bash
node >= 18.0.0
pnpm >= 8.0.0
docker >= 24.0.0 (optional)
```

### Development Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/diegodscamara/sotaque-brasileiro.git
   cd sotaque-brasileiro
   pnpm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Configure your environment variables
   ```

3. **Database Setup**
   ```bash
   pnpm db:push  # Apply database schema
   pnpm db:seed  # (Optional) Seed initial data
   ```

4. **Start Development Server**
   ```bash
   pnpm dev
   ```

   Visit [http://localhost:3000](http://localhost:3000)

### Environment Variables

Required environment variables:

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-publishable-key

# Email
RESEND_API_KEY=your-resend-key
```

## 🧪 Quality Assurance

```bash
# TypeScript
pnpm type-check

# Linting
pnpm lint

# Testing
pnpm test
pnpm test:e2e

# Format code
pnpm format
```

## 📦 Production

```bash
# Build
pnpm build

# Start production server
pnpm start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

Diego Câmara - [@diegodscamara](https://twitter.com/diegodscamara) - diegodscamara@gmail.com

Project Link: [https://github.com/diegodscamara/sotaque-brasileiro](https://github.com/diegodscamara/sotaque-brasileiro)

# Sotaque Brasileiro

![Sotaque Brasileiro](public/logo.png)

Sotaque Brasileiro is an online Portuguese school that offers personalized, culturally immersive classes with native Brazilian instructors, tailored to individual schedules and learning goals.

## 🌟 Features

- **Personalized Learning**: Custom learning plans based on individual goals and proficiency levels
- **Native Brazilian Instructors**: Learn authentic Brazilian Portuguese from native speakers
- **Flexible Scheduling**: Book classes that fit your schedule
- **Multi-platform Support**: Access your classes from any device
- **Internationalization**: Available in multiple languages (English, Portuguese, Spanish, French)
- **Secure Authentication**: User authentication with email and social login options
- **Subscription Management**: Various subscription plans to meet different learning needs

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Backend as a Service**: [Supabase](https://supabase.com/)
- **Payment Processing**: [Stripe](https://stripe.com/)
- **Email Service**: [Resend](https://resend.com/)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/)
- **Icons**: [Phosphor Icons](https://phosphoricons.com/)
- **Containerization**: [Docker](https://www.docker.com/)

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (v8 or higher)
- [Docker](https://www.docker.com/) (optional, for containerized development)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for local development)

### Local Development

1. **Clone the repository**

```bash
git clone https://github.com/diegodscamara/sotaque-brasileiro.git
cd sotaque-brasileiro
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

```bash
# Copy the example environment file
cp .env.example .env.development

# Edit the file with your configuration
nano .env.development

# Use the environment manager to set up your environment
pnpm env-manager use development
```

4. **Start Supabase locally**

```bash
pnpm db-start
```

5. **Start the development server**

```bash
pnpm dev
```

6. **Open your browser**

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Docker Development

1. **Set up environment variables**

```bash
# Generate Docker environment files from your local environment
pnpm docker-env-setup development
```

2. **Build and start the Docker containers**

```bash
./docker-helper.sh build-dev
./docker-helper.sh start-dev
```

3. **Open your browser**

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🌐 Environment Management

This project uses environment-specific configuration files to manage different environments:

- **Development**: `.env.development` → `.env.docker.development`
- **Staging**: `.env.staging` → `.env.docker.staging`
- **Production**: `.env.production` → `.env.docker.production`

### Environment Manager

Use the environment manager to switch between environments:

```bash
# Use development environment
pnpm env-manager use development

# Use staging environment
pnpm env-manager use staging

# Use production environment
pnpm env-manager use production

# Create a new environment based on an existing one
pnpm env-manager create testing development
```

### Docker Environment Setup

For Docker-based development, use the Docker environment setup script:

```bash
# Generate Docker environment files
node scripts/docker-env-setup.js development
# or
./docker-helper.sh setup-env development
```

## 📚 Documentation

- [Docker Setup](DOCKER.md) - Detailed information about the Docker setup
- [Scripts](scripts/README.md) - Documentation for utility scripts

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run linting
pnpm lint
```

## 🚢 Deployment

### Production Build

```bash
# Build the application
pnpm build

# Start the production server
pnpm start
```

### Docker Production Deployment

```bash
# Set up production environment
./docker-helper.sh setup-env production

# Build and start production containers
./docker-helper.sh build
./docker-helper.sh start
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contact

For support or inquiries, please contact [diegodscamara@gmail.com](mailto:diegodscamara@gmail.com).

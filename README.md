# AuthPilot

A modern CLI tool to bootstrap authentication into your Next.js applications — **fast**, **secure**, and **configurable**.

AuthPilot handles your Prisma setup, NextAuth configuration, environment variables, and even dashboard scaffolding — all with a single command.

[![npm version](https://badge.fury.io/js/next-theme-toggle.svg)](https://badge.fury.io/js/next-theme-toggle)

## Features

- **Next.js project support** – Supports Next.js 16
- **One-command setup** – Initialize complete authentication with a single `npx authpilot init`.
- **Database-ready** – Instantly connects and configures PostgreSQL via Prisma.
- **NextAuth v5 integration** – Automatically installs and configures NextAuth (beta) with Prisma adapter.
- **Multi-provider support** – Choose from Google, GitHub, Discord, LinkedIn, Twitter, and more.
- **Auto environment setup** – Updates your `.env` file with required variables during setup.
- **File scaffolding** – Generates all necessary auth files (`auth.config.ts`, `middleware.ts`, API routes, hooks, etc.).
- **TypeScript first** – All generated files come with full TypeScript support.
- **Safe regeneration** – Re-run `authpilot init` anytime without breaking existing configs.
- **Production ready** – Creates a fully functional authentication system out of the box.


## Quick Start

### Prerequisites

- Node.js 18+
- Next.js 16 project in typescript (Works seamlessly with both **App Router** and **src directory** structures)
- npm, yarn, or pnpm

### Dependencies

AuthPilot automatically installs and configures the following core dependencies during setup:

- **`prisma`** – ORM for defining and managing your database schema.  
- **`@prisma/client`** – Auto-generated Prisma client for database queries.  
- **`next-auth@beta`** – Authentication library for Next.js (v5 beta).  
- **`@auth/prisma-adapter`** – Prisma adapter for integrating NextAuth with your database.
- **`lucide-react`** – Modern React icon library used in the generated Dashboard UI.

### Step-by-Step Guide

◆ **In the root of you Next.js project execute this**
```bash
# Using npm
npx authpilot init

# Using pnpm
pnpm dlx authpilot init

# Using yarn
yarn dlx authpilot init

# Using bun
bunx authpilot init
```

◆ **Pick Your Database :**

AuthPilot will ask you to select the database you want to use:
```bash
◆  Pick Your Database
│  ○ PostgeSQL
│  ○ MongoDB
```


◆ **Select Authentication Providers**

You’ll be prompted to select which authentication providers you’d like to enable:
```bash
◆  Select the authentication providers you want to use:
│  ◼ Google (recommended)
│  ◻ GitHub
│  ◻ FaceBook
│  ◻ Discord
│  ◻ LinkedIn
│  ◻ Reddit
│  ◻ Twitter
│  ◻ Twitch
```
Use the spacebar to toggle selections.


◆ **Prisma Initialization**

Once you’ve chosen your providers, AuthPilot automatically initializes Prisma for you:
```bash
✔ Prisma initialized successfully!
```
If prompted to overwrite your existing schema.prisma, you can choose Yes to allow AuthPilot to update it:
```bash
◇  Do you want to overwrite your schema.prisma file?
│  Yes
✔ Updated schema.prisma!
```


◆ **Configure Your Database URL**

Next, provide your DATABASE_URL — typically found in your database provider’s dashboard (like Monogdb, Neon, Supabase, or Railway):
```bash
◇  Enter your DATABASE_URL:
│  postgresql://username:password@host/dbname?sslmode=require
✔ Updated .env with DATABASE_URL!
```
AuthPilot will automatically update your .env file with the connection string.


◆ **Prisma Generation & Migration**

AuthPilot handles Prisma generation and migration for you.

If the generation fails, AuthPilot will offer to reset your database (warning: this will delete existing data):
```bash
◇  Database migration failed. Do you want to RESET the database?
│  Yes
✔ Generated Prisma client!

```

◆ **Installing Dependencies**

AuthPilot installs the latest versions of NextAuth v5 (beta) and Prisma Adapter:
```bash
✔ Installed Next-Auth v5(beta) & Prisma Adapter
```

◆ **File Generation**

AuthPilot scaffolds all required authentication files automatically:
```bash
✔ Created auth.config.ts & actions/auth file!
✔ Created auth.ts & api/auth/[...nextauth]/routes.ts file!
✔ Created middleware.ts file!
✔ Updated layout.tsx with SessionProvider!
✔ Created Dashboard & Current User Hook!
```

◆ **Your project is now fully configured for authentication.**

◆ **Make sure your .env file includes the following keys:**
```bash
DATABASE_URL="your_postgres_connection_string"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_generated_secret"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```
Depending on the providers you select, AuthPilot will prompt you to add additional environment variables.


## Final Steps

Once everything is generated, AuthPilot will display:
```bash
└  ℹ Your Project Setup is ready
```

You can now start your development server:
```bash
npm run dev
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Built By

- Twitter: [@ankit_codes_](https://x.com/ankit_codes_)
- GitHub: [@i-ankit01](https://github.com/i-ankit01)

_Keep Building !!_

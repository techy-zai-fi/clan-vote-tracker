# Clan Vote Tracker

## IT Committee Project

An election management and voting platform for managing clan-based voting processes. This application provides comprehensive tools for election administration, candidate management, and vote tracking.

**Developer**: [techy-zai-fi](https://github.com/techy-zai-fi)

## Project Overview

Clan Vote Tracker is a full-stack voting application built with modern web technologies. It enables IT Committee members to manage elections, supervise voting, track results, and maintain election data in real-time.

## Getting Started

### Prerequisites

- Node.js (v18 or higher) - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- npm or bun package manager
- Git

### Installation

```sh
# Step 1: Clone the repository
git clone https://github.com/techy-zai-fi/clan-vote-tracker.git

# Step 2: Navigate to the project directory
cd clan-vote-tracker

# Step 3: Install dependencies
npm install
# or
bun install

# Step 4: Start the development server
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:5173`

## Technology Stack

- **Vite** - Next-generation frontend build tool
- **TypeScript** - Type-safe JavaScript
- **React** - UI framework
- **shadcn-ui** - Reusable component library
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend database and authentication

## Project Structure

```
├── src/
│   ├── components/    # Reusable React components
│   ├── pages/        # Page components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions and database client
│   └── integrations/ # External service integrations
├── backend/          # Backend configuration
├── supabase/         # Database migrations
├── public/           # Static assets
└── data/            # CSV data files
```

## Key Features

- **Admin Dashboard** - Manage elections, candidates, and clans
- **Voting Station** - Secure voting interface for electors
- **Results Tracking** - Real-time election result monitoring
- **Email Management** - Committee communication tools
- **Branding Settings** - Customize election appearance
- **Voting Supervisor** - Oversight and audit capabilities

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

All changes should be committed to the repository. The IT Committee should review and approve changes before deployment.

## Support

For technical support and issues, contact the developer or refer to the project documentation.

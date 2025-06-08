# Okto API Demo Task

A complete React application demonstrating advanced integration with the Okto blockchain wallet API. This project showcases authentication systems, portfolio management, and token transfers with a sophisticated demo mode for comprehensive testing.

## Features

 **React 19 + TypeScript + Vite** for modern development  
 **Dual Authentication** - Google OAuth and Email OTP systems  
 **Portfolio Management** - Multi-chain token holdings and balance tracking  
 **Token Transfer System** - Intent-based transfers with gas optimization  
 **Advanced Demo Mode** - Complete API simulation for testing without dependencies  
 **Responsive Design** - Mobile-first interface with accessibility  
 **Security & Error Handling** - Comprehensive error boundaries and token management  
 **Professional UI/UX** - Custom CSS with smooth animations and loading states  

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18.x or later** and npm/pnpm/yarn
- **Okto API Keys**: `VITE_OKTO_CLIENT_PRIVATE_KEY` and `VITE_OKTO_CLIENT_SWA`. Obtain these from the [Okto Developer Dashboard](https://docs.okto.tech/docs/developer-admin-dashboard)
- **Google OAuth Credentials** (for Google authentication)

## Getting Started

1. **Clone this repository:**
   ```bash
   git clone <repository-url>
   cd okto-api-demo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   ```env
   # Okto API Configuration
   VITE_OKTO_API_BASE=https://api.okto.tech/v2
   VITE_OKTO_CLIENT_PRIVATE_KEY=YOUR_CLIENT_PRIVATE_KEY
   VITE_OKTO_CLIENT_SWA=YOUR_CLIENT_SWA
   
   # Google OAuth (optional)
   VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
   VITE_OKTO_REDIRECT_URI=http://localhost:5173/auth/callback
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:5173](http://localhost:5173)** with your browser to see your application.

## Demo Mode

🎯 **Perfect for immediate testing!** The application includes a sophisticated demo mode that simulates all Okto API interactions:

- **No API keys required** for initial testing
- **Realistic mock data** for portfolio and wallet information  
- **Simulated transactions** with status progression
- **Error scenario testing** for robust development

### Testing Credentials (Demo Mode)
- **Google Auth**: Any Google account (simulated)
- **Email OTP**: Any email address + any 6-digit code

## Key Technical Achievements

- ✅ **Complete Authentication Flow** - Google OAuth + Email OTP with session management
- ✅ **Multi-chain Portfolio** - EVM and Solana network support with real-time balances
- ✅ **Advanced Token Transfers** - Intent-based system with gas sponsorship integration
- ✅ **Production-Ready Architecture** - TypeScript, error boundaries, and security best practices
- ✅ **Mobile-Optimized Interface** - Responsive design with accessibility features
- ✅ **Comprehensive Demo System** - Full API simulation for development and testing

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Project Structure

```
src/
├── components/
│   ├── Auth/           # Authentication components (Google OAuth, Email OTP)
│   └── Dashboard/      # Portfolio and transfer interfaces
├── contexts/           # React Context for state management
├── services/           # API service layer with demo mode
├── types/              # TypeScript type definitions
└── index.css          # Comprehensive styling system
```

## Deployment

This application can be deployed to any static hosting service:

- **Vercel** - Recommended for React applications
- **Netlify** - Great for static sites with form handling
- **GitHub Pages** - Free hosting for public repositories

### Production Environment Setup
```env
VITE_OKTO_API_BASE=https://api.okto.tech/v2
VITE_OKTO_CLIENT_PRIVATE_KEY=production_private_key
VITE_OKTO_CLIENT_SWA=production_client_address
VITE_GOOGLE_CLIENT_ID=production_google_client_id
VITE_OKTO_REDIRECT_URI=https://yourdomain.com/auth/callback
```

Build for production:
```bash
npm run build
```

Deploy the `dist` folder to your preferred hosting platform.

## API Integration

The application demonstrates integration with key Okto API endpoints:

- **Authentication** - Google OAuth and Email OTP flows
- **Session Management** - Secure session verification and token handling
- **Portfolio Data** - Multi-chain token holdings and balance tracking
- **Wallet Management** - Cross-chain wallet creation and management  
- **Token Transfers** - Intent-based transfer system with gas optimization
- **Transaction Status** - Real-time transfer status monitoring

## Learn More

- [Okto SDK Documentation](https://docs.okto.tech/)
- [Okto Developer Dashboard](https://docs.okto.tech/docs/developer-admin-dashboard)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

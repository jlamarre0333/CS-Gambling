# CS:GO/CS2 Skin Gambling Website

A modern, engaging skin gambling platform for CS:GO/CS2 players.

## 📋 Project Status
🚧 **In Development** - See `context/TASKS.md` for current progress

## 🎯 Project Goal
See `context/GOAL.md` for the complete project vision and objectives.

## 🗂️ Project Structure

```
cs-gambling/
├── context/                 # Project management files
│   ├── GOAL.md             # Project vision and objectives
│   ├── TASKS.md            # Task management (Kanban style)
│   └── CONVERSATIONS.md    # Meeting notes and contacts
├── frontend/               # React/Next.js frontend application
├── backend/                # Node.js/Express backend API
├── database/               # Database schemas and migrations
├── docs/                   # Technical documentation
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL (for production) or SQLite (for development)
- Steam API key (for skin integration)

### Development Setup
```bash
# Clone the repository
git clone <repository-url>
cd cs-gambling

# Install dependencies for backend
cd backend
npm install

# Install dependencies for frontend  
cd ../frontend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development servers
npm run dev
```

## 🎮 Features (Planned)

### Core Games
- **Roulette** - Classic casino roulette with skin betting
- **Coin Flip** - Head-to-head player battles
- **Crash** - Multiplier game with risk/reward mechanics
- **Jackpot** - Multi-player pot system
- **Case Opening** - CS:GO case simulation

### Platform Features
- Steam authentication integration
- Real-time skin deposit/withdrawal
- Provably fair gaming algorithms
- Live chat and community features
- User statistics and leaderboards

## 🔧 Tech Stack

### Frontend
- **React/Next.js** - Modern web framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Socket.io** - Real-time communication

### Backend
- **Node.js/Express** - Server framework
- **TypeScript** - Type safety
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions
- **Socket.io** - Real-time features

### APIs & Services
- **Steam Web API** - Inventory and authentication
- **Market APIs** - Skin pricing data

## 📞 Support & Contact
See `context/CONVERSATIONS.md` for project contacts and communication history.

---
*Built with ❤️ for the CS:GO/CS2 community* 
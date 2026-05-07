# 🎮 Grind Ace Zen — Gamified Study Room

> *Study smarter. Level up. Conquer your goals.*

Grind Ace Zen is a full-stack, gamified productivity and collaborative study platform built for students and professionals who want to stay focused, track progress, and grow together.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

---

## ✨ Features

### 👤 User Profiles
- Full profile with name, bio, avatar upload, and **up to 4 social/portfolio links** (GitHub, LinkedIn, Portfolio, etc.)
- Links auto-detect and show matching icons (GitHub 🐙, LinkedIn 💼, Instagram 📸, etc.)
- **Global XP Leaderboard Rank** — see where you rank among all users
- **Profile Views counter** — see how many people visited your profile
- **Study Room Joins counter** — tracks unique rooms you've ever joined

### 🏆 Rank & XP System
- 9-tier ranking system: Bronze → Silver → Gold → Platinum → Diamond → Crown → Ace → Ace Master → Conqueror
- Earn XP from study sessions (2 min = 1 XP), with bonus XP for deep work (continuous 1hr+ sessions)
- Animated rank badge with progress bar

### 👥 Social Features
- **Follow / Unfollow** other users
- View **Followers** and **Following** lists with avatars
- Public profile pages with view tracking

### 📅 Streak Tracking
- GitHub-style activity heatmap (365 days)
- Current streak & max streak tracking
- Study days recorded automatically when you complete a session

### 🏠 Collaborative Study Rooms
- Create and join **real-time study rooms** via Socket.io
- Live member presence and status (studying / idle)
- In-room AI tutor powered by **Google Gemini**
- Room join count tracked per user (unique rooms only)

### ⏱️ Pomodoro Study Timer
- Built-in focus timer with session tracking
- Automatically logs study time and awards XP on completion

### 📋 Quests & Reminders
- Task management system for assignments and goals
- Reminder system with notification support

### 🌙 Dark Mode
- Full dark / light theme toggle in the navbar
- Preference saved across sessions via `localStorage`
- Smooth animated sun/moon icon transition

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 (Vite), Tailwind CSS, Shadcn UI, Radix UI, Framer Motion |
| **Routing** | React Router DOM v6 |
| **Backend** | Node.js, Express.js v5 |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | JWT + bcryptjs |
| **Real-time** | Socket.io |
| **AI** | Google Gemini (Generative AI) |
| **File Upload** | Multer (local disk storage) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- A **MongoDB** instance — local (`mongod`) or [MongoDB Atlas](https://cloud.mongodb.com/) (recommended)
- A **Google Gemini API Key** — [Get one here](https://aistudio.google.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/kri-jha/gamified-study-room.git
cd gamified-study-room
```

### 2. Install Dependencies

**Frontend (root directory):**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
cd ..
```

### 3. Configure Environment Variables

Create a `.env` file in the **project root** (`/grind-ace-zen/.env`):

```env
# Google Gemini AI Key
GEMINI_API_KEY=your_google_gemini_api_key

# Groq API Key (optional, for additional AI features)
GROQ_API_KEY=your_groq_api_key

# MongoDB Connection String
# Option A — MongoDB Atlas (recommended):
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/gamified-productivity

# Option B — If Atlas SRV lookup is blocked on your network, use the direct standard URI:
# MONGODB_URI=mongodb://<user>:<pass>@shard-00-00.xxx.mongodb.net:27017,shard-00-01.xxx.mongodb.net:27017,.../?ssl=true&replicaSet=atlas-xxx&authSource=admin

# JWT Secret (any long random string)
JWT_SECRET=your_super_secret_jwt_key

# Backend Port (optional, defaults to 5000)
PORT=5000
```

> 💡 **Tip:** If you get a `querySrv ECONNREFUSED` error with `mongodb+srv://`, see [`backend/info/mongodb_dns_error.md`](backend/info/mongodb_dns_error.md) for a fix.

### 4. Run the Application

You need **two terminals** running simultaneously.

**Terminal 1 — Backend:**
```bash
cd backend
node server.js
```
Backend runs at: `http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
npm run dev
```
Frontend runs at: `http://localhost:8080`

Open your browser and go to **[http://localhost:8080](http://localhost:8080)** 🎉

---

## 📁 Project Structure

```
grind-ace-zen/
├── backend/
│   ├── info/                   # Dev notes & error docs
│   │   └── mongodb_dns_error.md
│   ├── middleware/
│   │   └── auth.js             # JWT middleware
│   ├── models/
│   │   ├── User.js             # User schema (XP, streaks, links, social)
│   │   └── Room.js             # Study room schema
│   ├── routes/
│   │   ├── auth.js             # Register / Login / Me
│   │   ├── users.js            # Profile, follow, leaderboard, XP
│   │   ├── rooms.js            # Study rooms CRUD + join
│   │   └── ai.js               # AI tutor chat
│   ├── uploads/                # Avatar image files
│   └── server.js               # Express + Socket.io entry point
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Navigation + dark mode toggle
│   │   ├── RankBadge.jsx       # Animated rank badge
│   │   ├── StreakGrid.jsx      # GitHub-style heatmap
│   │   ├── FollowListModal.jsx # Followers/Following list modal
│   │   ├── AllRanksModal.jsx   # All ranks info modal
│   │   └── ProductivityCharts.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx     # Auth state (JWT-based)
│   ├── pages/
│   │   ├── ProfilePage.jsx     # Full profile dashboard
│   │   ├── StudyTimer.jsx      # Pomodoro timer
│   │   ├── StudyRooms.jsx      # Room list & join
│   │   └── ...
│   └── index.css               # Theme tokens (light + dark mode)
├── .env                        # Environment variables (not committed)
├── .gitignore
└── README.md
```

---

## 🔌 API Endpoints

### Auth (`/api/auth`)
| Method | Route | Description |
|---|---|---|
| POST | `/register` | Register a new user |
| POST | `/login` | Login and get JWT token |
| GET | `/me` | Get current user (auth required) |

### Users (`/api/users`)
| Method | Route | Description |
|---|---|---|
| PUT | `/profile` | Update profile (name, bio, links, avatar) |
| POST | `/avatar` | Upload avatar image |
| GET | `/leaderboard` | Top 100 users by XP |
| GET | `/:id/stats` | Get own full profile stats |
| GET | `/:id/public` | Get another user's profile (increments views) |
| POST | `/:id/follow` | Follow a user |
| DELETE | `/:id/follow` | Unfollow a user |
| GET | `/:id/followers` | Get followers list |
| GET | `/:id/following` | Get following list |
| POST | `/:id/xp` | Add XP and study time |

### Rooms (`/api/rooms`)
| Method | Route | Description |
|---|---|---|
| GET | `/` | Get all rooms |
| POST | `/` | Create a new room |
| DELETE | `/:id` | Delete a room |
| POST | `/:id/join` | Join a room (tracks unique join) |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [ISC License](LICENSE).

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/kri-jha">kri-jha</a>
</div>

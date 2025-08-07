# Ping Me - Video Conferencing Application

![Logo](https://public/logo3.png)

**Ping Me** is a full-stack video conferencing application built with **React**, **Node.js**, and **WebRTC**. It enables seamless video calls with features like screen sharing, real-time chat, user authentication, and meeting history.

---

## 🚀 Key Features

- 🔹 High-quality video conferencing with WebRTC
- 🔹 Screen sharing for presentations and collaboration
- 🔹 Real-time chat during video calls
- 🔹 Meeting history to track past meetings
- 🔹 User authentication with login and registration
- 🔹 Secure and encrypted signaling using Socket.IO

---

## 🛠️ Technology Stack

### Frontend

- React 19
- Material-UI (MUI)
- Socket.IO Client
- WebRTC API
- React Router DOM

### Backend

- Node.js + Express
- Socket.IO for signaling
- MongoDB + Mongoose
- Bcrypt for password hashing

---

## 🧩 Installation

### 🔷 Frontend Setup

```bash
# Clone the repository and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 🔶 Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with your configuration (see below)

# Start the server
npm run dev
```

---

## ⚙️ Configuration

### 🔐 Environment Variables

Create a `.env` file inside the `backend` directory:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=8080
FRONTEND_URL=https://your-frontend-url.com
```

---

## 🌐 Deployment (Render)

1. Push your code to GitHub
2. Go to [Render](https://render.com)
3. Create two services:
   - Frontend (React)
   - Backend (Node.js)
4. For backend:
   - Add environment variables as shown above
   - Use `npm install && npm run build` as build command (for frontend)
   - Use `npm start` as start command
5. Deploy!

---

## 📲 Usage

### 🔸 Landing Page

Visitors can join meetings as guests or register/login.

### 🔹 Home Page

Join a meeting with a code or create a new one.

### 🔸 Video Call Interface

- Toggle video/audio
- Share screen
- Chat with other users
- See all participants

### 🔹 Meeting History

View all your past meetings with details like meeting_code and date.

---

## 🗂️ Code Structure

### Frontend

- `App.jsx` – Main application router
- `Authentication.jsx` – Login and Register UI
- `Home.jsx` – Dashboard to create/join meetings
- `VideoMeet.jsx` – Core video call logic
- `History.jsx` – Meeting history
- `context/` – Auth context and provider

### Backend

- `socketManager.js` – Socket and WebRTC signaling logic
- `controllers/` – Handles user and meeting logic
- `models/` – MongoDB schemas (User, Meeting)
- `routes/` – API endpoint definitions

---

## 📡 API Endpoints

| Method | Endpoint             | Description                  |
|--------|----------------------|------------------------------|
| POST   | `/api/v1/login`      | Authenticate user            |
| POST   | `/api/v1/register`   | Register new user            |
| GET    | `/api/v1/get_all_activity` | Get meeting history  |
| POST   | `/api/v1/add_to_activity` | Save meeting to history |

---

## 🧠 WebRTC Implementation

- Uses STUN servers for NAT traversal
- Peer-to-peer media streaming
- Socket.IO for signaling
- MediaStream API for camera/mic access

---

## 🤝 Contributing

We welcome contributions!  
To contribute:

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/awesome-feature`
3. Commit your changes: `git commit -m "Add awesome feature"`
4. Push to the branch: `git push origin feature/awesome-feature`
5. Open a pull request

## 🔗 Live Demo

👉 Try it live: [https://pingmefrontend.onrender.com](https://pingmefrontend.onrender.com)

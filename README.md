# 💬 Real-Time Chat App – MERN Stack Developer Assignment

A **simple real-time chat application** built as part of the Ahead WebSoft Technologies assessment. This project demonstrates one-to-one chat functionality similar to Facebook Messenger or WhatsApp using:

* React.js with Next.js (frontend)
* Node.js with Express.js (backend)
* Socket.IO for real-time messaging
* MongoDB with Mongoose

---

## 🚀 Live Demo

* **Frontend (Next.js)**: [https://vipin-websoft.netlify.app/chat](https://vipin-websoft.netlify.app/chat)
* **Backend (Express.js)**: [https://websoft-exercise.onrender.com](https://websoft-exercise.onrender.com)

> ⚠️ The backend is hosted on a **free Render instance**, and MongoDB is also on a **free tier**.
> These may **sleep or slow down** under heavy usage. Please allow a few seconds for the backend to restart if it seems unresponsive.

---

## ✅ Features

* 🔐 Authentication with email & password
* 👤 Online/Offline indicator:

  * 🟢 Green tick = online
  * ⚪️ Grey tick = offline
* 📬 Real-time one-to-one chat via Socket.IO
* ✍️ Typing indicator when the other user is typing
* 📥 Unread message tracking and read receipts
* 📜 Chat threads with pagination
* 🧠 User status and message sync even after refresh

---

## 🧪 Test Users

You can log in using any of the **6 pre-seeded test users**:

| Email                                     | Password |
| ----------------------------------------- | -------- |
| [test-1@test.com](mailto:test-1@test.com) | password |
| [test-2@test.com](mailto:test-2@test.com) | password |
| [test-3@test.com](mailto:test-3@test.com) | password |
| [test-4@test.com](mailto:test-4@test.com) | password |
| [test-5@test.com](mailto:test-5@test.com) | password |
| [test-6@test.com](mailto:test-6@test.com) | password |

You can also **register a new user** via the sign-up form.

---

## 🗂️ Folder Structure

This is a **monorepo** with both frontend and backend:

```
├── frontend/
│   ├── src/        # Node.js + Express + Socket.IO server
│   └── .env.example      # React (Next.js) client
├── backend/
│   ├── controllers/
│   ├── models/        # Node.js + Express + Socket.IO server
    └── .env.example      
```

---

## ⚙️ Local Setup Instructions

1. **Clone the repo:**

   ```bash
   git clone https://github.com/your-username/mern-chat-app.git
   cd mern-chat-app
   ```

2. **Setup environment variables:**

   Copy `.env.example` to `.env` in both folders `backend`,`frontend` and fill in your MongoDB URI and JWT secret.

3. **Install and run backend:**

   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. **Install and run frontend:**

   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## 📌 Requirements from Assignment

| Requirement                        | ✅ Completed |
| ---------------------------------- | ----------- |
| One-to-one real-time chat          | ✅ Yes       |
| User status: online/offline        | ✅ Yes       |
| Typing indicator                   | ✅ Yes       |
| Real-time messaging with Socket.IO | ✅ Yes       |
| Simple UI using React              | ✅ Yes       |
| Deploy + GitHub link (optional)    | ✅ Done      |

---


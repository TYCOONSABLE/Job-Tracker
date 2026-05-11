🚀 Job Tracker App

A full-stack Job Tracker application built with Node.js, Express, MongoDB, and React, designed to help users manage job applications efficiently with authentication, tracking, and notifications.

📌 Features
🔐 User authentication (JWT-based login/register)
📄 Add, edit, and delete job applications
📊 Track application status (Applied, Interview, Offer, Rejected)
📧 Email notifications (via Gmail SMTP)
🤖 AI integration (Google Gemini API support)
🌐 REST API backend
⚡ Responsive frontend (React)
🛠️ Tech Stack

Frontend:

React
Vite
Axios
CSS / Tailwind (if used)

Backend:

Node.js
Express.js
MongoDB (Atlas / Local)
Mongoose
JWT Authentication
Nodemailer

APIs:

Google Gemini API
📁 Project Structure
job-tracker/
│
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── .env (not included in repo)
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│
├── README.md
⚙️ Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/your-username/job-tracker.git
cd job-tracker
2️⃣ Install dependencies
Backend
cd backend
npm install
Frontend
cd ../frontend
npm install
3️⃣ Setup environment variables

Create a .env file inside backend/:

PORT=5000

MONGO_URI=your-mongodb-connection-string

JWT_SECRET=your-secret-key

GEMINI_API_KEY=your-gemini-api-key

EMAIL_USER=your-email@gmail.com

EMAIL_PASS=your-gmail-app-password
4️⃣ Run the project
Start backend
cd backend
npm run dev
Start frontend
cd frontend
npm run dev
🌐 API Endpoints
Auth Routes
POST /api/auth/register
POST /api/auth/login
Job Routes
GET /api/jobs
POST /api/jobs
PUT /api/jobs/:id
DELETE /api/jobs/:id
🔐 Security Notes
Never commit .env file
MongoDB credentials should be kept private
Use strong JWT secret keys
🚀 Future Improvements
Dashboard analytics
Job reminders
Resume upload feature
Advanced AI job suggestions
Deployment on cloud platforms
📸 Screenshots (optional)

Add screenshots of your UI here

👨‍💻 Author
Your ARUN
GitHub: https://github.com/TYCOONSABLE
📜 License

This project is licensed under the MIT License.
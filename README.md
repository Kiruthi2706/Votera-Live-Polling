🗳️ Votera – Live Polling App

Votera is a real-time live polling web application that allows users to create polls, participate in polls, and view voting results instantly.

The application is designed to provide a simple, fast, and interactive polling experience using a modern frontend, backend API, database, and real-time technologies.

🚀 Features
🗳️ Create and manage polls
👥 Allow users to participate in live polls
⚡ Real-time vote updates
📊 Display live polling results
🔐 Backend API for handling polls and votes
💾 Persistent data storage using MongoDB
⚡ Redis support for fast data access and real-time operations
📱 Responsive web interface
🌐 Frontend and backend deployed separately
🛠️ Technologies Used
Frontend
React.js
JavaScript
HTML5
CSS3
Axios
Backend
Go (Golang)
Gin Framework
REST API
Database & Services
MongoDB
Redis
Deployment
Vercel – Frontend
Backend cloud deployment
Version Control
Git
GitHub
🏗️ Project Architecture
                ┌────────────────────┐
                │      User          │
                │   Web Browser      │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │ React Frontend     │
                │      Votera        │
                └─────────┬──────────┘
                          │
                    REST API / HTTP
                          │
                          ▼
                ┌────────────────────┐
                │ Go + Gin Backend   │
                └─────────┬──────────┘
                     ┌────┴─────┐
                     ▼          ▼
              ┌───────────┐ ┌───────────┐
              │ MongoDB   │ │   Redis   │
              │ Database  │ │   Cache   │
              └───────────┘ └───────────┘
📁 Project Structure
Votera-Live-Polling/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── main.go
│   ├── go.mod
│   ├── go.sum
│   └── ...
│
├── README.md
└── ...

The exact folder structure may vary depending on the current project version.

⚙️ Installation and Setup
1. Clone the Repository
git clone https://github.com/Kiruthi2706/Votera-Live-Polling.git
cd Votera-Live-Polling
🔹 Backend Setup

Navigate to the backend folder:

cd backend

Install Go dependencies:

go mod tidy

Create/configure the required environment variables.

Example:

MONGODB_URI=your_mongodb_connection_string
REDIS_URL=your_redis_connection_string
PORT=8080

Start the backend:

go run .

The backend API will run on the configured port.

🔹 Frontend Setup

Open a new terminal and navigate to the frontend:

cd frontend

Install dependencies:

npm install

Configure the backend API URL in the frontend environment/configuration.

Example:

VITE_API_URL=your_backend_url

Start the development server:

npm run dev

The application can then be accessed through the local URL provided by Vite.

🌐 Deployment
Frontend

The frontend can be deployed using Vercel.

Before deployment, make sure the frontend API configuration points to the deployed backend URL instead of the local backend.

Example:

VITE_API_URL=https://your-backend-url.com
Backend

The Go backend can be deployed on a cloud hosting platform that supports Go applications.

Make sure the deployed backend has access to:

MongoDB
Redis
Required environment variables
Correct CORS configuration
🔄 Application Workflow
User opens Votera
        ↓
Frontend loads
        ↓
Frontend connects to Backend API
        ↓
User creates / joins a poll
        ↓
Vote is submitted
        ↓
Backend processes the vote
        ↓
Vote data stored in MongoDB
        ↓
Redis handles fast-access / real-time operations
        ↓
Updated result is displayed
        ↓
Users see live polling results
🔐 Environment Variables

Do not upload passwords, API keys, database credentials, or other secrets to GitHub.

Example:

MONGODB_URI=
REDIS_URL=
PORT=
VITE_API_URL=

Add sensitive environment files to .gitignore:

.env
.env.local
node_modules/
🧪 Running the Project Locally
Terminal 1 – Backend
cd backend
go run .
Terminal 2 – Frontend
cd frontend
npm install
npm run dev

Then open the frontend URL shown in the terminal.

📊 Main Modules
1. Poll Creation

Users can create a poll with a question and multiple options.

2. Voting

Users can select an option and submit their vote through the backend API.

3. Live Results

The application displays updated voting results so users can observe the current poll status.

4. Backend API

The Go/Gin backend manages requests, poll operations, voting, and communication with the database.

5. Data Management

MongoDB is used for persistent application data, while Redis is used for fast-access operations.

🎯 Project Objective

The main objective of Votera is to build a simple and scalable real-time polling platform where users can interact with polls and view results with minimal delay.

The project also demonstrates practical implementation of:

Frontend development
REST APIs
Backend development with Go
Database integration
Redis caching
Cloud deployment
Git and GitHub workflow
🔮 Future Enhancements
🔑 User authentication and authorization
👤 User profiles
📈 Advanced poll analytics
⏱️ Scheduled polls
🔔 Real-time notifications
🏆 Poll history and leaderboards
📱 Progressive Web App support
🔒 Enhanced vote protection
📊 Graphical voting statistics
👩‍💻 Author

Kiruthiga J

GitHub:
https://github.com/Kiruthi2706

📄 License

This project is created for educational and project-development purposes.

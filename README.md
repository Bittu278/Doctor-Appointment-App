# Doctor Appointment App

A full-stack MERN application for booking and managing doctor appointments.

## 🚀 Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Atlas or local)
- **Authentication:** JWT

## ✨ Features

- User registration and login (JWT authentication)
- Book, view, and manage appointments
- Doctor and patient dashboards
- Responsive UI for all devices

### 🆕 Enhanced Appointment System

- **Zero Conflicts**: Smart booking system prevents overlapping appointments
- **Controlled Duration**: All appointments must be 10-35 minutes
- **Real-time Availability**: See available time slots instantly
- **Flexible Scheduling**: Doctors can set working hours, breaks, and consultation duration
- **Buffer Time Support**: Optional buffer between appointments (0-15 minutes)

📚 **See detailed documentation:**
- [QUICKSTART.md](./QUICKSTART.md) - Get started quickly
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Complete API reference
- [APPOINTMENT_SYSTEM.md](./APPOINTMENT_SYSTEM.md) - System overview

## 📸 Screenshots

![Home Page](client/public/screenshot more screenshots as needed -->

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) and npm installed
- [MongoDB](https://www.mongodb.com/) (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### 1. Clone the Repository

```bash
git clone https://github.com/Bittu278/Doctor-Appointment-App.git
cd Doctor-Appointment-App


2. Backend Setup
bash
cd server
npm install
Copy the .env.example file to .env:

bash
cp .env.example .env
On Windows, copy and rename the file manually.

Edit .env and fill in your actual credentials:

text
PORT=8080
NODE_MODE=development
MONGO_URL=your_actual_mongodb_connection_string
DANGEROUSLY_DISABLE_HOST_CHECK=true
JWT_SECRET=your_actual_jwt_secret
Start the backend server:

bash
npm start
The backend will run at http://localhost:8080 (or your specified port).

3. Frontend Setup
bash
cd ../client
npm install
npm start
The React app will run at http://localhost:3000

⚙️ Environment Variables
This project uses environment variables to manage sensitive information and configuration.

Copy the example file:
After cloning the repository, copy the .env.example file and rename it to .env in the same directory.

bash
cp .env.example .env
On Windows, you can manually copy and rename the file using File Explorer.

Fill in your values:
Open the new .env file and replace the placeholder values with your actual credentials and secrets.

Keep your .env file private:
Do not commit your .env file to GitHub. It is already included in .gitignore for your safety.

🧑‍💻 Running the Application
Make sure MongoDB is running (locally or via Atlas).

Start the backend server as described above.

Start the frontend React app.

Visit http://localhost:3000 in your browser.

📝 License
This project is open source and available under the MIT License.

📫 Contact
For questions, suggestions, or feedback, contact BITTU DAS.





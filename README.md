Contract Management System

Overview
  
The Contract Management System is a full-stack web application designed to efficiently manage contracts. It allows users to create, update, store, and track contract-related data with user authentication and authorization features.

Features

User authentication (Signup/Login with JWT authentication)

Create, view, update, and delete contracts

Search and filter contracts

File upload support for contract documents

Secure storage and retrieval of contract details

Dashboard with contract analytics

Technologies Used

Frontend:

React.js

Tailwind CSS / Bootstrap

SweetAlert for alerts and confirmations

Axios for API calls

Backend:

Node.js

Express.js

MongoDB / PostgreSQL

JWT for authentication

Multer for file uploads

Installation

Prerequisites:

Node.js (v20.13.1 or later)

MongoDB (if using MongoDB as the database)

Git

Steps:

Clone the repository:

git clone https://github.com/your-username/contract-management-system.git
cd contract-management-system

Install dependencies for the backend:

cd backend
npm install

Configure environment variables:

Create a .env file in the backend directory and add the following:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

Start the backend server:

npm start

Install dependencies for the frontend:

cd ../frontend
npm install

Start the frontend:

npm start

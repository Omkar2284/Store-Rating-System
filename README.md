# Store Rating System - Final Project

This is the full-stack store rating system I've built using React for the frontend and Node.js/Express for the backend. The database is handled via MySQL.

## How to get it running:

### 1. Database Setup
First, you need to import the database schema. I've included the file `store_rating_system.sql` in the root folder. 
- Open phpMyAdmin.
- Create a new database named `store_rating_system`.
- Import the `.sql` file to set up all the tables (Users, Stores, Ratings) and the sample data.

### 2. Backend Setup
Go into the `backend` folder and run `npm install` to get the dependencies.
You'll need to create a `.env` file in the backend folder with your own credentials:
- DB_HOST=localhost
- DB_USER=root
- DB_PASSWORD=(your password)
- DB_NAME=store_rating_system
- JWT_SECRET=any_secret_key

Then run `node server.js` to start the server on port 5000.

### 3. Frontend Setup
Go into the `frontend` folder and run `npm install`.
Once that's done, run `npm start`. The app should open on `localhost:3000`.

## Test Accounts I've set up:
- Admin: admin@platform.com (Password: Admin@1234)
- Store Owner: rahul.sharma@chaipoint.in (Password: Admin@1234)
- Normal User: testuser@gmail.com (Password: Admin@1234)

## Key Features:
- Search and Sort functionality for stores.
- Admin dashboard with total stats for users, stores, and ratings.
- Private dashboard for Store Owners to see only their specific store's feedback.
- Password validation and JWT authentication for security.

# GIK-iHub: GIKI Campus Tuck Shop Management System

GIK-iHub is a comprehensive web application for managing and ordering from tuck shops at the Ghulam Ishaq Khan Institute of Engineering Sciences and Technology (GIKI) campus. This platform connects students with local shops for food, beverages, stationary, and general items with a convenient delivery system.

## Project Overview

This project is designed as a Database Management System (DBMS) implementation with a fully functional user interface. It allows:

- Students to browse shops and order products
- Shop vendors to manage their inventory and orders
- Delivery personnel to manage deliveries
- Administrators to oversee the entire system

## Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript
- Bootstrap 5

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL
- Firebase (Authentication and Real-time features)

### Advanced Database Features
- Triggers
- Stored Procedures
- Functions
- Views
- Cursors

## Project Structure

The project is organized into two main directories:

### Frontend Directory
Contains all client-side code including HTML pages, CSS stylesheets, JavaScript files, and assets.

### Backend Directory
Contains the server-side code including Node.js/Express API, database connection, controllers, routes, and middleware.

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- Firebase account

### Database Setup
1. Install PostgreSQL and pgAdmin4
2. Create a new database named `gikihub`
3. Run the SQL script in `backend/models/database.sql` to create the necessary tables, views, triggers, functions, etc.

### Backend Setup
1. Navigate to the `backend` directory
2. Install dependencies: `npm install`
3. Configure environment variables in `.env` file (use `.env.example` as a template)
4. Start the server: `npm start` or `npm run dev` for development mode

### Frontend Setup
1. Configure Firebase: Update the Firebase configuration in `frontend/assets/js/firebase-config.js`
2. Open `index.html` in your browser or use a local development server

## Features

- User authentication and authorization
- Shop browsing and filtering
- Product catalog
- Shopping cart
- Order placement and tracking
- Real-time delivery tracking
- Vendor order management
- Admin dashboard
- Reviews and ratings system


## License

This project is created for educational purposes as part of a Database Management System course at GIKI.

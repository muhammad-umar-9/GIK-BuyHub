# GIKIHub: Streamlining Tuck Shop Management and Deliveries

GIKIHub is a full-stack web application designed to revolutionize the tuck shop experience at GIKI. It provides a centralized platform for students to order food, beverages, stationery, and other essentials from various tuck shops with ease, while also offering shop owners powerful tools to manage their products, inventory, and sales.  The system also incorporates a robust delivery management component, ensuring efficient and timely delivery of orders to student hostels.

## Features

**For Students:**

*   **Browse Shops and Products:** Easily explore different tuck shops and their product offerings, complete with descriptions, prices, and availability.
*   **User-Friendly Ordering:** Add items to cart, customize orders with special instructions, and securely checkout.
*   **Real-time Order Tracking:** Monitor order status from "Pending" to "Delivered."
*   **Delivery Tracking:**  Follow the progress of deliveries to their hostel rooms.
*   **Order History:** Review past orders and quickly reorder favorites.

**For Shop Owners:**

*   **Shop Management:** Control shop information, including operating hours, contact details, and product listings.
*   **Product Management:** Add, edit, and remove products, manage prices and availability.
*   **Inventory Management:** Track stock levels and ensure timely restocking.
*   **Order Management:**  View and process incoming orders, update order status.
*   **Sales Reports and Analytics:** Gain insights into sales performance with detailed reports.
*   **Employee Management:** Manage employee information and roles.

**For Administrators:**

*   **Complete System Overview:** Monitor all shops, orders, and deliveries.
*   **Shop and Product Approval:** Approve new shops and product listings.
*   **Manage Delivery Personnel:** Assign delivery personnel to orders, track delivery status.
*   **Generate Comprehensive Reports:** Access detailed reports on sales, popular products, and other key metrics.

## Tech Stack

*   **Frontend:** HTML, CSS, JavaScript 
*   **Backend:** Node.js, Express.js
*   **Database:** PostgreSQL and MongoDB (switchable via configuration)

## Installation and Setup

**Prerequisites:**

*   Node.js and npm (or yarn)
*   PostgreSQL (if using PostgreSQL as the database) and pgAdmin
*   MongoDB (if using MongoDB as the database) and MongoDB or compass
*   A Google Cloud Project with Firestore and Storage enabled (If using firestore)

**Backend:**

1.  Clone the repository: `git clone https://github.com/yourusername/GIKIHub.git` (replace with your repo URL)
2. Navigate to the backend directory: cd backend
3. Install dependencies:
    `npm install`
4. Create a `.env` file in the backend directory (see example.env) and configure environment variables as required.
5. Set up the database:
    *   **PostgreSQL:**  Use `psql` or pgAdmin to execute the SQL scripts provided (in `backend/database`) to create the database schema and populate with initial data if applicable.
    *   **MongoDB:** Create the necessary collections and import any initial data using `mongosh` or MongoDB Compass
    * **Firestore:** Create a Firestore database through Firebase in a Google Cloud Project, create the collections in the database and insert the data if required. Alternatively connect a Google Cloud Project which has the database.
6. Start the server:
    * For Postgres: `DB_TYPE=postgres node server.js` or `npm start`
    * For MongoDB: `DB_TYPE=mongodb node server.js` (make sure your MongoDB server is running on the port specified in .env or dbdrivers/mongodb.js).


**Frontend:**

1. Open `frontend/index.html` in your browser.

## Usage

**Running different backends:**
- To run with PostgreSQL: `DB_TYPE=postgres npm start` or just `npm start` if it is the default option
- For MongoDB: `DB_TYPE=mongodb npm start` (ensure your MongoDB server is running and the URI is correctly configured).
- For Firestore: `DB_TYPE=firestore npm start` (ensure the service account key file is setup correctly)

The frontend should remain the same regardless of the database being used and automatically queries from whatever database has been set.

**Frontend:**

*   Use the navigation bar to switch between sections (Home, Shops, Orders, Delivery, Admin).
*   Follow the intuitive prompts to browse shops, add items to the cart, place orders, and track deliveries. The frontend should contain documentation specifying how each can be used.

**Backend:**

*   API endpoints are documented in the routes files (in the backend/routes directory). You can test API calls using Postman where necessary.

## Example .env file

DB_TYPE=postgres
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DB=your_postgres_db_name
MONGO_URI=your_mongodb_uri
MONGO_DB=your_mongodb_db_name

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)

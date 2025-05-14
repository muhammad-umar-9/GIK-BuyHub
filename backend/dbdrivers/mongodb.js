
const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017'; // Or your MongoDB connection string
const MONGO_DB = process.env.MONGO_DB || 'gikihub'; // Your MongoDB database name

const client = new MongoClient(MONGO_URI, { useUnifiedTopology: true });
let db;

async function connect() {
    if (!db) {
        await client.connect();
        db = client.db(MONGO_DB);
    }
    return db;
}

module.exports = {
    connect,
    ObjectId, // Export ObjectId directly
    type: 'mongodb',
};

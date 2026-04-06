
const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://harrishere:Haris123@tododb.qyf9c.mongodb.net/clothingweb?retryWrites=true&w=majority&appName=Tododb';
    try {
        await mongoose.connect(MONGO_URI);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('--- COLLECTIONS ---');
        collections.forEach(c => console.log(c.name));

        // Also try to find all categories using the model
        const Category = require('./Models/Category');
        const categories = await Category.find();
        console.log('--- CATEGORIES (MODEL) ---');
        console.log(JSON.stringify(categories, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();

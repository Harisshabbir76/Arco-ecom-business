
const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://harrishere:Haris123@tododb.qyf9c.mongodb.net/clothingweb?retryWrites=true&w=majority&appName=Tododb';
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        const categories = await mongoose.connection.db.collection('categories').find({}).toArray();
        console.log('--- CATEGORIES ---');
        categories.forEach(c => {
            console.log(`ID: ${c._id}, Name: "${c.name}", Image: "${c.image}"`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();


const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://harrishere:Haris123@tododb.qyf9c.mongodb.net/clothingweb?retryWrites=true&w=majority&appName=Tododb';
    try {
        await mongoose.connect(MONGO_URI);
        const Category = require('./Models/Category');
        const bottom = await Category.findOne({ name: /bottom/i });
        console.log('--- BOTTOM ---');
        console.log(bottom);

        const all = await Category.find();
        console.log('--- ALL ---');
        console.log(all);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();

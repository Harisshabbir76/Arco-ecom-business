
const mongoose = require('mongoose');
require('dotenv').config();

async function dump() {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://harrishere:Haris123@tododb.qyf9c.mongodb.net/clothingweb?retryWrites=true&w=majority&appName=Tododb';
    try {
        await mongoose.connect(MONGO_URI);
        const categories = await mongoose.connection.db.collection('categories').find({}).toArray();
        const fs = require('fs');
        fs.writeFileSync('cat_dump.json', JSON.stringify(categories, null, 2));
        console.log('Dumped to cat_dump.json');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

dump();

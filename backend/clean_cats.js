
const mongoose = require('mongoose');
require('dotenv').config();

async function clean() {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://harrishere:Haris123@tododb.qyf9c.mongodb.net/clothingweb?retryWrites=true&w=majority&appName=Tododb';
    try {
        await mongoose.connect(MONGO_URI);
        const Category = require('./Models/Category');
        const categories = await Category.find();

        for (const cat of categories) {
            let changed = false;
            const oldName = cat.name;
            const oldImage = cat.image;

            const newName = cat.name.trim();
            const newImage = cat.image.trim();

            if (oldName !== newName || oldImage !== newImage) {
                cat.name = newName;
                cat.image = newImage;
                await cat.save();
                console.log(`Cleaned category "${oldName}" -> "${newName}"`);
                changed = true;
            }
        }

        console.log('Cleaning finished.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

clean();

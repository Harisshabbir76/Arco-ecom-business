
const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://harrishere:Haris123@tododb.qyf9c.mongodb.net/clothingweb?retryWrites=true&w=majority&appName=Tododb';
    try {
        await mongoose.connect(MONGO_URI);
        const collections = await mongoose.connection.db.listCollections().toArray();

        let found = false;
        for (let c of collections) {
            const collection = mongoose.connection.db.collection(c.name);

            // search for placeholder.com in any string field
            // Instead of an generic text search which might not be indexed, let's just do a regex search on the most likely fields

            const docs = await collection.find({
                $or: [
                    { image: { $regex: /placeholder\.com/i } },
                    { 'image.0': { $regex: /placeholder\.com/i } },
                    { images: { $regex: /placeholder\.com/i } },
                    { url: { $regex: /placeholder\.com/i } }
                ]
            }).toArray();

            if (docs.length > 0) {
                console.log(`FOUND in ${c.name}:`, JSON.stringify(docs, null, 2));
                found = true;
            }
        }

        if (!found) {
            console.log('No placeholder.com found in the database string fields.');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();

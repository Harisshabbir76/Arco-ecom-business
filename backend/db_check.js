
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function check() {
    console.log('Connecting to MONGO_URI...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const products = await mongoose.connection.db.collection('products').find({ name: /plain leather bag/i }).toArray();
    const discounts = await mongoose.connection.db.collection('discounts').find({ code: 'Haris123' }).toArray();

    console.log('\n--- PRODUCTS ---');
    if (products.length === 0) console.log('No products found matching "plain leather bag"');
    products.forEach(p => console.log(`ID: ${p._id}, Name: ${p.name}, Category: "${p.category}"`));

    console.log('\n--- DISCOUNTS ---');
    if (discounts.length === 0) console.log('No discounts found matching "Haris123"');
    discounts.forEach(d => console.log(`ID: ${d._id}, Code: ${d.code}, TargetCats: ${JSON.stringify(d.targetCategories)}, Type: ${d.type}, IsActive: ${d.isActive}`));

    process.exit(0);
}

check().catch(e => { console.error('Error during check:', e); process.exit(1); });

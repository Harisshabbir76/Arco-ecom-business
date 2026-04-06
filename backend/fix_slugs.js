const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Product = require('./Models/Product');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')     // Remove all non-word chars
    .replace(/--+/g, '-');      // Replace multiple - with single -
}

async function fixSlugs() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const products = await Product.find({ $or: [{ slug: { $exists: false } }, { slug: '' }, { slug: null }] });
    console.log(`Found ${products.length} products missing slugs.`);

    for (let product of products) {
      if (!product.name) {
          console.warn(`Product ${product._id} has no name, skipping.`);
          continue;
      }
      const slug = slugify(product.name);
      
      // Ensure uniqueness (basic check)
      let uniqueSlug = slug;
      let counter = 1;
      while (await Product.findOne({ slug: uniqueSlug, _id: { $ne: product._id } })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }

      product.slug = uniqueSlug;
      await product.save();
      console.log(`Updated ID: ${product._id}, Name: ${product.name}, Slug: ${product.slug}`);
    }

    console.log('All products updated successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing slugs:', err);
    process.exit(1);
  }
}

fixSlugs();

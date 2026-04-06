const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    image: { type: String, required: true }, // Cloudinary URL
    showOnHome: { type: Boolean, default: false } // Toggle for featured on home
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);

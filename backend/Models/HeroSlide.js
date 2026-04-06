const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema({
    image: { type: String }, // Legacy field (optional for existing data)
    desktopImage: { type: String, required: true }, // Cloudinary URL for desktop (rec: 1920x800)
    mobileImage: { type: String, required: true }, // Cloudinary URL for mobile (rec: 390x500)
    title: String,
    subtitle: String,
    ctaText: String,
    ctaLink: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('HeroSlide', heroSlideSchema);


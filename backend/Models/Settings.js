const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    shippingCharge: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);

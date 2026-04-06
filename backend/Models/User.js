const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetOtp: { type: String, default: null },
    resetOtpExpiry: { type: Date, default: null },
});

module.exports = mongoose.model("User", UserSchema);
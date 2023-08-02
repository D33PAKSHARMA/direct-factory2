const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        default: null,
    },
    last_name: {
        type: String,
        default: null,
    },
    phone: {
        type: String,
        default: null,
    },
    email: {
        type: String,
        default: null,
    },
    username: {
        type: String,
        default: null,
    },
    password: {
        type: String,
        default: null,
    },
    is_email_verified: {
        type: Boolean,
        default: false
    },
    email_verified_at: {
        type: Date,
        default: null
    },
    is_trash: {
        type: Boolean,
        default: false
    },
    is_active: {
        type: Boolean,
        default: true
    },
    company_id: {
        type: String,
        default: null
    },
    factory_id: {
        type: String,
        default: null
    },
    user_type: {
        type: String,
        enum: ['client', 'customer', 'employee'],
        default: null
    },
    created_by: {
        type: String,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: null
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
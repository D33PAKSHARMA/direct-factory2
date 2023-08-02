const mongoose = require('mongoose');

const userDetailsSchema = new mongoose.Schema({
    user_id: {
        type: String,
        default: null,
    },
    address: {
        type: String,
        default: null,
    },
    created_by: {
        type: String,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    modified_by: {
        type: Date,
        default: null
    },
    modified_at: {
        type: Date,
        default: null
    }
});

const UserDetails = mongoose.model('UserDetails', userDetailsSchema);

module.exports = UserDetails;
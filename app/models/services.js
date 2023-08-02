const mongoose = require('mongoose');

const servicesSchema = new mongoose.Schema({
    name: {
        type: String,
        default: null,
    },
    department: {
        type: String,
        default: null,
    },
    price: {
        type: Number,
        default: null,
    },
    offer_price: {
        type: Number,
        default: null
    },
    validity: {
        type: Number,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    status: {
        type: Boolean,
        default: true
    },
    is_trash: {
        type: Boolean,
        default: false
    },
    created_by: {
        type: String,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    modified_at: {
        type: Date,
        default: null
    },
    modified_by: {
        type: String,
        default: null
    }
});

const Services = mongoose.model('Services', servicesSchema);

module.exports = Services;
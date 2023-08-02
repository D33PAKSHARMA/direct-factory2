const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
    name: {
        type: String,
        default: null,
    },
    currency_symbol: {
        type: String,
        default: null,
    },
    currency_code: {
        type: String,
        default: null,
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

const Countries = mongoose.model('Countries', countrySchema);

module.exports = Countries;
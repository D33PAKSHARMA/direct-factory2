const mongoose = require('mongoose');

const clientBusinessSchema = new mongoose.Schema({
    business_name: {
        type: String,
        default: null,
    },
    phone_no: {
        type: String,
        default: null,
    },
    address: {
        type: String,
        default: null,
    },
    director_first_name: {
        type: String,
        default: null,
    },
    director_last_name: {
        type: String,
        default: null,
    },
    director_phone: {
        type: String,
        default: null
    },
    director_email: {
        type: String,
        default: null
    },
    contact_person_first_name: {
        type: String,
        default: null
    },
    contact_person_last_name: {
        type: String,
        default: null
    },
    contact_person_phone: {
        type: String,
        default: null
    },
    contact_person_email: {
        type: String,
        default: null
    },
    contact_person_address: {
        type: String,
        default: null
    },
    website: {
        type: String,
        default: null
    },
    establishment_type: {
        type: String,
        default: null
    },
    product_type: {
        type: String,
        default: null
    },
    no_of_employees: {
        type: Number,
        default: null
    },
    existing_market: {
        type: String,
        default: null
    },
    last_year_selling: {
        type: String,
        default: null
    },
    selling_country: {
        type: String,
        default: null
    },
    logo: {
        type: String,
        default: null
    },
    business_category: {
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

const ClientBusiness = mongoose.model('ClientBusiness', clientBusinessSchema);

module.exports = ClientBusiness;
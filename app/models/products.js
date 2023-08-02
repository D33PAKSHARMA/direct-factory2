const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        default: null,
    },
    description: {
        type: String,
        default: null,
    },
    sku: {
        type: String,
        default: null,
    },
    unit: {
        type: String,
        default: null,
    },
    cost: {
        type: String,
        default: null,
    },
    sale_price: {
        type: String,
        default: null
    },
    is_have_variation: {
        type: String,
        default: null
    },
    factory_id: {
        type: String,
        default: null
    },
    capacity: {
        type: String,
        default: null
    },
    stock: {
        type: Number,
        default: 0
    },
    status: {
        type: Boolean,
        default: false
    },
    is_approved: {
        type: Boolean,
        default: false
    },
    is_trash: {
        type: Boolean,
        default: false
    },
    trash_date: {
        type: Date,
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
    modified_at: {
        type: Date,
        default: null
    },
    modified_by: {
        type: String,
        default: null
    }
});

const Products = mongoose.model('Products', productSchema);

module.exports = Products;
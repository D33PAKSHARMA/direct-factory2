const mongoose = require('mongoose');

const productVariationSchema = new mongoose.Schema({
    product_id: {
        type: String,
        default: null,
    },
    name: {
        type: String,
        default: null,
    },
    cost_price: {
        type: String,
        default: null,
    },
    sale_price: {
        type: String,
        default: null,
    },
    sku: {
        type: String,
        default: null,
    },
    stock: {
        type: Number,
        default: 0,
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

const ProductVariations = mongoose.model('ProductVariations', productVariationSchema);

module.exports = ProductVariations;
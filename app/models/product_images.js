const mongoose = require('mongoose');

const productImagesSchema = new mongoose.Schema({
    product_id: {
        type: String,
        default: null,
    },
    image: {
        type: String,
        default: null,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

const ProductImages = mongoose.model('ProductImages', productImagesSchema);

module.exports = ProductImages;
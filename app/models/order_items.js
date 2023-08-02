const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    order_id: {
        type: String,
        default: null,
    },
    product_id: {
        type: String,
        default: null,
    },
    product_price: {
        type: String,
        default: null,
    },
    quantity: {
        type: String,
        default: null,
    },
    total_price: {
        type: String,
        default: null,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
});

const OrderItems = mongoose.model('OrderItems', orderItemSchema);

module.exports = OrderItems;
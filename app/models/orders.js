const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer_id: {
        type: String,
        default: null,
    },
    customer_name: {
        type: String,
        default: null,
    },
    customer_mobile: {
        type: String,
        default: null,
    },
    customer_address: {
        type: String,
        default: null,
    },
    total_order_price: {
        type: String,
        default: null,
    },
    gst: {
        type: String,
        default: null,
    },
    discount: {
        type: String,
        default: null
    },
    shipping_charges: {
        type: String,
        default: null
    },
    grand_total: {
        type: String,
        default: null
    },
    payment_status: {
        type: String,
        enum: ['Paid', 'Pending', 'Cancelled', 'Refund'],
        default: 'Pending'
    },
    order_status: {
        type: String,
        enum: ['Delivered', 'Pending'],
        default: 'Pending'
    },
    status: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    created_by: {
        type: String,
        default: null
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

const Orders = mongoose.model('Orders', orderSchema);

module.exports = Orders;
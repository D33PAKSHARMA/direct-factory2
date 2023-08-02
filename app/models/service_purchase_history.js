const mongoose = require('mongoose');

const servicePurchaseHistorySchema = new mongoose.Schema({
    client_id: {
        type: String,
        default: null
    },
    factory_id: {
        type: String,
        default: null,
    },
    service_id: {
        type: String,
        default: null,
    },
    purchase_price: {
        type: Number,
        default: null
    },
    active_from: {
        type: Date,
        default: null
    },
    active_to: {
        type: Date,
        default: null
    },
    payment_status: {
        type: String,
        default: null
    },
    action_date: {
        type: Date,
        default: null
    },
    action_by: {
        type: String,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    created_by: {
        type: String,
        default: null
    }
});

const ServicePurchaseHistory = mongoose.model('ServicePurchaseHistory', servicePurchaseHistorySchema);

module.exports = ServicePurchaseHistory;
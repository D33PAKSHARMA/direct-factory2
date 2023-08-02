const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema({
    product_id: {
        type: String,
        default: null,
    },
    reception_date: {
        type: String,
        default: null
    },
    quantity: {
        type: Number,
        default: 0,
    },
    total_price: {
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
    }
});

const StockHistory = mongoose.model('StockHistory', stockHistorySchema);

module.exports = StockHistory;
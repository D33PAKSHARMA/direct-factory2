const mongoose = require('mongoose');

const stockVariationHistorySchema = new mongoose.Schema({
    stock_history_id: {
        type: String,
        default: null
    },
    variation_id: {
        type: String,
        default: null,
    },
    quantity: {
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
    }
});

const StockVariationHistory = mongoose.model('StockVariationHistory', stockVariationHistorySchema);

module.exports = StockVariationHistory;
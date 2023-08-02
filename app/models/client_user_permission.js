const mongoose = require('mongoose');

const clientUserPermissionSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    permissions: {
        type: String,
        default: null
    },
    added_by: {
        type: String,
        default: null
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

const ClientUserPermission = mongoose.model('ClientUserPermission', clientUserPermissionSchema);

module.exports = ClientUserPermission;
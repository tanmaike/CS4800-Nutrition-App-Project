const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    macrolocation: {
        type: String,
        enum: ['CPP', 'Mt. SAC', 'Other'],
        required: true,
        default: 'Other'
    },
    createdBy: {
        type: Number,
        ref: 'User'
    },
    createdByUsername: {
        type: String
    },
    isPublic: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Add text index for search
locationSchema.index({ name: 'text', macrolocation: 'text' });

module.exports = mongoose.model('Location', locationSchema);
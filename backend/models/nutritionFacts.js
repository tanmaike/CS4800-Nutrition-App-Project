const mongoose = require('mongoose');

const nutritionFactsSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true 
    },
    
    calories: { 
        type: Number, 
        required: true,
        min: 0,
        default: 0 
    },
    
    quantity: { 
        type: Number, 
        required: true,
        min: 0,
        default: 0 
    },

    fcpAmount: {
        fat: { type: Number, min: 0, default: 0 },
        carbs: { type: Number, min: 0, default: 0 },
        protein: { type: Number, min: 0, default: 0 },
        unit: { type: String, default: 'g' }
    },
    
    // Track who created this item
    createdBy: {
        type: Number,
        ref: 'User'
    },
    createdByUsername: {
        type: String
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
    }, {
    timestamps: true
});

module.exports = mongoose.model('Item', nutritionFactsSchema);
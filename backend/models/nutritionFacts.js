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
        fat: { 
            type: Number, 
            required: true,
            min: 0,
            default: 0 
        },
        carbs: { 
            type: Number, 
            required: true,
            min: 0,
            default: 0 
        },
        protein: { 
            type: Number, 
            required: true,
            min: 0,
            default: 0 
        },
        unit: { 
            type: String, 
            default: 'g',
            enum: ['g', 'mg', 'mcg']  // Restrict to valid units
        }
    }
});

module.exports = mongoose.model('Item', nutritionFactsSchema);
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
        fat: Number,
        carb: Number,
        protein: Number,
        required: true,
        min: 0,
        unit: { type: Number }
    }
});

module.exports = mongoose.model('Item', nutritionFactsSchema);
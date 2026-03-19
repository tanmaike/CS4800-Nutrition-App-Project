const express = require('express');
const router = express.Router();
const Item = require('../models/nutritionFacts');

// CREATE
router.post('/items', async (req, res) => {
try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
} catch (error) {
    res.status(400).json({ message: error.message });
}
});

// READ ALL
router.get('/items', async (req, res) => {
try {
    const items = await Item.find();
    res.json(items);
} catch (error) {
    res.status(500).json({ message: error.message });
}
});

// READ ONE
router.get('/items/:id', async (req, res) => {
try {
    const item = await Item.findById(req.params.id);
    if (!item) {
    return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
} catch (error) {
    res.status(500).json({ message: error.message });
}
});

// UPDATE 
router.put('/items/:id', async (req, res) => {
try {
    const updatedItem = await Item.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
    );
    if (!updatedItem) {
        return res.status(404).json({ message: 'Item not found' });
    }
    res.json(updatedItem);
} catch (error) {
    res.status(400).json({ message: error.message });
}
});

// DELETE 
router.delete('/items/:id', async (req, res) => {
try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
    return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
} catch (error) {
    res.status(500).json({ message: error.message });
}
});

module.exports = router;
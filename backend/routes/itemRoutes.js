const express = require('express');
const router = express.Router();
const Item = require('../models/nutritionFacts');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    next();
};

// CREATE - requires authentication
router.post('/items', requireAuth, async (req, res) => {
    try {
        const newItem = new Item({
            ...req.body,
            createdBy: req.session.user.userId,
            createdByUsername: req.session.user.username
        });
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(400).json({ message: error.message });
    }
});

// READ ALL - public
router.get('/items', async (req, res) => {
    try {
        const items = await Item.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: error.message });
    }
});

// READ ONE - public
router.get('/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).json({ message: error.message });
    }
});

// UPDATE - requires authentication
router.put('/items/:id', requireAuth, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        
        const updatedItem = await Item.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(400).json({ message: error.message });
    }
});

// DELETE - requires authentication
router.delete('/items/:id', requireAuth, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        
        await item.deleteOne();
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
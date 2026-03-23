const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// Middleware to check authentication (only for adding/editing)
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    next();
};

// CREATE location - requires authentication
router.post('/locations', requireAuth, async (req, res) => {
    try {
        const { name, coordinates, macrolocation, isPublic } = req.body;
        
        // Validate coordinates
        if (!coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
            return res.status(400).json({ message: 'Valid coordinates (lat/lng) are required' });
        }
        
        const location = new Location({
            name,
            coordinates: {
                lat: coordinates.lat,
                lng: coordinates.lng
            },
            macrolocation: macrolocation || 'Other',
            isPublic: isPublic !== false, // Default to true if not specified
            createdBy: req.session.user.userId,
            createdByUsername: req.session.user.username
        });
        
        await location.save();
        res.status(201).json(location);
    } catch (error) {
        console.error('Error creating location:', error);
        res.status(500).json({ message: 'Error creating location', error: error.message });
    }
});

// GET all locations - public (no authentication required)
router.get('/locations', async (req, res) => {
    try {
        // Show all public locations, plus user's private locations if logged in
        const query = req.session.user 
            ? { $or: [{ isPublic: true }, { createdBy: req.session.user.userId }] }
            : { isPublic: true };
        
        const locations = await Location.find(query).sort({ macrolocation: 1, name: 1 });
        res.json(locations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching locations', error: error.message });
    }
});

// GET locations by macrolocation - public
router.get('/locations/macrolocation/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const query = { macrolocation: type, isPublic: true };
        
        if (req.session.user) {
            query.$or = [{ isPublic: true }, { createdBy: req.session.user.userId }];
        }
        
        const locations = await Location.find(query).sort({ name: 1 });
        res.json(locations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching locations', error: error.message });
    }
});

// GET single location - public (no authentication required)
router.get('/locations/:id', async (req, res) => {
    try {
        const location = await Location.findById(req.params.id);
        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }
        
        // Check if user has permission to view private location
        if (!location.isPublic && (!req.session.user || location.createdBy !== req.session.user.userId)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        res.json(location);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching location', error: error.message });
    }
});

// UPDATE location - requires authentication and ownership
router.put('/locations/:id', requireAuth, async (req, res) => {
    try {
        const location = await Location.findById(req.params.id);
        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }
        
        // Check ownership
        if (location.createdBy !== req.session.user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        const { name, coordinates, macrolocation, isPublic } = req.body;
        
        const updateData = { name, macrolocation, isPublic };
        if (coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number') {
            updateData.coordinates = coordinates;
        }
        
        const updatedLocation = await Location.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        res.json(updatedLocation);
    } catch (error) {
        res.status(500).json({ message: 'Error updating location', error: error.message });
    }
});

// DELETE location - requires authentication and ownership
router.delete('/locations/:id', requireAuth, async (req, res) => {
    try {
        const location = await Location.findById(req.params.id);
        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }
        
        // Check ownership
        if (location.createdBy !== req.session.user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        await location.deleteOne();
        res.json({ message: 'Location deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting location', error: error.message });
    }
});

// Calculate distance between two points - public (no authentication required)
router.post('/calculate-distance', async (req, res) => {
    try {
        const { originId, destinationId } = req.body;
        
        const origin = await Location.findById(originId);
        const destination = await Location.findById(destinationId);
        
        if (!origin || !destination) {
            return res.status(404).json({ message: 'Location(s) not found' });
        }
        
        // Calculate distance using Haversine formula
        const distanceMiles = calculateDistance(
            origin.coordinates.lat, origin.coordinates.lng,
            destination.coordinates.lat, destination.coordinates.lng
        );
        
        const distanceSteps = distanceMiles * 2112; // 1 mile = 2112 steps (30-inch intervals)
        
        // Calculate estimated walking time (average 3 mph)
        const walkingTimeHours = distanceMiles / 3;
        const walkingTimeMinutes = Math.round(walkingTimeHours * 60);
        
        res.json({
            origin: {
                id: origin._id,
                name: origin.name,
                coordinates: origin.coordinates,
                macrolocation: origin.macrolocation
            },
            destination: {
                id: destination._id,
                name: destination.name,
                coordinates: destination.coordinates,
                macrolocation: destination.macrolocation
            },
            distance: {
                miles: distanceMiles.toFixed(2),
                kilometers: (distanceMiles * 1.60934).toFixed(2),
                steps: Math.round(distanceSteps),
                stepsFormatted: Math.round(distanceSteps).toLocaleString(),
                duration: {
                    text: walkingTimeMinutes < 60 
                        ? `${walkingTimeMinutes} minutes` 
                        : `${Math.floor(walkingTimeMinutes / 60)} hour ${walkingTimeMinutes % 60} minutes`,
                    minutes: walkingTimeMinutes
                }
            }
        });
        
    } catch (error) {
        console.error('Distance calculation error:', error);
        res.status(500).json({ message: 'Error calculating distance', error: error.message });
    }
});

// Haversine formula to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

module.exports = router;
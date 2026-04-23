const express = require('express');
const router = express.Router();
const Farm = require('../models/Farm');
const { createPolygon, getNDVI } = require('../services/agroService');

// @route   GET /api/farms
// @desc    Get all registered farms
router.get('/', async (req, res) => {
  try {
    const farms = await Farm.find().sort({ createdAt: -1 });
    res.json(farms);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/farms
// @desc    Register a new farm boundary
router.post('/', async (req, res) => {
  const { name, coordinates } = req.body;

  try {
    // 1. Prepare GeoJSON
    const geojson = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: coordinates // Expects [ [ [lng, lat], ... ] ]
      }
    };

    // 2. Register with Satellite API
    const agroData = await createPolygon(name, geojson);

    // 3. Save to MongoDB
    const newFarm = new Farm({
      name,
      polygon: {
        type: 'Polygon',
        coordinates: coordinates
      },
      agroPolygonId: agroData.id
    });

    const savedFarm = await newFarm.save();
    res.json(savedFarm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to register farm' });
  }
});

// @route   GET /api/farms/:id/analysis
// @desc    Get satellite analysis for a farm
router.get('/:id/analysis', async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) return res.status(404).json({ message: 'Farm not found' });

    const ndviData = await getNDVI(farm.agroPolygonId);
    res.json({ farm, ndviData });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analysis' });
  }
});

module.exports = router;

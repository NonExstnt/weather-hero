const express = require('express');
const { WeatherService } = require('../services/weatherService');

const router = express.Router();
const weatherService = new WeatherService();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Get weather by coordinates
router.get('/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    let latitude;
    let longitude;

    // Parse coordinates if provided
    if (lat && lon) {
      latitude = parseFloat(lat);
      longitude = parseFloat(lon);

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({
          success: false,
          error:
            'Invalid coordinates. Latitude and longitude must be valid numbers.',
        });
      }

      // Validate coordinate ranges
      if (latitude < -90 || latitude > 90) {
        return res.status(400).json({
          success: false,
          error: 'Invalid latitude. Must be between -90 and 90.',
        });
      }

      if (longitude < -180 || longitude > 180) {
        return res.status(400).json({
          success: false,
          error: 'Invalid longitude. Must be between -180 and 180.',
        });
      }
    }

    const result = await weatherService.getWeatherForLocation(
      latitude,
      longitude
    );

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('Weather API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

module.exports = router;
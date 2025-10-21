const request = require('supertest');
const express = require('express');

// Create mock weather service instance
const mockGetWeatherForLocation = jest.fn();

// Mock the WeatherService before requiring routes
jest.mock('../services/weatherService', () => {
  return {
    WeatherService: jest.fn().mockImplementation(() => {
      return {
        getWeatherForLocation: mockGetWeatherForLocation,
      };
    }),
  };
});

// Mock config
jest.mock('../config', () => ({
  openWeatherApiKey: 'test-api-key',
  openWeatherBaseUrl: 'https://api.openweathermap.org/data/2.5',
}));

const apiRoutes = require('../routes/api');

describe('API Routes', () => {
  let app;

  beforeEach(() => {
    // Create a new Express app for testing
    app = express();
    app.use(express.json());
    app.use('/api', apiRoutes);

    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api/weather', () => {
    it('should return weather data with valid coordinates', async () => {
      const mockWeatherData = {
        success: true,
        data: {
          location: {
            name: 'Sydney',
            country: 'AU',
            lat: -33.8688,
            lon: 151.2093,
          },
          current: {
            temperature: 25,
            feelsLike: 24,
            humidity: 55,
            pressure: 1015,
            windSpeed: 4.5,
            windDirection: 90,
            visibility: 10,
            uvIndex: 0,
            description: 'clear sky',
            icon: '01d',
          },
        },
      };

      mockGetWeatherForLocation.mockResolvedValue(mockWeatherData);

      const response = await request(app)
        .get('/api/weather')
        .query({ lat: '-33.8688', lon: '151.2093' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.location.name).toBe('Sydney');
      expect(mockGetWeatherForLocation).toHaveBeenCalledWith(
        -33.8688,
        151.2093
      );
    });

    it('should return weather data without coordinates (using defaults)', async () => {
      const mockWeatherData = {
        success: true,
        data: {
          location: {
            name: 'Melbourne',
            country: 'AU',
            lat: -37.8136,
            lon: 144.9631,
          },
          current: {
            temperature: 22,
            feelsLike: 21,
            humidity: 60,
            pressure: 1013,
            windSpeed: 5.5,
            windDirection: 180,
            visibility: 10,
            uvIndex: 0,
            description: 'partly cloudy',
            icon: '02d',
          },
        },
      };

      mockGetWeatherForLocation.mockResolvedValue(mockWeatherData);

      const response = await request(app).get('/api/weather');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockGetWeatherForLocation).toHaveBeenCalledWith(
        undefined,
        undefined
      );
    });

    it('should return 400 for invalid latitude', async () => {
      const response = await request(app)
        .get('/api/weather')
        .query({ lat: 'invalid', lon: '151.2093' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid coordinates');
    });

    it('should return 400 for invalid longitude', async () => {
      const response = await request(app)
        .get('/api/weather')
        .query({ lat: '-33.8688', lon: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid coordinates');
    });

    it('should return 400 for latitude out of range', async () => {
      const response = await request(app)
        .get('/api/weather')
        .query({ lat: '100', lon: '151.2093' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid latitude');
    });

    it('should return 400 for longitude out of range', async () => {
      const response = await request(app)
        .get('/api/weather')
        .query({ lat: '-33.8688', lon: '200' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid longitude');
    });

    it('should handle service errors gracefully', async () => {
      mockGetWeatherForLocation.mockResolvedValue({
        success: false,
        error: 'API error',
      });

      const response = await request(app)
        .get('/api/weather')
        .query({ lat: '-33.8688', lon: '151.2093' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    it('should handle unexpected errors', async () => {
      mockGetWeatherForLocation.mockRejectedValue(new Error('Unexpected error'));

      const response = await request(app)
        .get('/api/weather')
        .query({ lat: '-33.8688', lon: '151.2093' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Internal server error');
    });
  });
});

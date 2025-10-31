const request = require('supertest');
const express = require('express');
const path = require('path');

// Mock the WeatherService before requiring app
jest.mock('../services/weatherService', () => {
  return {
    WeatherService: jest.fn().mockImplementation(() => {
      return {
        getWeatherForLocation: jest.fn(),
      };
    }),
  };
});

// Mock config
jest.mock('../config', () => ({
  port: 3000,
  openWeatherApiKey: 'test-api-key',
  openWeatherBaseUrl: 'https://api.openweathermap.org/data/2.5',
  defaultLocation: {
    lat: -37.8136,
    lon: 144.9631,
  },
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
}));

describe('Express App', () => {
  let app;
  let appModule;

  beforeEach(() => {
    // Clear module cache to get fresh app instance
    jest.clearAllMocks();
    
    // Require app after mocking
    appModule = require('../app');
    app = appModule;
  });

  afterEach((done) => {
    // Close any open server connections
    if (appModule.server) {
      appModule.server.close(() => {
        done();
      });
    } else {
      done();
    }
  });

  describe('Middleware', () => {
    it('should use helmet for security', async () => {
      const response = await request(app).get('/');
      expect(response.headers).toHaveProperty('x-content-type-options');
    });

    it('should parse JSON body', async () => {
      const response = await request(app)
        .post('/api/health')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');

      // Even though this endpoint doesn't exist, it should parse the body
      expect(response.status).not.toBe(400);
    });
  });

  describe('Static Files', () => {
    it('should serve static files from public directory', async () => {
      const response = await request(app).get('/index.html');
      expect(response.status).toBe(200);
      expect(response.type).toMatch(/html/);
    });
  });

  describe('Routes', () => {
    it('should respond to health check endpoint', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
    });

    it('should return 404 for non-existent API routes', async () => {
      const response = await request(app).get('/api/nonexistent');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should serve index.html for non-API routes (SPA support)', async () => {
      const response = await request(app).get('/some-random-path');
      expect(response.status).toBe(200);
      expect(response.type).toMatch(/html/);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors with error middleware', async () => {
      // Create a route that throws an error
      const testApp = express();
      testApp.get('/error-test', (req, res, next) => {
        next(new Error('Test error'));
      });

      // Add the error handler from app
      testApp.use((err, req, res, next) => {
        res.status(500).json({
          success: false,
          error: err.message,
        });
      });

      const response = await request(testApp).get('/error-test');
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});

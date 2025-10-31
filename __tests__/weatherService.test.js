const axios = require('axios');

// Mock axios
jest.mock('axios');

// Mock config module
jest.mock('../config', () => ({
  openWeatherApiKey: 'test-api-key',
  openWeatherBaseUrl: 'https://api.openweathermap.org/data/2.5',
  defaultLocation: {
    lat: -37.8136,
    lon: 144.9631,
    name: 'Melbourne',
    country: 'AU',
  },
}));

const { WeatherService } = require('../services/weatherService');

describe('WeatherService', () => {
  let weatherService;

  beforeEach(() => {
    weatherService = new WeatherService();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with API key and base URL', () => {
      expect(weatherService.apiKey).toBe('test-api-key');
      expect(weatherService.baseUrl).toBe('https://api.openweathermap.org/data/2.5');
    });
  });

  describe('transformWeatherData', () => {
    it('should transform API response data correctly', () => {
      const mockApiData = {
        name: 'Melbourne',
        sys: { country: 'AU' },
        coord: { lat: -37.8136, lon: 144.9631 },
        main: {
          temp: 22.5,
          feels_like: 21.3,
          humidity: 60,
          pressure: 1013,
        },
        wind: { speed: 5.5, deg: 180 },
        visibility: 10000,
        weather: [
          { description: 'clear sky', icon: '01d' },
        ],
      };

      const result = weatherService.transformWeatherData(mockApiData);

      expect(result).toEqual({
        location: {
          name: 'Melbourne',
          country: 'AU',
          lat: -37.8136,
          lon: 144.9631,
        },
        current: {
          temperature: 23,
          feelsLike: 21,
          humidity: 60,
          pressure: 1013,
          windSpeed: 5.5,
          windDirection: 180,
          visibility: 10,
          uvIndex: 0,
          description: 'clear sky',
          icon: '01d',
        },
      });
    });

    it('should handle missing weather data gracefully', () => {
      const mockApiData = {
        name: 'TestCity',
        sys: { country: 'US' },
        coord: { lat: 0, lon: 0 },
        main: {
          temp: 20,
          feels_like: 19,
          humidity: 50,
          pressure: 1000,
        },
        wind: { speed: 3, deg: 90 },
        visibility: 5000,
        weather: [],
      };

      const result = weatherService.transformWeatherData(mockApiData);

      expect(result.current.description).toBe('Unknown');
      expect(result.current.icon).toBe('01d');
    });
  });

  describe('getWeatherByCoordinates', () => {
    it('should fetch weather data successfully', async () => {
      const mockResponse = {
        data: {
          name: 'Sydney',
          sys: { country: 'AU' },
          coord: { lat: -33.8688, lon: 151.2093 },
          main: {
            temp: 25,
            feels_like: 24,
            humidity: 55,
            pressure: 1015,
          },
          wind: { speed: 4.5, deg: 90 },
          visibility: 10000,
          weather: [
            { description: 'partly cloudy', icon: '02d' },
          ],
        },
      };

      axios.get.mockResolvedValue(mockResponse);

      const result = await weatherService.getWeatherByCoordinates({
        lat: -33.8688,
        lon: 151.2093,
      });

      expect(result.success).toBe(true);
      expect(result.data.location.name).toBe('Sydney');
      expect(result.data.current.temperature).toBe(25);
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.openweathermap.org/data/2.5/weather',
        expect.objectContaining({
          params: {
            lat: -33.8688,
            lon: 151.2093,
            appid: 'test-api-key',
            units: 'metric',
          },
          timeout: 5000,
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));

      const result = await weatherService.getWeatherByCoordinates({
        lat: -33.8688,
        lon: 151.2093,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('getWeatherForLocation', () => {
    it('should use provided coordinates', async () => {
      const mockResponse = {
        data: {
          name: 'Test',
          sys: { country: 'US' },
          coord: { lat: 40, lon: -74 },
          main: { temp: 20, feels_like: 19, humidity: 50, pressure: 1000 },
          wind: { speed: 3, deg: 90 },
          visibility: 10000,
          weather: [{ description: 'clear', icon: '01d' }],
        },
      };

      axios.get.mockResolvedValue(mockResponse);

      await weatherService.getWeatherForLocation(40, -74);

      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            lat: 40,
            lon: -74,
          }),
        })
      );
    });

    it('should use default coordinates when not provided', async () => {
      const mockResponse = {
        data: {
          name: 'Melbourne',
          sys: { country: 'AU' },
          coord: { lat: -37.8136, lon: 144.9631 },
          main: { temp: 20, feels_like: 19, humidity: 50, pressure: 1000 },
          wind: { speed: 3, deg: 90 },
          visibility: 10000,
          weather: [{ description: 'clear', icon: '01d' }],
        },
      };

      axios.get.mockResolvedValue(mockResponse);

      await weatherService.getWeatherForLocation();

      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            lat: -37.8136,
            lon: 144.9631,
          }),
        })
      );
    });
  });

  describe('getWeatherIconUrl', () => {
    it('should return correct icon URL', () => {
      const iconUrl = weatherService.getWeatherIconUrl('01d');
      expect(iconUrl).toBe('https://openweathermap.org/img/wn/01d@2x.png');
    });
  });
});

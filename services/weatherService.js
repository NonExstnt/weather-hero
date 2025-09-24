const axios = require('axios');
const config = require('../config');

class WeatherService {
  constructor() {
    this.apiKey = config.openWeatherApiKey;
    this.baseUrl = config.openWeatherBaseUrl;

    if (!this.apiKey) {
      throw new Error(
        'OpenWeather API key is required. Please set OPENWEATHER_API_KEY environment variable.'
      );
    }
  }

  async getWeatherByCoordinates(coordinates) {
    try {
      const { lat, lon } = coordinates;

      const response = await axios.get(
        `${this.baseUrl}/weather`,
        {
          params: {
            lat,
            lon,
            appid: this.apiKey,
            units: 'metric',
          },
          timeout: 5000,
        }
      );

      const weatherData = this.transformWeatherData(response.data);

      return {
        success: true,
        data: weatherData,
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch weather data',
      };
    }
  }

  async getWeatherForLocation(lat, lon) {
    const coordinates = {
      lat: lat ?? config.defaultLocation.lat,
      lon: lon ?? config.defaultLocation.lon,
    };

    return this.getWeatherByCoordinates(coordinates);
  }

  transformWeatherData(data) {
    return {
      location: {
        name: data.name,
        country: data.sys.country,
        lat: data.coord.lat,
        lon: data.coord.lon,
      },
      current: {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        visibility: data.visibility / 1000, // Convert to km
        uvIndex: 0, // Not available in current weather API
        description: data.weather[0]?.description || 'Unknown',
        icon: data.weather[0]?.icon || '01d',
      },
    };
  }

  getWeatherIconUrl(icon) {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }
}

module.exports = { WeatherService };
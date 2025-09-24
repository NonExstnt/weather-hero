const dotenv = require('dotenv');

dotenv.config();

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY || '',
  openWeatherBaseUrl: 'https://api.openweathermap.org/data/2.5',
  defaultLocation: {
    lat: -37.8136,
    lon: 144.9631,
    name: 'Melbourne',
    country: 'AU',
  },
  cors: {
    origin: process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',')
      : process.env.NODE_ENV === 'production'
        ? [process.env.WEBSITE_HOSTNAME ? `https://${process.env.WEBSITE_HOSTNAME}` : 'https://yourdomain.azurewebsites.net']
        : ['http://localhost:3000'],
    credentials: true,
  },
};

module.exports = config;
# Weather Hero - Node.js

A simple Node.js weather application that provides current weather information based on user location or default coordinates.

## Features

- 🌦️ Real-time weather data from OpenWeather API
- 📍 Geolocation support for automatic location detection
- 🎨 Beautiful responsive UI with weather icons
- 🔄 Refresh and manual location selection (In Development)
- 🌡️ Temperature, humidity, wind, and pressure information
- 📱 Mobile-friendly design

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nodejs-ghactions
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenWeather API key:
   ```
   OPENWEATHER_API_KEY=your_api_key_here
   ```

4. **Get your OpenWeather API key**
   - Visit [OpenWeather API](https://openweathermap.org/api)
   - Sign up for a free account
   - Get your API key from the dashboard

5. **Start the application**
   ```bash
   npm start
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/weather` - Get weather for default location
- `GET /api/weather?lat={latitude}&lon={longitude}` - Get weather for specific coordinates

## Project Structure

```
nodejs-ghactions/
├── app.js                 # Main application server
├── config.js              # Configuration settings
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
├── public/                # Static frontend files
│   ├── index.html         # Main HTML page
│   ├── js/app.js          # Frontend JavaScript
│   └── stylesheets/style.css # CSS styles
├── routes/
│   ├── index.js           # Main page route
│   └── api.js             # API routes
└── services/
    └── weatherService.js  # Weather API service
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **API**: OpenWeather API
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Security**: Helmet.js for security headers
- **HTTP Client**: Axios for API requests

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `OPENWEATHER_API_KEY` | OpenWeather API key | (required) |
| `CORS_ORIGIN` | Allowed CORS origins | localhost:3000 |

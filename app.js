const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const config = require('./config');
const apiRoutes = require('./routes/api');
const indexRouter = require('./routes/index');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://openweathermap.org"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
}));

// CORS middleware
app.use(cors(config.cors));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
const publicPath = path.join(__dirname, 'public');
console.log(`📁 Static files path: ${publicPath}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

app.use(express.static(publicPath));

// Routes
app.use('/', indexRouter);
app.use('/api', apiRoutes);

// Serve the main HTML file for all non-API routes (SPA support)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  } else {
    const indexPath = path.join(__dirname, 'public/index.html');
    return res.sendFile(indexPath);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// Start server
const server = app.listen(config.port, () => {
  console.log(`🌦️  Weather server running on port ${config.port}`);
  console.log(`🔗  Access the app at http://localhost:${config.port}`);
  
  if (!config.openWeatherApiKey) {
    console.warn('⚠️  Warning: OPENWEATHER_API_KEY not set. The app will not work properly.');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;

# Weather Hero Test Suite

This directory contains the test suite for the Weather Hero application.

## Running Tests

```bash
npm test
```

This will run all tests with coverage reporting.

## Test Files

### `weatherService.test.js`
Tests for the `WeatherService` class that handles weather data fetching and transformation.

**Coverage:**
- Constructor initialization
- Data transformation from OpenWeather API format
- Fetching weather by coordinates
- Using default location when coordinates not provided
- Error handling for API failures
- Weather icon URL generation

### `api.test.js`
Tests for the API routes in `/routes/api.js`.

**Coverage:**
- Health check endpoint (`GET /api/health`)
- Weather endpoint with valid coordinates (`GET /api/weather`)
- Weather endpoint without coordinates (defaults)
- Input validation (invalid coordinates, out-of-range values)
- Error handling (service errors, unexpected errors)

### `app.test.js`
Tests for the main Express application configuration.

**Coverage:**
- Security middleware (Helmet)
- JSON body parsing
- Static file serving
- Route handling
- API route 404 handling
- SPA support (serving index.html for non-API routes)
- Error handling middleware

### `config.test.js`
Tests for the application configuration module.

**Coverage:**
- Default configuration values
- Port configuration
- API key configuration
- Default location settings
- CORS configuration
- Environment variable parsing

## Test Coverage

Current test coverage:
- **Statements:** ~88%
- **Branches:** ~75%
- **Functions:** ~60%
- **Lines:** ~88%

## Technologies Used

- **Jest**: Testing framework
- **Supertest**: HTTP assertion library for testing Express routes
- **Axios Mocking**: For mocking external API calls

## Best Practices

- All external dependencies (axios, config) are mocked
- Tests are isolated and don't depend on external services
- Each test file focuses on a specific module
- Tests include both success and error scenarios
- Input validation is thoroughly tested

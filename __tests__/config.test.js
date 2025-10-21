const config = require('../config');

describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should have default port value', () => {
    expect(config.port).toBeDefined();
    expect(typeof config.port).toBe('number');
  });

  it('should have openWeatherApiKey property', () => {
    expect(config).toHaveProperty('openWeatherApiKey');
  });

  it('should have correct openWeatherBaseUrl', () => {
    expect(config.openWeatherBaseUrl).toBe('https://api.openweathermap.org/data/2.5');
  });

  it('should have default location configuration', () => {
    expect(config.defaultLocation).toEqual({
      lat: -37.8136,
      lon: 144.9631,
      name: 'Melbourne',
      country: 'AU',
    });
  });

  it('should have CORS configuration', () => {
    expect(config.cors).toBeDefined();
    expect(config.cors).toHaveProperty('origin');
    expect(config.cors).toHaveProperty('credentials', true);
  });

  it('should parse port from environment variable', () => {
    const customPort = 8080;
    process.env.PORT = String(customPort);
    
    // Re-require config to pick up new environment
    delete require.cache[require.resolve('../config')];
    const newConfig = require('../config');
    
    expect(newConfig.port).toBe(customPort);
  });
});

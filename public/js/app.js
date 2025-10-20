// Weather Hero - Frontend Application
class WeatherApp {
    constructor() {
        this.loadingEl = document.getElementById('loading');
        this.weatherDisplayEl = document.getElementById('weather-display');
        this.errorDisplayEl = document.getElementById('error-display');
        
        this.init();
    }

    async init() {
        console.log('🌦️ Weather Hero starting...');
        
        // Try to get user's location first
        if (navigator.geolocation) {
            this.showLoading('Getting your location...');
            navigator.geolocation.getCurrentPosition(
                (position) => this.getWeatherByCoords(position.coords.latitude, position.coords.longitude),
                (error) => {
                    console.warn('Geolocation failed:', error.message);
                    this.getDefaultWeather();
                },
                { timeout: 10000, enableHighAccuracy: true }
            );
        } else {
            console.warn('Geolocation not supported');
            this.getDefaultWeather();
        }
    }

    showLoading(message = 'Getting your weather...') {
        this.loadingEl.style.display = 'block';
        this.weatherDisplayEl.style.display = 'none';
        this.errorDisplayEl.style.display = 'none';
        
        const loadingText = this.loadingEl.querySelector('p');
        if (loadingText) {
            loadingText.textContent = message;
        }
    }

    showWeather(data) {
        this.loadingEl.style.display = 'none';
        this.weatherDisplayEl.style.display = 'block';
        this.errorDisplayEl.style.display = 'none';

        // Update location
        document.getElementById('location-name').textContent = data.location.name;
        document.getElementById('location-coords').textContent = 
            `${data.location.lat.toFixed(2)}°, ${data.location.lon.toFixed(2)}°`;

        // Update current weather
        document.getElementById('temperature').textContent = Math.round(data.current.temperature);
        document.getElementById('weather-description').textContent = data.current.description;
        
        // Update weather icon
        const iconEl = document.getElementById('weather-icon');
        iconEl.src = `https://openweathermap.org/img/wn/${data.current.icon}@2x.png`;
        iconEl.alt = data.current.description;

        // Update details
        document.getElementById('feels-like').textContent = `${Math.round(data.current.feelsLike)}°C`;
        document.getElementById('humidity').textContent = `${data.current.humidity}%`;
        document.getElementById('wind').textContent = `${(data.current.windSpeed * 3.6).toFixed(1)} km/h`;
        document.getElementById('pressure').textContent = `${data.current.pressure} hPa`;
    }

    showError(message) {
        this.loadingEl.style.display = 'none';
        this.weatherDisplayEl.style.display = 'none';
        this.errorDisplayEl.style.display = 'block';
        
        document.getElementById('error-message').textContent = message;
    }

    async getWeatherByCoords(lat, lon) {
        try {
            this.showLoading('Fetching weather data...');
            
            const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
            const data = await response.json();

            if (data.success) {
                this.showWeather(data.data);
            } else {
                this.showError(data.error || 'Failed to get weather data');
            }
        } catch (error) {
            console.error('Weather fetch error:', error);
            this.showError('Network error. Please check your connection.');
        }
    }

    async getDefaultWeather() {
        try {
            this.showLoading('Loading default weather...');
            
            const response = await fetch('/api/weather');
            const data = await response.json();

            if (data.success) {
                this.showWeather(data.data);
            } else {
                this.showError(data.error || 'Failed to get weather data');
            }
        } catch (error) {
            console.error('Default weather fetch error:', error);
            this.showError('Failed to load weather data');
        }
    }
}

// Global functions for buttons
function refreshWeather() {
    if (window.weatherApp) {
        window.weatherApp.init();
    }
}

function requestLocation() {
    if (navigator.geolocation) {
        window.weatherApp.showLoading('Getting your location...');
        navigator.geolocation.getCurrentPosition(
            (position) => window.weatherApp.getWeatherByCoords(position.coords.latitude, position.coords.longitude),
            (error) => {
                console.warn('Geolocation failed:', error.message);
                window.weatherApp.showError('Location access denied. Using default location.');
                setTimeout(() => window.weatherApp.getDefaultWeather(), 2000);
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    } else {
        window.weatherApp.showError('Geolocation not supported by your browser');
    }
}

function getCapitalWeather(cityName, lat, lon) {
    if (window.weatherApp) {
        window.weatherApp.showLoading(`Getting weather for ${cityName}...`);
        window.weatherApp.getWeatherByCoords(lat, lon);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.weatherApp = new WeatherApp();
    
    // Add event listeners for control buttons
    const refreshBtn = document.getElementById('refresh-btn');
    const locationBtn = document.getElementById('location-btn');
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshWeather);
    }
    
    if (locationBtn) {
        locationBtn.addEventListener('click', requestLocation);
    }
    
    // Add event listeners for all capital city buttons
    const cityButtons = document.querySelectorAll('.city-btn');
    cityButtons.forEach(button => {
        button.addEventListener('click', () => {
            const cityName = button.getAttribute('data-city');
            const lat = parseFloat(button.getAttribute('data-lat'));
            const lon = parseFloat(button.getAttribute('data-lon'));
            getCapitalWeather(cityName, lat, lon);
        });
    });
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Page became visible, refresh weather data
        setTimeout(refreshWeather, 1000);
    }
});
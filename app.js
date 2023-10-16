
const apiKey = '14e2abd7cef9aa3fe3d8c828509149fd';

// Function to fetch weather data
async function getWeatherData(cityName) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (response.ok) {
            return data;
        } else {
            throw new Error(data.message || 'Unable to fetch weather data.');
        }
    } catch (error) {
        throw new Error(error.message || 'An error occurred while fetching weather data.');
    }
}

// Function to fetch AQI data from OpenWeatherMap
async function getAQIData(latitude, longitude) {
    const aqiApiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

    try {
        const aqiResponse = await fetch(aqiApiUrl);
        const aqiData = await aqiResponse.json();

        if (aqiResponse.ok) {
            
            return aqiData.list[0].main.aqi;
        } else {
            throw new Error('Unable to fetch AQI data.');
        }
    } catch (error) {
        console.error('Error fetching AQI data:', error);
        return 'N/A';
    }
}

// Function to fetch tomorrow's weather forecast
async function getTomorrowWeather(cityName) {
    const tomorrowApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(tomorrowApiUrl);
        const data = await response.json();

        if (response.ok) {
            
            const tomorrowForecast = data.list[0];

            const temperature = tomorrowForecast.main.temp;
            const weatherDescription = tomorrowForecast.weather[0].description;

            return { temperature, description: weatherDescription };
        } else {
            throw Error(data.message || 'Unable to fetch weather data.');
        }
    } catch (error) {
        console.error('Error fetching tomorrow forecast data:', error);
        return { temperature: 'N/A', description: 'N/A' };
    }
}


// Function to update the weather details on the page
async function updateWeatherDetails(weatherData) {
    // Get elements
    const timeDayDateElement = document.getElementById('timeDayDate');
    const temperatureElement = document.getElementById('temperature');
    const weatherDescriptionElement = document.getElementById('weatherDescription');
    const locationElement = document.getElementById('location');
    const weatherIconElement = document.getElementById('weatherIcon');
    const humidityValueElement = document.getElementById('humidityValue');
    const windSpeedValueElement = document.getElementById('windSpeedValue');
    const aqiValueElement = document.getElementById('aqiValue');
    const tomorrowForecastElement = document.getElementById('tomorrowForecast');

    // Extract time, day, and date
    const currentDate = new Date();
    const options = {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };
      
      const formattedDate = currentDate.toLocaleDateString(undefined, options);
      const formattedTime = currentDate.toLocaleTimeString(undefined, options);

   
    timeDayDateElement.textContent = `${formattedTime}`;
    temperatureElement.textContent = `${Math.round(weatherData.main.temp)}°C`;
    weatherDescriptionElement.textContent = weatherData.weather[0].description;
    locationElement.textContent = weatherData.name;

   
    const weatherIconUrl = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;
    weatherIconElement.src = weatherIconUrl;


    humidityValueElement.textContent = `${weatherData.main.humidity}%`;

    windSpeedValueElement.textContent = `${weatherData.wind.speed} m/s`;

    // Fetch AQI data and tomorrow's forecast
    const aqiValue = await getAQIData(weatherData.coord.lat, weatherData.coord.lon);
    const tomorrowWeather = await getTomorrowWeather(weatherData.name);

   
    function getAQIQualitativeIndex(aqiValue) {
        if (aqiValue >= 0 && aqiValue <= 50) {
            return 'Good';
        } else if (aqiValue >= 51 && aqiValue <= 100) {
            return 'Moderate';
        } else if (aqiValue >= 101 && aqiValue <= 150) {
            return 'Unhealthy for Sensitive Groups';
        } else if (aqiValue >= 151 && aqiValue <= 200) {
            return 'Unhealthy';
        } else if (aqiValue >= 201 && aqiValue <= 300) {
            return 'Very Unhealthy';
        } else {
            return 'Hazardous';
        }
    }

    const aqiQualitativeIndex = getAQIQualitativeIndex(aqiValue);
    aqiValueElement.textContent = `${aqiQualitativeIndex} `;

    tomorrowForecastElement.textContent = `${tomorrowWeather.description}, ${Math.round(tomorrowWeather.temperature)}°C`;

    // Show the weather details view
    const initialView = document.getElementById('initialView');
    const weatherDetailsView = document.getElementById('weatherDetailsView');
    initialView.style.display = 'none';
    weatherDetailsView.style.display = 'block';
}


// Function to hide the navbar
function hideNavbar() {
    const navbar = document.querySelector('.navbar');
    navbar.style.display = 'none'; // Hide the navbar
}

// Function to show the navbar
function showNavbar() {
    const navbar = document.querySelector('.navbar');
    navbar.style.display = 'block'; // Show the navbar
}

// Event listener for the form submission (Search)
const weatherForm = document.getElementById('weatherForm');
weatherForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the form from submitting (page reload)
    const cityInput = document.getElementById('cityInput').value.trim();

    if (cityInput !== '') {
        try {
            hideNavbar(); // Hide the navbar when the form is submitted
            const weatherData = await getWeatherData(cityInput);
            updateWeatherDetails(weatherData);
        } catch (error) {
            alert(error.message);
        }
    }
});

// Event listener for the "Back" button
const backBtn = document.getElementById('backBtn');
backBtn.addEventListener('click', () => {
    showNavbar(); // Show the navbar when clicking back

    const initialView = document.getElementById('initialView');
    const weatherDetailsView = document.getElementById('weatherDetailsView');
    initialView.style.display = 'block';
    weatherDetailsView.style.display = 'none';
});

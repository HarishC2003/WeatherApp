import React, { useEffect, useState } from "react";
import "./App.css";

interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: [{ description: string; icon: string }];
  wind: { speed: number };
}

const App: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState<string>("");
  const [debouncedCity, setDebouncedCity] = useState<string>("");

  // Debounce function to limit API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCity(city);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [city]);

  // Fetch weather by city when debouncedCity changes
  useEffect(() => {
    if (debouncedCity.trim()) {
      fetchWeatherByCity(debouncedCity);
    }
  }, [debouncedCity]);

  // Fetch weather by geolocation on component mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      () => {
        setError("Location access denied. Please enter a city name.");
      }
    );
  }, []);

  // Fetch weather by coordinates
  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=6acb560ad6709f76ba33db801bb7aaa8&units=metric`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }
      const data = await response.json();
      setWeather(data);
      setError(null);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather by city name
  const fetchWeatherByCity = async (cityName: string) => {
    if (!cityName.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=6acb560ad6709f76ba33db801bb7aaa8&units=metric`
      );
      if (!response.ok) {
        throw new Error("City not found. Please try again.");
      }
      const data = await response.json();
      setWeather(data);
      setError(null);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle "Use Current Location" button click
  const handleUseCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      () => {
        setError("Location access denied. Please enter a city name.");
      }
    );
  };

  return (
    <div className="App">
      <title>☀️ Weather App 🌦️</title>
      <h1>☀️ Weather App 🌦️</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="search-bar"
        />
        <button onClick={() => fetchWeatherByCity(city)} className="search-button">
          🔍
        </button>
        <button onClick={handleUseCurrentLocation} className="search-button">
          📍 Use Current Location
        </button>
      </div>
      {loading && <div className="loader"></div>}
      {error && <p className="error">{error}</p>}
      {weather && (
        <div className="card fade-in">
          <h2>Weather in {weather.name}</h2>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={weather.weather[0].description}
            className="weather-icon"
          />
          <p>
            <strong>Temperature:</strong> {weather.main.temp}°C
          </p>
          <p>
            <strong>Humidity:</strong> {weather.main.humidity}%
          </p>
          <p>
            <strong>Condition:</strong> {weather.weather[0].description}
          </p>
          <p>
            <strong>Wind Speed:</strong> {weather.wind.speed} m/s
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
const WEATHER_API_KEY = "9f722072b74b4c9114a775080920e992";

export async function getWeather(lat, lon) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${API_KEY}`
  );

  const data = await response.json();

  return {
    temperature: data.main.temp,
    windSpeed: data.wind.speed,
    visibility: data.visibility / 1000,
    condition: data.weather[0].description,
  };
}
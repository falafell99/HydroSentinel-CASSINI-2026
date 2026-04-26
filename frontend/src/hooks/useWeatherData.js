// useWeatherData — fetches 7-day forecast from Open-Meteo for Pest County
// Endpoint: free, no API key required

import { useState, useEffect } from 'react';

export function useWeatherData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const url =
      'https://api.open-meteo.com/v1/forecast?latitude=47.5&longitude=19.0' +
      '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration,weathercode' +
      '&timezone=Europe/Budapest&forecast_days=7';

    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        setData(json.daily);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}

// WMO weathercode → emoji icon
export function weatherIcon(code) {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 9) return '🌫️';
  if (code <= 19) return '🌦️';
  if (code <= 29) return '🌧️';
  if (code <= 39) return '🌨️';
  if (code <= 49) return '🌫️';
  if (code <= 59) return '🌦️';
  if (code <= 69) return '🌧️';
  if (code <= 79) return '🌨️';
  if (code <= 84) return '🌧️';
  if (code <= 99) return '⛈️';
  return '🌤️';
}

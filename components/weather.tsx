import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windGust: number;
  conditions: string;
  location: string;
}

interface WeatherCardProps {
  location: string;
  weather: WeatherData;
}

const getWeatherIcon = (conditions: string) => {
  const condition = conditions.toLowerCase();
  
  if (condition.includes('sunny') || condition.includes('clear')) {
    return '☀️';
  } else if (condition.includes('cloudy') || condition.includes('overcast')) {
    return '☁️';
  } else if (condition.includes('rain') || condition.includes('drizzle')) {
    return '🌧️';
  } else if (condition.includes('storm') || condition.includes('thunder')) {
    return '⛈️';
  } else if (condition.includes('snow')) {
    return '❄️';
  } else if (condition.includes('fog') || condition.includes('mist')) {
    return '🌫️';
  } else {
    return '🌤️';
  }
};

const getTemperatureColor = (temp: number) => {
  if (temp < 0) return 'text-blue-600';
  if (temp < 10) return 'text-blue-500';
  if (temp < 20) return 'text-blue-400';
  if (temp < 30) return 'text-orange-500';
  return 'text-red-500';
};

export const WeatherCard: React.FC<WeatherCardProps> = ({ location, weather }) => {
  const {
    temperature,
    feelsLike,
    humidity,
    windSpeed,
    windGust,
    conditions
  } = weather;

  return (
    <Card className="w-full max-w-md bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 border-0 shadow-md my-2 gap-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {location}
          </CardTitle>
          <Badge variant="secondary" className="w-fit bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
            {conditions}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Main Weather Info - Horizontal Layout */}
        <div className="flex items-center justify-between gap-4">
          {/* Temperature Section */}
          <div className="flex items-center space-x-3">
            <div className="text-3xl">
              {getWeatherIcon(conditions)}
            </div>
            <div>
              <div className={`text-3xl font-bold ${getTemperatureColor(temperature)}`}>
                {temperature}°
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Feels like {feelsLike}°
              </div>
            </div>
          </div>

          {/* Weather Details - Horizontal */}
          <div className="flex space-x-6">
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">Humidity</div>
              <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {humidity}%
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">Wind</div>
              <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {windSpeed} km/h
              </div>
              {windGust > windSpeed && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Gusts {windGust}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-1">
          Updated: {new Date().toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherCard;

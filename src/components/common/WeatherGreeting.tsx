import { weatherGreetings } from "./greetings";
import React from "react";

interface WeatherGreetingProps {
  name?: string;
  temp: number | null;
  condition: string;
  isUSUnits: boolean;
  compact?: boolean;
}

function formatTemp(temp: number, isUSUnits: boolean): string {
  const unit = isUSUnits ? "°F" : "°C";
  return `${temp}${unit}`;
}

function pickGreeting(
  temp: number | null,
  condition: string,
  isUSUnits: boolean
) {
  if (temp === null) return weatherGreetings.neutral[0];

  // Use Celsius for logic
  const tC = isUSUnits && temp !== null ? ((temp - 32) * 5) / 9 : temp;

  if (condition === "Rain" || condition === "Drizzle") {
    return weatherGreetings.rainy[
      Math.floor(Math.random() * weatherGreetings.rainy.length)
    ];
  }
  if (condition === "Snow") {
    return weatherGreetings.snowy[
      Math.floor(Math.random() * weatherGreetings.snowy.length)
    ];
  }
  if (condition === "Thunderstorm") {
    return weatherGreetings.stormy[
      Math.floor(Math.random() * weatherGreetings.stormy.length)
    ];
  }
  if (condition === "Wind" || condition === "Squall") {
    return weatherGreetings.windy[
      Math.floor(Math.random() * weatherGreetings.windy.length)
    ];
  }
  if (tC <= 0) {
    return weatherGreetings.cold[
      Math.floor(Math.random() * weatherGreetings.cold.length)
    ];
  }
  if (tC >= 30) {
    return weatherGreetings.hot[
      Math.floor(Math.random() * weatherGreetings.hot.length)
    ];
  }
  if (condition === "Clear") {
    return weatherGreetings.clear[
      Math.floor(Math.random() * weatherGreetings.clear.length)
    ];
  }

  return weatherGreetings.neutral[
    Math.floor(Math.random() * weatherGreetings.neutral.length)
  ];
}

function getTempColor(temp: number, isFahrenheit: boolean) {
  // Convert to Celsius for consistent coloring if needed
  const tC = isFahrenheit ? ((temp - 32) * 5) / 9 : temp;
  if (tC <= 0) return "text-blue-400"; // freezing or below
  if (tC <= 10) return "text-cyan-400"; // cold
  if (tC <= 20) return "text-green-400"; // mild
  if (tC <= 28) return "text-yellow-400"; // warm
  if (tC <= 35) return "text-orange-400"; // hot
  return "text-red-500"; // very hot
}

export function WeatherGreeting({
  temp,
  condition,
  isUSUnits,
  compact = false,
}: WeatherGreetingProps) {
  if (temp === null) {
    return <span>Welcome!</span>;
  }

  const greeting = pickGreeting(temp, condition, isUSUnits);
  const formattedTemp = formatTemp(temp, isUSUnits);

  if (compact) {
    // Extract the emoji (last emoji in the greeting string)
    const emojiMatch = greeting.match(
      /([\p{Emoji}\uFE0F\u200D\u20E3\u2600-\u27BF\uD83C-\uDBFF\uDC00-\uDFFF!\u0021-\u007E])\s*$/u
    );
    const emoji = emojiMatch ? emojiMatch[1] : "";
    return (
      <span className="flex items-center gap-1">
        <span className={getTempColor(temp, isUSUnits) + " font-semibold"}>
          {formattedTemp}
        </span>
        <span>{emoji}</span>
      </span>
    );
  }

  // Split the greeting into parts based on the temperature placeholder
  const parts = greeting.split("{temp}");

  if (parts.length === 1) {
    // No temperature in the greeting
    return <span>{greeting}</span>;
  }

  // Reconstruct the greeting with colored temperature
  return (
    <span>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {part}
          {index < parts.length - 1 && (
            <span className={getTempColor(temp, isUSUnits) + " font-semibold"}>
              {formattedTemp}
            </span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
}

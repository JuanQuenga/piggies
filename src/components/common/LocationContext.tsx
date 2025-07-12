"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface LocationState {
  isLocationEnabled: boolean;
  currentCity: string;
  geoPermission: "prompt" | "granted" | "denied";
  coordinates: { lat: number; lng: number } | null;
  isLoading: boolean;
}

interface LocationContextType {
  locationState: LocationState;
  enableLocation: () => Promise<void>;
  disableLocation: () => void;
  requestLocationPermission: () => Promise<void>;
  updateCoordinates: (coords: { lat: number; lng: number }) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [locationState, setLocationState] = useState<LocationState>({
    isLocationEnabled: false,
    currentCity: "Unknown",
    geoPermission: "prompt",
    coordinates: null,
    isLoading: false,
  });

  // Initialize location enabled from localStorage
  useEffect(() => {
    const savedLocationEnabled = localStorage.getItem("locationEnabled");
    if (savedLocationEnabled !== null) {
      setLocationState((prev) => ({
        ...prev,
        isLocationEnabled: savedLocationEnabled === "true",
      }));
    }
  }, []);

  // Track geolocation permission
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setLocationState((prev) => ({
          ...prev,
          geoPermission: result.state,
        }));
        result.onchange = () =>
          setLocationState((prev) => ({
            ...prev,
            geoPermission: result.state,
          }));
      });
    }
  }, []);

  // Get current city from weather API when location is enabled and permission is granted
  useEffect(() => {
    if (
      !locationState.isLocationEnabled ||
      !navigator.geolocation ||
      locationState.geoPermission !== "granted"
    ) {
      setLocationState((prev) => ({
        ...prev,
        currentCity: "Unknown",
      }));
      return;
    }

    // Automatically get location if permission is already granted
    setLocationState((prev) => ({
      ...prev,
      currentCity: "Loading...",
    }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Update coordinates
          setLocationState((prev) => ({
            ...prev,
            coordinates: { lat, lng },
          }));

          // Get city name from weather API
          const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
          if (!apiKey) {
            setLocationState((prev) => ({
              ...prev,
              currentCity: "Unknown",
            }));
            return;
          }

          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`
          );
          if (!res.ok) throw new Error("Weather fetch failed");
          const data = await res.json();

          setLocationState((prev) => ({
            ...prev,
            currentCity: data.name,
          }));
        } catch (e) {
          console.error("Error fetching weather:", e);
          setLocationState((prev) => ({
            ...prev,
            currentCity: "Unknown",
          }));
        }
      },
      (err) => {
        console.error("Error getting location for weather:", {
          error: err,
          code: err?.code,
          message: err?.message,
          toString: err?.toString(),
        });
        setLocationState((prev) => ({
          ...prev,
          currentCity: "Unknown",
        }));
      }
    );
  }, [locationState.isLocationEnabled, locationState.geoPermission]);

  const enableLocation = async () => {
    setLocationState((prev) => ({
      ...prev,
      isLoading: true,
    }));

    try {
      if (locationState.geoPermission === "granted") {
        // Permission already granted, get location
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            setLocationState((prev) => ({
              ...prev,
              isLocationEnabled: true,
              coordinates: { lat, lng },
              isLoading: false,
            }));

            // Save to localStorage
            localStorage.setItem("locationEnabled", "true");

            // Get city name
            try {
              const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
              if (apiKey) {
                const res = await fetch(
                  `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`
                );
                if (res.ok) {
                  const data = await res.json();
                  setLocationState((prev) => ({
                    ...prev,
                    currentCity: data.name,
                  }));
                }
              }
            } catch (e) {
              console.error("Error fetching city name:", e);
            }
          },
          (err) => {
            console.error("Error getting location:", {
              error: err,
              code: err?.code,
              message: err?.message,
              toString: err?.toString(),
            });
            setLocationState((prev) => ({
              ...prev,
              isLoading: false,
            }));
          }
        );
      } else {
        // Request permission first
        await requestLocationPermission();
      }
    } catch (error) {
      console.error("Error enabling location:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      setLocationState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  const disableLocation = () => {
    setLocationState((prev) => ({
      ...prev,
      isLocationEnabled: false,
      currentCity: "Unknown",
      coordinates: null,
    }));
    localStorage.setItem("locationEnabled", "false");
  };

  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }

    return new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationState((prev) => ({
            ...prev,
            geoPermission: "granted",
          }));
          resolve();
        },
        () => {
          setLocationState((prev) => ({
            ...prev,
            geoPermission: "denied",
          }));
          reject(new Error("Location permission denied"));
        }
      );
    });
  };

  const updateCoordinates = (coords: { lat: number; lng: number }) => {
    setLocationState((prev) => ({
      ...prev,
      coordinates: coords,
    }));
  };

  const value: LocationContextType = {
    locationState,
    enableLocation,
    disableLocation,
    requestLocationPermission,
    updateCoordinates,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}

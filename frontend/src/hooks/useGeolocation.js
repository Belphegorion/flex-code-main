import { useState, useCallback } from 'react';

export const useGeolocation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCurrentPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLoading(false);
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (err) => {
          setLoading(false);
          const errorMessage = err.code === 1 
            ? 'Location access denied. Please enable location permissions.'
            : 'Unable to retrieve your location. Please try again.';
          setError(errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'User-Agent': 'EVENTFLEX/1.0' } }
      );
      const data = await res.json();
      return {
        address: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        city: data.address?.city || data.address?.town || data.address?.village || '',
        state: data.address?.state || '',
        country: data.address?.country || ''
      };
    } catch (error) {
      return {
        address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        city: '',
        state: '',
        country: ''
      };
    }
  }, []);

  return { getCurrentPosition, reverseGeocode, loading, error };
};

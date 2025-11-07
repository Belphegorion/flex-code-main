import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { FiMapPin, FiSearch, FiLoader } from 'react-icons/fi';
import { useGeolocation } from '../../hooks/useGeolocation';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function LocationPicker({ value, location, onChange }) {
  const loc = value || location;
  const [position, setPosition] = useState(loc ? { lat: loc.lat, lng: loc.lng } : null);
  const [address, setAddress] = useState(loc?.address || '');
  const { getCurrentPosition, reverseGeocode, loading: detecting } = useGeolocation();

  useEffect(() => {
    if (position && address && onChange) {
      onChange({ address, lat: position.lat, lng: position.lng });
    }
  }, [position, address]);

  const handleAutoDetect = async () => {
    try {
      const pos = await getCurrentPosition();
      setPosition(pos);
      const geocoded = await reverseGeocode(pos.lat, pos.lng);
      setAddress(geocoded.address);
    } catch (error) {
      console.error('Error detecting location:', error);
    }
  };

  const handleAddressSearch = async () => {
    if (!address) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'EVENTFLEX/1.0' } }
      );
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      if (data[0]) {
        setPosition({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        setAddress(data[0].display_name || address);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleMapClick = async (latlng) => {
    setPosition(latlng);
    const geocoded = await reverseGeocode(latlng.lat, latlng.lng);
    setAddress(geocoded.address);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-2 flex-1">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
            placeholder="Type address or click on map..."
            className="input-field flex-1"
          />
          <button 
            onClick={handleAddressSearch} 
            className="btn-primary flex items-center gap-2"
            title="Search address"
          >
            <FiSearch /> Search
          </button>
        </div>
        <button 
          onClick={handleAutoDetect} 
          disabled={detecting}
          className="btn-secondary flex items-center gap-2 justify-center"
          title="Auto-detect your current location"
        >
          {detecting ? <FiLoader className="animate-spin" /> : <FiMapPin />}
          {detecting ? 'Detecting...' : 'Auto-Detect'}
        </button>
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p className="flex items-center gap-2">
          <span className="font-medium">💡 Tip:</span>
          <span>Type address and search, click "Auto-Detect", or click anywhere on the map</span>
        </p>
      </div>

      <div className="h-96 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
        <MapContainer
          center={position || { lat: 20.5937, lng: 78.9629 }}
          zoom={position ? 13 : 5}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker position={position} onMapClick={handleMapClick} />
        </MapContainer>
      </div>
      
      {position && (
        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
          <p className="font-medium mb-1">Selected Location:</p>
          <p className="truncate">{address}</p>
          <p className="text-xs mt-1">Coordinates: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}</p>
        </div>
      )}
    </div>
  );
}

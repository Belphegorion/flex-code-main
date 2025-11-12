import axios from 'axios';
import logger from '../config/logger.js';

class GeocodingService {
  constructor() {
    this.baseUrl = 'https://nominatim.openstreetmap.org';
    this.headers = {
      'User-Agent': process.env.APP_USER_AGENT || 'EventFlex/1.0 (+contact@eventflex.local)',
      'Accept-Language': 'en',
      'Accept': 'application/json'
    };
  }

  async geocode(address) {
    if (!address) throw new Error('Address is required');
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: { q: address, format: 'json', limit: 1, addressdetails: 1 },
        headers: this.headers
      });
      if (!Array.isArray(response.data) || response.data.length === 0) {
        throw new Error('No geocoding results found');
      }
      const first = response.data[0];
      return {
        lat: parseFloat(first.lat),
        lng: parseFloat(first.lon),
        formattedAddress: first.display_name
      };
    } catch (error) {
      logger.error('Geocoding failed', { address, error: error.message });
      throw error;
    }
  }

  async reverseGeocode(lat, lng) {
    try {
      const response = await axios.get(`${this.baseUrl}/reverse`, {
        params: { lat, lon: lng, format: 'json', addressdetails: 1 },
        headers: this.headers
      });
      if (!response.data || !response.data.display_name) {
        throw new Error('No reverse geocoding results found');
      }
      return response.data.display_name;
    } catch (error) {
      logger.error('Reverse geocoding failed', { lat, lng, error: error.message });
      throw error;
    }
  }
}

export default new GeocodingService();



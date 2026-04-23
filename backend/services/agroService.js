const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const API_KEY = process.env.AGRO_API_KEY;
const BASE_URL = 'http://api.agromonitoring.com/agro/1.0';

/**
 * Register a polygon with AgroMonitoring
 */
const createPolygon = async (name, geojson) => {
  try {
    const response = await axios.post(`${BASE_URL}/polygons?appid=${API_KEY}`, {
      name: name,
      geo_json: geojson
    });
    return response.data;
  } catch (error) {
    console.error('Agro API Error (Create):', error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * Get NDVI History for a polygon
 */
const getNDVI = async (polygonId) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60);
    
    const response = await axios.get(`${BASE_URL}/ndvi/history?polyid=${polygonId}&appid=${API_KEY}&start=${thirtyDaysAgo}&end=${now}`);
    return response.data;
  } catch (error) {
    console.error('Agro API Error (NDVI):', error.response ? error.response.data : error.message);
    throw error;
  }
};

module.exports = { createPolygon, getNDVI };

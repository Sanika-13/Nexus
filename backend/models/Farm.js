const mongoose = require('mongoose');

const FarmSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "My Farm"
  },
  polygon: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]], // GeoJSON format: [ [ [lng, lat], ... ] ]
      required: true
    }
  },
  agroPolygonId: {
    type: String // ID from AgroMonitoring API
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Farm', FarmSchema);

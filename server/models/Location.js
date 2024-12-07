const mongoose = require('mongoose');
const _ = require('underscore');

const setName = (name) => _.escape(name).trim();

const LocationnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  loc: {
    type: {
      type: String,
      enum: ['Point'], // GeoJSON type must be "Point" for Mapbox
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

LocationnSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  address: doc.address,
  loc: doc.loc,
});

const LocationModel = mongoose.model('Location', LocationnSchema);
module.exports = LocationModel;

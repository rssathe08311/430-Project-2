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
  //temperature: {
  //  type: Number,
  //  required: true,
  //  trim: true,
  //},
  //ingredients: {
  //  type: Array,
  //  required: true,
  //},
  ////have like a checkbox or something that returns boolean that fills this position
  //favorite: {
  //  type: Boolean,
  //  required: true,
  //},
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
  //name: doc.name,
  //temperature: doc.temperature,
  //ingredients: doc.ingredients,
  //favorite: doc.favorite,
});

const LocationModel = mongoose.model('Location', LocationnSchema);
module.exports = LocationModel;

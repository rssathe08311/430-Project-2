const mongoose = require('mongoose');
const _ = require('underscore');

const setName = (name) => _.escape(name).trim();

const DrinkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },
  temperature: {
    type: Number,
    required: true,
    trim: true,
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

DrinkSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  temperature: doc.temperature,
});

const DrinkModel = mongoose.model('Drink', DrinkSchema);
module.exports = DrinkModel;

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
    type: String,
    required: true,
    enum: ['Hot', 'Cold'],
    trim: true,
  },
  ingredients: {
    type: [String],
    required: true,
  },
  favorite: {
    type: Boolean,
    default: false,
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
  ingredients: doc.ingredients,
  favorite: doc.favorite,
});

const DrinkModel = mongoose.model('Drink', DrinkSchema);
module.exports = DrinkModel;

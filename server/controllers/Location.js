const axios = require('axios');
const models = require('../models');

const { Location } = models;

const makerPage = async (req, res) => res.render('location');

const makeLocation = async (req, res) => {
  const { name, address, coordinates } = req.body;

  // Validate inputs
  if (!name || !address || !Array.isArray(coordinates) || coordinates.length !== 2) {
    return res.status(400).json({
      error: 'Name, address, and coordinates (as [longitude, latitude]) are required!',
    });
  }

  const [longitude, latitude] = coordinates;

  if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
    return res.status(400).json({
      error: 'Longitude must be between -180 and 180, Latitude must be between -90 and 90!',
    });
  }

  if (!req.session.account._id) {
    return res.status(403).json({ error: 'Account not found, please login!' });
  }

  const locationData = {
    name: name,
    address: address,
    loc: {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    },
    owner: req.session.account._id,
  };

  try {
    const newLocation = new Location(locationData);
    await newLocation.save();
    
    const account = await models.Account.findById(req.session.account._id);

    if (!account.locations.includes(newLocation._id)) {
      account.locations.push(newLocation._id);
      await account.save();
    }
    
    
    
    return res.status(201).json({
      name: newLocation.name,
      address: newLocation.address,
      loc: newLocation.loc,
    });
  } catch (err) {
    console.error('Error creating location: ', err.message);
    console.error('Stack trace:', err.stack);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Location already exists!' });
    }
    return res.status(500).json({ error: 'An error occurred while creating the location!' });
  }
};

const getLocations = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await Location.find(query).select('_id name address loc').lean().exec();

    return res.json({ locations: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving locations!' });
  }
};

const removeLocations = async (req, res) => {
  try {
    if (!req.session.account._id) {
      return res.status(403).json({ error: 'Account not found please log in!' });
    }

    if (!req.body.id && !req.body.name) {
      return res.status(400).json({ error: 'Location ID or name is required to delete!' });
    }

    const query = { owner: req.session.account._id };
    if (req.body.id) {
      query._id = req.body.id;
    } else if (req.body.name) {
      query.name = req.body.name;
    }

    const deleted = await Location.deleteOne(query);

    // Check if any document was deleted
    if (deleted.deletedCount === 0) {
      return res.status(404).json({ error: 'No location found to delete!' });
    }

    return res.status(200).json({ message: 'Location successfully deleted!' });
  } catch (err) {
    console.error('Error removing location: ', err.message);
    console.error('Stack trace: ', err.stack);
    return res.status(500).json({ error: 'An error occurred while deleting the location!' });
  }
};

// API fetch functionality
const getExternalLocationData = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'query parameter is required for mapbox!' });
  }
  const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;

  try {
    const response = await axios.get(mapboxUrl, {
      params: {
        access_token: process.env.MAPBOX_TOKEN,
      },
    });
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching data from Mapbox API:', error.message);
    return res.status(500).json({ error: 'Failed to fetch data from Mapbox API!' });
  }
};

module.exports = {
  makerPage,
  makeLocation,
  getLocations,
  removeLocations,
  getExternalLocationData,
};

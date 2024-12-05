const models = require('../models');

const { Location } = models;

const makerPage = async (req, res) => res.render('location');

const makeLocation = async (req, res) => {
  if (!req.body.name || !req.body.locLong || !req.body.locLat) {
    return res.status(400).json({ error: 'Name, latitude, and longitude are all required!' });
  }

  if (!req.session.account._id) {
    return res.status(403).json({ error: 'Account not found, please login!' });
  }

  const locationData = {
    name: req.body.name,
    address: req.body.address || '',
    loc: {
      type: 'Point',
      coordinates: [parseFloat(req.body.locLong), parseFloat(req.body.locLat)],
    },
    owner: req.session.account._id,
  };

  try {
    const newLocation = new Location(locationData);
    await newLocation.save();
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

module.exports = {
  makerPage,
  makeLocation,
  getLocations,
  removeLocations,
};

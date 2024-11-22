const models = require('../models');

const { Drink } = models;

const makerPage = async (req, res) => res.render('drink');

const makeDrink = async (req, res) => {
  if (!req.body.name || !req.body.temperature) {
    return res.status(400).json({ error: 'Both name and temperature are required!' });
  }

  if (!req.session.account._id) {
    return res.status(403).json({ error: 'Account not found, please login!' });
  }

  const drinkData = {
    name: req.body.name,
    temperature: req.body.temperature,
    owner: req.session.account._id,
  };

  try {
    const newDrink = new Drink(drinkData);
    await newDrink.save();
    return res.status(201).json({ name: newDrink.name, temperature: newDrink.temperature });
  } catch (err) {
    console.error('Error creating drink:', err.message);
    console.error('Stack trace:', err.stack);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Drink already exists!' });
    }
    return res.status(500).json({ error: 'An error occured making drink!' });
  }
};

const getDrinks = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await Drink.find(query).select('name temperature').lean().exec();

    return res.json({ drinks: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving drinks!' });
  }
};

module.exports = {
  makerPage,
  makeDrink,
  getDrinks,
};

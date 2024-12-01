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
    ingredients: req.body.ingredients,
    favorite: req.body.favorite,
    owner: req.session.account._id,
  };

  try {
    const newDrink = new Drink(drinkData);
    await newDrink.save();
    console.log(`ingredients ${newDrink.ingredients}`);
    return res.status(201).json({
      name: newDrink.name,
      temperature: newDrink.temperature,
      ingredients: newDrink.ingredients,
      favorite: newDrink.favorite,
    });
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
    const docs = await Drink.find(query).select('_id name temperature ingredients favorite').lean().exec();

    return res.json({ drinks: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving drinks!' });
  }
};

const removeDrinks = async (req, res) => {
  try {
    if (!req.session.account._id) {
      return res.status(403).json({ error: 'Account not found, please login!' });
    }

    if (!req.body.id && !req.body.name) {
      return res.status(400).json({ error: 'Drink ID or name is required to delete!' });
    }

    const query = { owner: req.session.account._id };
    if (req.body.id) {
      query._id = req.body.id;
    } else if (req.body.name) {
      query.name = req.body.name;
    }

    const deleted = await Drink.deleteOne(query);

    // Check if any document was deleted
    if (deleted.deletedCount === 0) {
      return res.status(404).json({ error: 'No drink found to delete!' });
    }

    return res.status(200).json({ message: 'Drink successfully deleted!' });
  } catch (err) {
    console.error('Error removing drink:', err.message);
    console.error('Stack trace:', err.stack);
    return res.status(500).json({ error: 'An error occurred while deleting the drink!' });
  }
};

module.exports = {
  makerPage,
  makeDrink,
  getDrinks,
  removeDrinks,
};

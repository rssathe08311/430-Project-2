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

    if (newDrink.favorite) {
      const account = await models.Account.findById(req.session.account._id);

      if (!account.favoriteDrinks.includes(newDrink._id)) {
        account.favoriteDrinks.push(newDrink._id);
        await account.save();
      }
    }

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

const toggleFavorite = async (req, res) => {
  if (!req.session.account._id) {
    return res.status(403).json({ error: 'Account not found, please login!' });
  }

  if (!req.body._id) {
    return res.status(400).json({ error: 'Drink ID is required to toggle favorite!' });
  }

  try {
    const drink = await Drink.findById(req.body._id);

    if (!drink) {
      return res.status(404).json({ error: 'Drink not found!' });
    }

    drink.favorite = !drink.favorite;

    await drink.save();

    const account = await models.Account.findById(req.session.account._id);

    if (drink.favorite) {
      if (!account.favoriteDrinks.includes(drink._id)) {
        account.favoriteDrinks.push(drink._id);
      }
    } else {
      account.favoriteDrinks = account.favoriteDrinks.filter(
        (id) => id.toString() !== drink._id.toString(),
      );
    }
    await account.save();

    return res.status(200).json({ message: 'Favorite status updated!', favorite: drink.favorite });
  } catch (err) {
    console.error('Error toggling favorite status:', err.message);
    return res.status(500).json({ error: 'An error occurred while updating favorite status.' });
  }
};

module.exports = {
  makerPage,
  makeDrink,
  getDrinks,
  removeDrinks,
  toggleFavorite,
};

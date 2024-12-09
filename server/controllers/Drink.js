const models = require('../models');

const { Drink } = models;

// name: makerPage
// input: Express request (req) and response (res) objects.
// output: Renders the drink creation page.
// description: Displays the page for users to create a new drink.
const makerPage = async (req, res) => res.render('drink');

// name: makeDrink
// input: Express request (req) and response (res) objects.
// Expects drink details in the request body and session data for the logged-in user.
// output: JSON response with the created drink details or an error message.
// description: Creates a new drink with the provided details.
// If marked as favorite, it updates the user's favorite drinks list.
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

// name: getDrinks
// input: Express request (req) and response (res) objects.
// Expects session data for the logged-in user.
// output: JSON response containing the user's drinks or an error message.
// description: Retrieves all drinks created by the logged-in user.
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

// name: removeDrinks
// input: Express request (req) and response (res) objects.
// Expects a drink ID or name in the request body and session data for the logged-in user.
// output: JSON response indicating success or failure of deleting the drink.
// description: Deletes a drink created by the logged-in user based on the provided ID or name.
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

// name: toggleFavorite
// input: Express request (req) and response (res) objects.
// Expects a drink ID in the request body and session data for the logged-in user.
// output: JSON response indicating the updated favorite status of the drink or an error message.
// description: Toggles the favorite status of a drink and updates the user's favorite drinks list.
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

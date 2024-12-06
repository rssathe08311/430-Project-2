const models = require('../models');
// const AccountModel = require('../models/Account');

const { Account } = models;

const loginPage = (req, res) => res.render('login');
const makerPage = async (req, res) => res.render('profile');

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    req.session.account = Account.toAPI(account);

    return res.json({ redirect: '/maker' });
  });
};

const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash });
    await newAccount.save();
    req.session.account = Account.toAPI(newAccount);
    return res.json({ redirect: '/maker' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use!' });
    }
    return res.status(500).json({ error: 'An error occured!' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    if (!req.session.account || !req.session.account._id) {
      return res.status(400).json({ error: 'User not logged in or invalid session.' });
    }

    // Fetch the user profile
    const query = { _id: req.session.account._id };
    const account = await Account.findOne(query)
      .select('username profilePicture friends favoriteDrinks locations') // Select specific fields
      .populate('friends', 'username profilePicture') // Populate friends
      .populate('favoriteDrinks', 'name temperature ingredients')
      .lean() // Convert the document to plain JS object
      .exec();

    // Check if the account exists
    if (!account) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    // Respond with the account data
    return res.json({
      username: account.username,
      profilePicture: account.profilePicture || '/assets/img/default-profile.png',
      friends: account.friends || [],
      favoriteDrinks: account.favoriteDrinks || [],
      locations: account.locations || [],
    });
  } catch (err) {
    console.error(`Error fetching user profile: ${err.message}`);
    return res.status(500).json({ error: 'Error retrieving user profile.' });
  }
};

// module exports
module.exports = {
  loginPage,
  makerPage,
  login,
  logout,
  signup,
  getUserProfile,
};

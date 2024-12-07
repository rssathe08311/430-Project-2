const models = require('../models');
// const AccountModel = require('../models/Account');

const { Account } = models;

const loginPage = (req, res) => res.render('login');
const makerPage = async (req, res) => res.render('profile');
const friendPage = async (req, res) => res.render('friend');

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

    return res.json({ redirect: '/home' });
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
    return res.json({ redirect: '/home' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use!' });
    }
    return res.status(500).json({ error: 'An error occured!' });
  }
};

const changePassword = async (req, res) => {
  const { username, newPass, newPass2 } = req.body;

  if (!username || !newPass || !newPass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (newPass !== newPass2) {
    return res.status(400).json({ error: 'New passwords do not match!' });
  }

  try {
    const account = await Account.findOne({ username });

    if (!account) {
      return res.status(404).json({ error: 'Account not found!' });
    }

    const hash = await Account.generateHash(newPass);
    account.password = hash;
    await account.save();

    return res.status(200).json({ message: 'Password changed successfully!' });
  } catch (err) {
    console.error('Error changing password:', err.message);
    return res.status(500).json({ error: 'An error occurred while changing the password.' });
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
      .populate('locations', 'name address')
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

const getFriends = async (req, res) => {
  try {
    if (!req.session.account || !req.session.account._id) {
      return res.status(400).json({ error: 'User not logged in or invalid session.' });
    }

    const account = await Account.findOne({ _id: req.session.account._id })
      .select('friends')
      .populate('friends', 'username profilePicture')
      .lean()
      .exec();

    if (!account) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    return res.json({ friends: account.friends || [] });
  } catch (err) {
    console.error(`Error fetching friends: ${err.message}`);
    return res.status(500).json({ error: 'Error retrieving friends list.' });
  }
};

const getHomeData = async (req, res) => {
  try {
    // Fetch all drinks and locations without filtering by user or friends
    const allDrinks = await models.Drink.find()
      .select('name temperature ingredients owner')
      .populate('owner', 'username profilePicture')
      .lean();
    const allLocations = await models.Location.find()
      .select('name address')
      .populate('owner', 'username profilePicture')
      .lean();

    return res.json({ drinks: allDrinks, locations: allLocations });
  } catch (err) {
    console.error('Error fetching home data:', err.message);
    return res.status(500).json({ error: 'Error fetching home data.' });
  }
};

const searchUsers = async (req, res) => {
  console.log('searching...');
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required.' });
    }

    const searchQuery = { username: { $regex: query, $options: 'i' } };

    const users = await Account.find(searchQuery)
      .select('_id username profilePicture')
      .lean()
      .exec();

    console.log(`Users: ${users}`);
    return res.json({ users });
  } catch (err) {
    console.error(`Error searching users: ${err.message}`);
    return res.status(500).json({ error: 'Error searching users.' });
  }
};

const sendFriendRequest = async (req, res) => {
  const { friendId } = req.body;

  if (!req.session.account._id || !friendId) {
    return res.status(400).json({ error: 'Sender and request must be specified.' });
  }

  try {
    const friend = await Account.findById(friendId);

    if (!friend) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (friend.friendRequests.includes(req.session.account._id)) {
      return res.status(400).json({ error: 'Friend request already sent.' });
    }

    if (req.session.account._id === friendId) {
      return res.status(400).json({ error: 'You cannot send a friend request to yourself.' });
    }

    friend.friendRequests.push(req.session.account._id);
    await friend.save();

    return res.status(200).json({ message: 'Friend request sent successfully!' });
  } catch (err) {
    console.error('Error sending friend request:', err.message);
    return res.status(500).json({ error: 'Error sending friend request' });
  }
};

const acceptFriendRequest = async (req, res) => {
  const { senderId } = req.body;

  if (!req.session.account._id || !senderId) {
    return res.status(400).json({ error: 'Sender and recipient must be specified.' });
  }

  try {
    const recipient = await Account.findById(req.session.account._id);
    const sender = await Account.findById(senderId);

    if (!recipient || !sender) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (!recipient.friendRequests.includes(senderId)) {
      return res.status(400).json({ error: 'No pending friend request from this user' });
    }

    if (recipient.friends.includes(senderId)) {
      return res.status(400).json({ error: 'You are already friends with this user.' });
    }

    recipient.friends.push(senderId);
    sender.friends.push(recipient._id);

    recipient.friendRequests = recipient.friendRequests.filter(
      (id) => id.toString() !== senderId,
    );

    await recipient.save();
    await sender.save();

    return res.status(200).json({ message: 'Friend request accepted!' });
  } catch (err) {
    console.error('Error accepting friend request:', err.message);
    return res.status(500).json({ error: 'Error accepting friend request.' });
  }
};

const rejectFriendRequest = async (req, res) => {
  const { senderId } = req.body;

  if (!req.session.account._id || !senderId) {
    return res.status(400).json({ error: 'Sender and recipient must be specified.' });
  }

  try {
    const recipient = await Account.findById(req.session.account._id);

    if (!recipient) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (!recipient.friendRequests.includes(senderId)) {
      return res.status(400).json({ error: 'No pending friend request from this user.' });
    }

    recipient.friendRequests = recipient.friendRequests.filter(
      (id) => id.toString() !== senderId,
    );

    await recipient.save();

    return res.status(200).json({ message: 'Friend request rejected.' });
  } catch (err) {
    console.error('Error rejecting friend request:', err.message);
    return res.status(500).json({ error: 'Error rejecting friend request.' });
  }
};

const getFriendRequests = async (req, res) => {
  try {
    const account = await Account.findById(req.session.account._id)
      .select('friendRequests')
      .populate('friendRequests', 'username profilePicture')
      .lean();

    return res.status(200).json({ requests: account.friendRequests || [] });
  } catch (err) {
    console.error('Error fetching friend requests:', err.message);
    return res.status(500).json({ error: 'Error fetching friend requests.' });
  }
};

// module exports
module.exports = {
  loginPage,
  makerPage,
  friendPage,
  searchUsers,
  login,
  logout,
  signup,
  changePassword,
  getUserProfile,
  getFriends,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getHomeData,
};

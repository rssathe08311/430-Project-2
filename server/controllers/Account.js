const models = require('../models');
// const AccountModel = require('../models/Account');

const { Account } = models;

// name: loginPage
// input: Express request (req) and response (res) objects.
// output: Renders the login page.
// description: Handles rendering of the login page for user authentication.
const loginPage = (req, res) => res.render('login');

// name: makerPage
// input: Express request (req) and response (res) objects.
// output: Renders the user's profile page.
// description: Handles rendering of the profile page for authenticated users.
const makerPage = async (req, res) => res.render('profile');

// name: friendPage
// input: Express request (req) and response (res) objects.
// output: Renders the friend page.
// description: Handles rendering of the friend page for managing friends.
const friendPage = async (req, res) => res.render('friend');

// name: logout
// input: Express request (req) and response (res) objects.
// output: Redirects the user to the homepage after destroying their session.
// description: Logs out the user by clearing the session data.
const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

// name: login
// input: Express request (req) and response (res) objects.
// Expects username and password in the request body.
// output: JSON response indicating success or failure of login.
// description: Authenticates the user and starts a session if credentials are valid.
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

// name: signup
// input: Express request (req) and response (res) objects.
// Expects username, password, and password confirmation in the request body.
// output: JSON response indicating success or failure of signup.
// description: Registers a new user account and starts a session if successful.
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

// name: changePassword
// input: Express request (req) and response (res) objects.
// Expects username, new password, and confirmation of new password in the request body.
// output: JSON response indicating success or failure of the password change.
// description: Allows a user to change their password after validating the inputs.
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

// name: getUserProfile
// input: Express request (req) and response (res) objects.
// Expects session information to identify the logged-in user.
// output: JSON response containing user profile details or an error message.
// description: Retrieves the profile information of the logged-in user,
// including friends, favorite drinks, and locations.
const getUserProfile = async (req, res) => {
  try {
    if (!req.session.account || !req.session.account._id) {
      return res.status(400).json({ error: 'User not logged in or invalid session.' });
    }

    // Fetch the user profile
    const query = { _id: req.session.account._id };
    const account = await Account.findOne(query)
      .select('username profilePicture friends favoriteDrinks locations')
      .populate('friends', 'username profilePicture')
      .populate('favoriteDrinks', 'name temperature ingredients')
      .populate('locations', 'name address')
      .lean()
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

// name: getFriends
// input: Express request (req) and response (res) objects.
// Expects session information to identify the logged-in user.
// output: JSON response containing the user's list of friends or an error message.
// description: Retrieves the list of friends for the logged-in user.
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

// name: getHomeData
// input: Express request (req) and response (res) objects.
// output: JSON response containing all drinks and locations available in the system.
// description: Retrieves all drinks and locations from the database for display on the homepage.
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

// name: searchUsers
// input: Express request (req) and response (res) objects.
// Expects a query parameter in the request to filter users by username.
// output: JSON response containing a list of matching users or an error message.
// description: Searches for users whose usernames match the query parameter
// using a case-insensitive regular expression.
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

// name: sendFriendRequest
// input: Express request (req) and response (res) objects.
// Expects the friend ID in the request body and session data for the sender.
// output: JSON response indicating success or failure of sending the friend request.
// description: Sends a friend request from the logged-in user to another user.
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

// name: acceptFriendRequest
// input: Express request (req) and response (res) objects.
// Expects the sender's user ID in the request body and session data for the recipient.
// output: JSON response indicating success or failure of accepting the friend request.
// description: Accepts a friend request, adding both users to each other's friends list.
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

// name: rejectFriendRequest
// input: Express request (req) and response (res) objects.
// Expects the sender's user ID in the request body and session data for the recipient.
// output: JSON response indicating success or failure of rejecting the friend request.
// description: Rejects a friend request by removing it from the recipient's friend requests list.
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

// name: getFriendRequests
// input: Express request (req) and response (res) objects.
// Expects session data for the logged-in user.
// output: JSON response containing a list of friend requests or an error message.
// description: Retrieves the list of friend requests for the logged-in user.
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

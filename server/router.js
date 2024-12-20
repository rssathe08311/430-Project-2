const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getDrinks', mid.requiresLogin, controllers.Drink.getDrinks);
  app.get('/getUserProfile', mid.requiresLogin, controllers.Account.getUserProfile);
  app.get('/getFriends', mid.requiresLogin, controllers.Account.getFriends);
  app.get('/searchUsers', mid.requiresLogin, controllers.Account.searchUsers);
  app.get('/getLocations', mid.requiresLogin, controllers.Location.getLocations);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.post('/changePassword', mid.requiresSecure, mid.requiresLogout, controllers.Account.changePassword);

  app.get('/home', mid.requiresLogin, controllers.Home.makerPage);
  app.get('/documentation', mid.requiresLogin, controllers.Home.docsPage);

  app.get('/drink', mid.requiresLogin, controllers.Drink.makerPage);
  app.post('/drink', mid.requiresLogin, controllers.Drink.makeDrink);
  app.post('/removeDrink', mid.requiresLogin, controllers.Drink.removeDrinks);
  app.post('/favoriteDrink', mid.requiresLogin, controllers.Drink.toggleFavorite);

  app.get('/location', mid.requiresLogin, controllers.Location.makerPage);
  app.post('/makelocation', mid.requiresLogin, controllers.Location.makeLocation);
  app.post('/removeLocation', mid.requiresLogin, controllers.Location.removeLocations);

  app.get('/profile', mid.requiresLogin, controllers.Account.makerPage);

  app.get('/friend', mid.requiresLogin, controllers.Account.friendPage);
  app.post('/sendFriendRequest', mid.requiresLogin, controllers.Account.sendFriendRequest);
  app.post('/acceptFriendRequest', mid.requiresLogin, controllers.Account.acceptFriendRequest);
  app.post('/rejectFriendRequest', mid.requiresLogin, controllers.Account.rejectFriendRequest);
  app.get('/getFriendRequests', mid.requiresLogin, controllers.Account.getFriendRequests);

  app.get('/getHomeData', mid.requiresLogin, controllers.Account.getHomeData);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);

  app.all('*', (req, res) => {
    console.warn(`Attempted to access invalid route: ${req.path}`);
    return res.redirect('/home');
  });
};

module.exports = router;

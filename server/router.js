const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getDomos', mid.requiresLogin, controllers.Domo.getDomos);
  app.get('/getDrinks', mid.requiresLogin, controllers.Drink.getDrinks);
  app.get('/getUserProfile', mid.requiresLogin, controllers.Account.getUserProfile);
  app.get('/getLocations', mid.requiresLogin, controllers.Location.getLocations);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/home', mid.requiresLogin, controllers.Home.makerPage);

  app.get('/maker', mid.requiresLogin, controllers.Domo.makerPage);
  app.post('/maker', mid.requiresLogin, controllers.Domo.makeDomo);

  app.get('/drink', mid.requiresLogin, controllers.Drink.makerPage);
  app.post('/drink', mid.requiresLogin, controllers.Drink.makeDrink);
  app.post('/removeDrink', mid.requiresLogin, controllers.Drink.removeDrinks);

  app.get('/location', mid.requiresLogin, controllers.Location.makerPage);
  app.post('/location', mid.requiresLogin, controllers.Location.makeLocation);
  app.post('/removeLocation', mid.requiresLogin, controllers.Location.removeLocations);

  app.get('/profile', mid.requiresLogin, controllers.Account.makerPage);
  // app.post('/profile', mid.requiresLogin, controllers.Drink.makeDrink);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;

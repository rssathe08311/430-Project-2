const helper = require('./helper.js');
const React = require('react');
const {createRoot} = require('react-dom/client');
const { useState, useEffect } = React;


// name: DrinksSection
// input: Props object with drinks array and a triggerReload callback function
// output: JSX section displaying a grid of drink cards or a message if no drinks are available
// description: Renders a grid of drinks with details like name, temperature, ingredients, and owner information. 
// Allows marking drinks as favorites using the triggerReload function to refresh the data.
const DrinksSection = ({ drinks, triggerReload }) => {
  const handleFavoriteDrink = async (drinkId) => {
      try {
          const response = await fetch('/favoriteDrink', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ _id: drinkId }),
          });

          if (!response.ok) {
              const errorData = await response.json();
              console.error('Error favoriting drink:', errorData.error);
              return;
          }

          triggerReload(); // Refresh data after updating
      } catch (err) {
          console.error('Error sending favorite request:', err);
      }
  };

  return (
      <div className="home-section">
          <h2>Drinks</h2>
          {drinks && drinks.length > 0 ? (
              <div className="drinks-grid">
                  {drinks.map((drink) => (
                      <div key={drink._id} className="drink-card">
                          <h3 className="drink-name">{drink.name}</h3>
                          <p><strong>Temperature:</strong> {drink.temperature}</p>
                          <ul className="drink-ingredients">
                              {typeof drink.ingredients === 'string'
                                  ? drink.ingredients.split(',').map((ingredient, index) => (
                                        <li key={index} className="ingredient-item">{ingredient.trim()}</li>
                                    ))
                                  : <li>No ingredients available</li>}
                          </ul>
                          <div className="owner-info">
                              <img
                                  src={drink.owner?.profilePicture || '/assets/img/default-profile.png'}
                                  alt={`${drink.owner?.username || 'Unknown'}'s profile`}
                                  className="owner-profile-picture"
                              />
                              <p><strong>{drink.owner?.username || 'Unknown'}</strong></p>
                          </div>
                          {/* Favorite Button */}
                          <button onClick={() => handleFavoriteDrink(drink._id)}>
                              Add/Remove Favorite
                          </button>
                      </div>
                  ))}
              </div>
          ) : (
              <p>No drinks found.</p>
          )}
      </div>
  );
};

// name: LocationsSection
// input: Props object with locations array
// output: JSX section displaying a grid of location cards or a message if no locations are available
// description: Renders a grid of locations with details like name, address, and owner information.
  const LocationsSection = ({ locations }) => (
    <div className="home-section">
      <h2>Locations</h2>
      {locations && locations.length > 0 ? (
        <div className="locations-grid">
          {locations.map(location => (
            <div key={location._id} className="location-card">
              <h3 className="location-name">{location.name}</h3>
              <p><strong>Address:</strong> {location.address}</p>
              <div className="owner-info">
                <img 
                  src={location.owner?.profilePicture || '/assets/img/default-profile.png'} 
                  alt={`${location.owner?.username || 'Unknown'}'s profile`} 
                  className="owner-profile-picture"
                />
                <p><strong>{location.owner?.username || 'Unknown'}</strong></p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No locations found.</p>
      )}
    </div>
  );
  

// name: AdsSection
// input: None
// output: JSX section displaying three advertisement images
// description: Displays a section containing three static advertisement placeholders.
  const AdsSection = () => (
    <div className="ads-section">
      <img src="/assets/img/adSpace.png" alt="Ad 1" className="ad-image" />
      <img src="/assets/img/adSpace.png" alt="Ad 2" className="ad-image" />
      <img src="/assets/img/adSpace.png" alt="Ad 3" className="ad-image" />
    </div>
  );
  

// name: Home
// input: None
// output: JSX page displaying the home layout, including ads, drinks, and locations sections
// description: The main page component for ForeCafe, which fetches home data and passes it to DrinksSection and LocationsSection components. 
// Includes ads and a welcome message.
  const Home = () => {
    const [homeData, setHomeData] = useState({
      drinks: [],
      locations: [],
    });

    const [reloadDrinks, setReloadDrinks] = useState(false);
  
    useEffect(() => {
      const loadHomeData = async () => {
        const response = await fetch('/getHomeData'); // Adjust to your endpoint
        const data = await response.json();
        setHomeData(data);
      };
      loadHomeData();
    }, []);
  
    const { drinks, locations } = homeData;
  
    return (
      <div className="home-container">
        <AdsSection />
        <div className="main-content">
          <img className='logoImg' src='/assets/img/full-logo.png' alt='Full Forecafe Logo'/>
          <h1>Welcome to ForeCafe</h1>
          <DrinksSection drinks={drinks} triggerReload={() => setReloadDrinks(!reloadDrinks)} />
          <LocationsSection locations={locations} />
        </div>
        <AdsSection />
      </div>
    );
  };
  
  // name: init
// description: Initializes the React application by rendering the App component into the DOM.
  const init = () => {
    const root = createRoot(document.getElementById('home'));
    root.render(<Home />);
  };
  
  window.onload = init;
  

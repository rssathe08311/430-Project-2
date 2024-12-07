const helper = require('./helper.js');
const React = require('react');
const {createRoot} = require('react-dom/client');
const { useState, useEffect } = React;

//this will be the homepage for the application
//need to change the routing so that it goes here first 



const DrinksSection = ({ drinks }) => (
    <div className="home-section">
      <h2>Drinks</h2>
      {drinks && drinks.length > 0 ? (
        <div className="drinks-grid">
          {drinks.map(drink => (
            <div key={drink._id} className="drink-card">
              <h3 className="drink-name">{drink.name}</h3>
              <p><strong>Temperature:</strong> {drink.temperature}</p>
              <ul className="drink-ingredients">
                {typeof drink.ingredients === 'string' ? 
                  drink.ingredients.split(',').map((ingredient, index) => (
                    <li key={index} className="ingredient-item">{ingredient.trim()}</li>
                  ))
                  : <li>No ingredients available</li>
                }
              </ul>
              <div className="owner-info">
                <img 
                  src={drink.owner?.profilePicture || '/assets/img/default-profile.png'} 
                  alt={`${drink.owner?.username || 'Unknown'}'s profile`} 
                  className="owner-profile-picture"
                />
                <p><strong>{drink.owner?.username || 'Unknown'}</strong></p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No drinks found.</p>
      )}
    </div>
  );
  



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
  


  const AdsSection = () => (
    <div className="ads-section">
      <img src="/assets/img/adSpace.png" alt="Ad 1" className="ad-image" />
      <img src="/assets/img/adSpace.png" alt="Ad 2" className="ad-image" />
      <img src="/assets/img/adSpace.png" alt="Ad 3" className="ad-image" />
    </div>
  );
  
  const Home = () => {
    const [homeData, setHomeData] = useState({
      drinks: [],
      locations: [],
    });
  
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
          <DrinksSection drinks={drinks} />
          <LocationsSection locations={locations} />
        </div>
        <AdsSection />
      </div>
    );
  };
  
  const init = () => {
    const root = createRoot(document.getElementById('home'));
    root.render(<Home />);
  };
  
  window.onload = init;
  

window.onload = init;

//also create spaces for ads
const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

// name: ProfileHeader
// input: Props object ({ username, profilePicture })
// output: JSX element (profile header UI)
// description: Displays a user's profile header, including their profile picture 
// and username, with a placeholder upgrade button.
const ProfileHeader = ({ username, profilePicture }) => (
    <div className="profile-header">
        <div className="upgrade-container">
            <button className="upgrade-button">Upgrade to Premium</button> {/* Fake button */}
        </div>
        <img 
            src={profilePicture || "/assets/img/default-profile.png"} 
            alt={`${username}'s profile picture`} 
            className="profile-picture" 
        />
        <h1>{username}</h1>
    </div>
);

// name: FriendsSection
// input: Props object ({ friends })
// output: JSX element (friends list UI)
// description: Displays a list of the user's friends, 
// including their usernames and profile pictures.
const FriendsSection = ({ friends }) => (
    <div className="profile-section">
        <h2>Friends</h2>
        {friends && friends.length > 0 ? (
            <ul>
                {friends.map(friend => (
                    <li key={friend._id} className="friend-item">
                        <img 
                            src={friend.profilePicture || "/assets/img/default-profile.png"} 
                            alt={`${friend.username}'s profile picture`} 
                            className="friend-picture" 
                        />
                        {friend.username}
                    </li>
                ))}
            </ul>
        ) : (
            <p>No friends added yet.</p>
        )}
    </div>
);

// name: FavoriteDrinksSection
// input: Props object ({ favoriteDrinks, triggerReload })
// output: JSX element (favorite drinks grid UI)
// description: Displays a grid of the user's favorite drinks 
// and allows removing drinks from the favorites list.
const FavoriteDrinksSection = ({ favoriteDrinks, triggerReload }) => {
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
  
            triggerReload();
        } catch (err) {
            console.error('Error sending favorite request:', err);
        }
    };

    return (
        <div className="profile-section">
        <h2>Favorite Drinks</h2>
        {favoriteDrinks && favoriteDrinks.length > 0 ? (
            <div className="favorite-drinks-grid">
                {favoriteDrinks.map(drink => (
                    <div key={drink._id} className="drink-card">
                        <h3 className="drink-name">{drink.name}</h3>
                        <p className="drink-temperature">Temperature: {drink.temperature}</p>
                        <p className='drinkIngredients'>Ingredients:
                            {drink.ingredients.split(',').map((ingredient, index) => (
                            <li key={index}>{ingredient.trim()}</li>
                        ))}</p>

                        <button className='removeDrink' onClick={() => handleFavoriteDrink(drink._id)}>
                              Remove Favorite
                        </button>
                    </div>
                ))}
            </div>
        ) : (
            <p>No favorite drinks added yet.</p>
        )}
    </div>
    );
};

// name: LocationsSection
// input: Props object ({ locations })
// output: JSX element (locations grid UI)
// description: Displays a grid of the user's saved locations with their names and addresses.
const LocationsSection = ({ locations }) => (
    <div className="profile-section">
        <h2>Locations</h2>
        {locations && locations.length > 0 ? (
            <div className="favorite-drinks-grid">
                {locations.map(location => (
                    <div key={location._id} className="drink-card">
                        <h3 className="drink-name">{location.name}</h3>
                        <p className="drink-temperature"><strong>Address:</strong> {location.address}</p>
                    </div>
                ))}
            </div>
        ) : (
            <p>No locations added yet.</p>
        )}
    </div>
);

// name: Profile
// input: None
// output: JSX element (complete profile page UI)
// description: Renders the user's profile, including their header, friends list, favorite drinks, and locations.
const Profile = () => {
    const [profileData, setProfileData] = useState({
        username: '',
        profilePicture: '',
        friends: [],
        favoriteDrinks: [],
        locations: [],
    });
    const [reloadDrinks, setReloadDrinks] = useState(false);

    useEffect(() => {
        const loadProfileData = async () => {
            try {
                const response = await fetch('/getUserProfile');
                if (!response.ok) {
                    throw new Error(`Failed to fetch profile data: ${response.statusText}`);
                }
                const data = await response.json();
                setProfileData(data);
            } catch (error) {
                console.error('Error loading profile data:', error);
            }
        };
        loadProfileData();
    }, [reloadDrinks]);

    const { username, profilePicture, friends, favoriteDrinks, locations } = profileData;

    console.log("Locations:", locations);

    return (
        <div className="profile">
            <ProfileHeader username={username} profilePicture={profilePicture} />
            <FriendsSection friends={friends} />
            <FavoriteDrinksSection favoriteDrinks={favoriteDrinks} triggerReload={() => setReloadDrinks(!reloadDrinks)}/>
            <LocationsSection locations={locations} />
        </div>
    );
};

// name: init
// input: None
// output: None (renders the Profile component)
// description: Initializes the profile page by rendering the Profile component into the DOM.
const init = () => {
  const root = createRoot(document.getElementById('profile'));
  root.render(<Profile />);
};

window.onload = init;

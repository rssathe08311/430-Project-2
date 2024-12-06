const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');


const ProfileHeader = ({ username, profilePicture }) => (
    <div className="profile-header">
        <img 
            src={profilePicture || "/assets/img/default-profile.png"} 
            alt={`${username}'s profile picture`} 
            className="profile-picture" 
        />
        <h1>{username}</h1>
    </div>
);

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

const FavoriteDrinksSection = ({ favoriteDrinks }) => (
    <div className="profile-section">
        <h2>Favorite Drinks</h2>
        {favoriteDrinks && favoriteDrinks.length > 0 ? (
            <ul>
                {favoriteDrinks.map(drink => (
                    <li key={drink._id}>
                        <strong>{drink.name}</strong> - {drink.temperature}
                        <ul>
                            {drink.ingredients.split(',').map((ingredient, index) => (
                            <li key={index}>{ingredient.trim()}</li>))}
                        </ul>
                    </li>
                ))}
            </ul>
        ) : (
            <p>No favorite drinks added yet.</p>
        )}
    </div>
);

const LocationsSection = ({ locations }) => (
    <div className="profile-section">
        <h2>Locations</h2>
        {locations && locations.length > 0 ? (
            <ul>
                {locations.map((location, index) => (
                    <li key={index}>{location}</li>
                ))}
            </ul>
        ) : (
            <p>No locations added yet.</p>
        )}
    </div>
);

const Profile = () => {
    const [profileData, setProfileData] = useState({
        username: '',
        profilePicture: '',
        friends: [],
        favoriteDrinks: [],
        locations: [],
    });

    useEffect(() => {
        const loadProfileData = async () => {
            const response = await fetch('/getUserProfile');
            const data = await response.json();
            setProfileData(data);
        };
        loadProfileData();
    }, []);

    const { username, profilePicture, friends, favoriteDrinks, locations } = profileData;

    return (
        <div className="profile">
            <ProfileHeader username={username} profilePicture={profilePicture} />
            <FriendsSection friends={friends} />
            <FavoriteDrinksSection favoriteDrinks={favoriteDrinks} />
            <LocationsSection locations={locations} />
        </div>
    );
};


const init = () => {
  const root = createRoot(document.getElementById('profile'));
  root.render(<Profile />);
};

window.onload = init;

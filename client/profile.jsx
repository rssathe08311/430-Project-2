const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');


const ProfileDetails = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newProfilePicture, setNewProfilePicture] = useState(null);

  useEffect(() => {
    const loadProfileFromServer = async () => {
      try {
        const response = await fetch('/getUserProfile');
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfileFromServer();
  }, []);

  const imageChange = (e) => {
    setNewProfilePicture(e.target.files[0]);
  }

  const imageUpload = async () => {
    if(!newProfilePicture){
        return;
    }

    const formData = new FormData();
    formData.append('profilePicture', newProfilePicture);

    try {
      const response = await fetch('/uploadProfilePicture', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setProfile({ ...profile, profilePicture: data.profilePicture });
    } catch (err) {
      setError(err.message);
    }

  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!profile) {
    return <p>No profile data available.</p>;
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <img
          src={/*profile.profilePicture || */'/assets/img/default-profile.png'}
          alt={`Default profile`}
          className="profile-picture"
        />
        <h2>{profile.username} test</h2>
      </div>

      <div>
        <input type="file" onChange={imageChange} />
        <button onClick={imageUpload}>Upload Picture</button>
      </div>

      <div className="profile-section">
        <h3>Friends</h3>
        {profile.friends && profile.friends.length > 0 ? (
          <ul>
            {profile.friends.map((friend) => (
              <li key={friend._id} className="friend-item">
                <img
                  src={'/assets/img/default-profile.png'}
                  alt={`${friend.username}'s profile`}
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

      <div className="profile-section">
        <h3>Favorite Drinks</h3>
        {profile.favoriteDrinks && profile.favoriteDrinks.length > 0 ? (
          <ul>
            {profile.favoriteDrinks.map((drink) => (
              <li key={drink._id}>
                <strong>{drink.name}</strong> - {drink.temperature}
                <ul>
                  {drink.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <p>No favorite drinks added yet.</p>
        )}
      </div>

      <div className="profile-section">
        <h3>Locations</h3>
        {profile.locations && profile.locations.length > 0 ? (
          <ul>
            {profile.locations.map((location, index) => (
              <li key={index}>{location}</li>
            ))}
          </ul>
        ) : (
          <p>No locations added yet.</p>
        )}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <div id="profileApp">
      <ProfileDetails />
    </div>
  );
};

const init = () => {
  const root = createRoot(document.getElementById('profile'));
  root.render(<App />);
};

window.onload = init;

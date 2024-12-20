const helper = require('./helper.js');
const React = require('react');
const {createRoot} = require('react-dom/client');
const { useState, useEffect } = React;

// name: FriendForm
// input: Props object with an onSearchResults callback function
// output: JSX form element for searching users
// description: Provides a search input field and button to query the server for users by username. 
// Displays the results via the onSearchResults callback.
const FriendForm = ({ onSearchResults }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/searchUsers?query=${encodeURIComponent(searchQuery)}`);
            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }
            const data = await response.json();
            onSearchResults(data.users || []);
        } catch (err) {
            console.error('Error searching for users:', err);
        }
    };

    return (
        <form id="friendSearchForm" onSubmit={handleSearch} className="friendSearchForm">
            <label htmlFor="searchQuery">Search for Users:</label>
            <input
                id="searchQuery"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter username"
            />
            <input type="submit" value="Search" />
        </form>
    );
};

// name: SearchResults
// input: Props object with results array and onSendRequest callback function
// output: JSX list of user search results or a message indicating no users were found
// description: Displays a list of users matching the search query. 
// Each result includes a profile picture, username, and a button to send a friend request.
const SearchResults = ({ results, onSendRequest }) => {
    if (results.length === 0) {
        return (
            <div className="searchResults">
                <h3 className="emptyResults">No Users Found!</h3>
            </div>
        );
    }

    return (
        <div className="searchResults">
            {results.map((user) => (
                <div key={user._id} className="searchResult">
                    <img
                        src={user.profilePicture || '/assets/img/default-profile.png'}
                        alt="User"
                        className="userProfilePicture"
                    />
                    <h3 className="userName">{user.username}</h3>
                    <button onClick={() => onSendRequest(user._id)}>Send Friend Request</button>
                </div>
            ))}
        </div>
    );
};

// name: FriendRequests
// input: Props object with requests array, onAccept callback, and onReject callback
// output: JSX list of pending friend requests or a message indicating no pending requests
// description: Displays a list of pending friend requests. 
// Allows the user to accept or reject each request using the provided callback functions.
const FriendRequests = ({ requests, onAccept, onReject }) => {
    if(requests.length === 0) {
        return <h3>No Pending Friend Requests!</h3>;
    }

    return (
        <div className='friendRequests'>
            <h3>Pending Friend Requests</h3>
            {requests.map((request) => (
                <div key={request._id} className="friendRequest">
                    <img
                        src={request.profilePicture || '/assets/img/default-profile.png'}
                        alt="User"
                        className="userProfilePicture"
                    />
                    <h3>{request.username}</h3>
                    <button onClick={() => onAccept(request._id)}>Accept</button>
                    <button onClick={() => onReject(request._id)}>Reject</button>
                </div>
            ))}
        </div>
    );
};

// name: App
// input: None
// output: JSX for the main application layout, including friend search, requests, and friend list sections
// description: Manages the state and interactions for searching users, sending/accepting/rejecting friend requests, 
// and displaying the list of current friends. Fetches data from the backend API for friend requests and friends.
const App = () => {
    const [searchResults, setSearchResults] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        const fetchFriendRequests = async () => {
            try {
                const response = await fetch('/getFriendRequests');
                const data = await response.json();
                setFriendRequests(data.requests || []);
            } catch (err) {
                console.error('Error fetching friend requests:', err);
            }
        };

        const fetchFriends = async () => {
            try {
                const response = await fetch('/getFriends');
                const data = await response.json();
                setFriends(data.friends || []);
            } catch (err) {
                console.error('Error fetching friends:', err);
            }
        };

        fetchFriendRequests();
        fetchFriends();
    }, []);

    const handleSendRequest = async (friendId) => {
        try {
            const response = await fetch('/sendFriendRequest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ friendId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to send friend request.');
            } else {
                alert('Friend request sent!');
            }
        } catch (err) {
            console.error('Error sending friend request:', err);
        }
    };

    const handleAcceptRequest = async (senderId) => {
        try {
            const response = await fetch('/acceptFriendRequest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ senderId }),
            });

            if (response.ok) {
                alert('Friend request accepted!');
                setFriendRequests((prev) => prev.filter((req) => req._id !== senderId));
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to accept friend request.');
            }
        } catch (err) {
            console.error('Error accepting friend request:', err);
        }
    };

    const handleRejectRequest = async (senderId) => {
        try {
            const response = await fetch('/rejectFriendRequest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ senderId }),
            });

            if (response.ok) {
                alert('Friend request rejected!');
                setFriendRequests((prev) => prev.filter((req) => req._id !== senderId));
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to reject friend request.');
            }
        } catch (err) {
            console.error('Error rejecting friend request:', err);
        }
    };

    return (
        <div>
            <FriendForm onSearchResults={(results) => setSearchResults(results)} />
            <SearchResults 
                results={searchResults} 
                onSendRequest={handleSendRequest} 
            />

            <FriendRequests
                requests={friendRequests}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
            />

            <div className="friendsList">
                <h3>Current Friends</h3>
                {friends.length === 0 ? (
                    <p>No current friends!</p>
                ) : (
                    <div className="searchResults">
                        {friends.map((friend) => (
                            <div key={friend._id} className="searchResult">
                                <img
                                    src={friend.profilePicture || '/assets/img/default-profile.png'}
                                    alt="User"
                                    className="userProfilePicture"
                                />
                                <h3 className="userName">{friend.username}</h3>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// name: init
// description: Initializes the React application by rendering the App component into the DOM.
const init = () => {
    const root = createRoot(document.getElementById('friend'));
    root.render(<App />);
};

window.onload = init;

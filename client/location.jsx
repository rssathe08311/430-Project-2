const helper = require('./helper.js');
const React = require('react');
const {createRoot} = require('react-dom/client');
const { useState, useEffect, useRef } = React;


// name: handleLocationSubmit
// input: Event object (e), callback function (onLocAdded)
// output: None (Handles form submission and sends data to the server)
// description: Validates location data, handles errors, and sends a POST request to create a new location.
const handleLocationSubmit = async (e, onLocAdded) => {
    e.preventDefault();
    helper.hideDrinkError();

    const name = e.target.querySelector('#locName').value.trim();
    const address = e.target.querySelector('#locAdd').value.trim();
    const longitude = parseFloat(e.target.querySelector('#locLong').value);
    const latitude = parseFloat(e.target.querySelector('#locLat').value);

    if (!name || !address || longitude === undefined || latitude === undefined) {
        helper.handleLocationError('Name, address, longitude, and latitude are required!');
        return false;
    }

    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
        helper.handleDrinkError('Longitude must be between -180 and 180, Latitude must be between -90 and 90!');
        return false;
    }

    await helper.sendLocPost('/makeLocation', { name, address, coordinates: [longitude, latitude] }, onLocAdded);
    return false;
};

// name: LocationForm
// input: Props object containing triggerReload callback
// output: JSX structure for the location form
// description: Renders a form for adding new locations and triggers a callback on form submission.
const LocationForm = (props) => {
    return (
        <form
            id="locationForm"
            onSubmit={(e) => handleLocationSubmit(e, props.triggerReload)}
            name="locationForm"
            method="POST"
            className="locationForm"
        >
            <label htmlFor="locName">Name:</label>
            <input id="locName" type="text" placeholder="Location Name" />

            <label htmlFor="locAdd">Address:</label>
            <input id="locAdd" type="text" placeholder="Location Address" />

            <label htmlFor="locLong">Longitude:</label>
            <input id="locLong" type="number" step="any" placeholder="Longitude" />

            <label htmlFor="locLat">Latitude:</label>
            <input id="locLat" type="number" step="any" placeholder="Latitude" />

            <button className='makeLocationSubmit' type="submit">Add Location</button>
        </form>
    );
};

// name: LocationList
// input: Props object containing locations array and triggerReload callback
// output: JSX structure displaying a list of locations or a message if no locations are available
// description: Renders a list of locations with options to remove individual items.
const LocationList = (props) => {
    const handleRemoveLocation = async (id) => {
        try {
            const response = await fetch('/removeLocation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error removing drink:', errorData.error);
                return;
            }

            props.triggerReload();
        } catch (err) {
            console.error('Error removing location:', err);
        }
    };

    if (props.locations.length === 0) {
        return <p>No locations added yet!</p>;
    }

    return (
        <div className="location-list">
            {props.locations.map((location) => (
                <div key={location._id} className="location-item">
                    <h3>{location.name}</h3>
                    <p>Address: {location.address}</p>
                    <button onClick={() => handleRemoveLocation(location._id)}>Remove</button>
                </div>
            ))}
        </div>
    );
};


// name: App
// input: None
// output: JSX structure containing the LocationForm and LocationList components
// description: Manages state for reloading drinks and renders the main application layout.
const App = () => {
    const [locations, setLocations] = useState([]);
    const [reloadLocations, setReloadLocations] = useState(false);

    useEffect(() => {
        const loadLocationsFromServer = async () => {
            try {
                const response = await fetch('/getLocations');
                const data = await response.json();
                setLocations(data.locations || []);
            } catch (err) {
                console.error('Error loading locations:', err);
            }
        };

        loadLocationsFromServer();
    }, [reloadLocations]);

    return (
        <div>
            <LocationForm triggerReload={() => setReloadLocations(!reloadLocations)} />
                {}
            <LocationList locations={locations} triggerReload={() => setReloadLocations(!reloadLocations)} />
        </div>
    );
};

// name: init
// description: Initializes the React application by rendering the App component into the DOM.
const init = () => {
    const root = createRoot(document.getElementById('location'));
    root.render(<App />);
};

window.onload = init;
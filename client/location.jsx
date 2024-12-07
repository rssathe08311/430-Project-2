const helper = require('./helper.js');
const React = require('react');
const {createRoot} = require('react-dom/client');
const { useState, useEffect, useRef } = React;
//import mapboxgl from 'mapbox-gl';
//import 'mapbox-gl/dist/mapbox-gl.css';
//
//mapboxgl.accessToken = window.MAPBOX_TOKEN;
//mapboxgl.workerClass = null;


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

            <button type="submit">Add Location</button>
        </form>
    );
};

const LocationList = (props) => {
    const handleRemoveLocation = async (id) => {
        try {
            await fetch('/removeLocation', {
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
                    <p>
                        Coordinates: {location.loc.coordinates[0]}, {location.loc.coordinates[1]}
                    </p>
                    <button onClick={() => handleRemoveLocation(location._id)}>Remove</button>
                </div>
            ))}
        </div>
    );
};

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
            <h1>Location Manager</h1>
            <LocationForm triggerReload={() => setReloadLocations(!reloadLocations)} />
            <LocationList locations={locations} triggerReload={() => setReloadLocations(!reloadLocations)} />
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('location'));
    root.render(<App />);
};

window.onload = init;
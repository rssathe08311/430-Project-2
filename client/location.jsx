const helper = require('./helper.js');
const React = require('react');
const {createRoot} = require('react-dom/client');
const { useState, useEffect, useRef } = React;
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.MAPBOX_TOKEN;

//page for adding/creating new locations to get drinks at

const MapBox = ({locations}) => {
    const mapContainerRef = useRef(null);

    useEffect(() => {
        const map = new mapboxgl.Map({
            container:mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-75.71615970715911, 43.025810763917775],
            zoom: 3,
        });

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        locations.forEach((location) => {
            new mapboxgl.Marker()
            .setLngLat([location.location.coordinates[0], location.location.coordinates[1]])
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(location.name)) // Popup with location name
                .addTo(map);
        });

        return () => map.remove();
    }, [locations]);

    return <div ref={mapContainerRef} style={{ width: '100%', height: '500px' }} />;
}

const handleLocation = (e, onLocationAdded) => {
    e.preventDefault();
    helper.hideDrinkError();

    const name = e.target.querySelector('#locName').value;
    const addy = e.target.querySelector('#locAdd').value;
    const locLong = e.target.querySelector('#locLong').value;
    const locLat = e.target.querySelector('#locLat').value;

    if(!name || !locLong || !locLat) {
        helper.handleDrinkError('All fields are required!');
        return false;
    }

    helper.sendLocPost(e.target.action, {name, addy, locLong, locLat}, onLocationAdded);
    return false;
}

const LocationForm = (props) => {
    return(
        <form id='LocationForm'
            onSubmit = {(e) => handleLocation(e, props.triggerReload)}
            name='LocationForm'
            action='/location'
            method='POST'
            className='locationForm'
        >
            <label htmlFor='name'>Name: </label>
            <input id='locationName' type='text' name='name' placeholder='Location Name' />

            <label htmlFor='addy'>Address: </label>
            <input id='locationAddress' type='text' name='addy' placeholder='Location Address' />

            <label htmlFor="locLong">Longitude: </label>
            <input id="locLong" type="number" step="any" name="longitude" placeholder="Longitude" />

            <label htmlFor="locLat">Latitude: </label>
            <input id="locLat" type="number" step="any" name="latitude" placeholder="Latitude" />

            <button type="submit">Add Location</button>
        </form>
    )
}

const LocationList = (props) => {
    const [locations, setLocations] = useState(props.locations);

    useEffect(() => {
        loadLocationsFromServer = async () => {
            const response = await fetch('/getLocations');
            const data = await response.json();
            setLocations(data.locations);
        };
        loadLocationsFromServer();
    }, [props.reloadLocations]);

    const handleRemoveLocation = async (id) => {
        try{
            const response = await fetch('/removeLocation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error removing location:', errorData.error);
                return;
            }

            props.triggerReload()
        } catch (err) {
            console.error('Error sending remove request:', err);
        }
    };

    if(locations.length === 0){
        return (
            <div className='locationList'>
                <h3 className='emptyLocation'>No Locations Yet!</h3>
            </div>
        );
    }

    const locationNodes = locations.map(location => {
        return (
            <div key={location._id} className='location'>
                <img src='/assets/img/logo.png' alt="location" className='locationFace' />
                <h3 className='drinkName'>{location.name}</h3>
                <h3 className='drinkAge'>{location.address}</h3>
                <button onClick={() => handleRemoveLocation(location._id)}>Delete</button>
            </div>
        )
    });
    return (
        <div className='locationsList'>
            {locationNodes}
        </div>
    );
};

const App = () => {
    const [reloadLocations, setReloadLocations] = useState(false);
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        const fetchLocations = async () => {
            const response = await fetch('/getLocations');
            const data = await response.json();
            setLocations(data.locations || []);
        };
        fetchLocations();
    }, [reloadLocations]);

    return (
        <div>
            <div id='map'>
                <MapBox locations={locations} />
            </div>
            <div id='makeLocation'>
                <LocationForm triggerReload={() => setReloadLocations(!reloadLocations)}/>
            </div>
            <div id='locations'>
                <LocationList 
                locations={[]} 
                reloadLocations={reloadLocations} 
                triggerReload={() => setReloadLocations(!reloadLocations)}
                 />
            </div>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('location'));
    root.render( <App />);
};

window.onload = init;
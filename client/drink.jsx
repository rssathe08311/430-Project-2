const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

// name: handleDrink
// input: Event object (e), callback function (onDrinkAdded)
// output: Boolean indicating success or failure of handling the drink form submission
// description: Validates drink form input fields, displays an error if validation fails, 
// and sends a POST request to add a new drink using helper functions.
const handleDrink = (e, onDrinkAdded) => {
    e.preventDefault();
    helper.hideDrinkError();

    const name = e.target.querySelector('#drinkName').value;
    const temperature = e.target.querySelector('#drinkTemp').value;
    const ingredients = e.target.querySelector('#drinkIngredients').value;
    const favorite = e.target.querySelector('#drinkFavorite').checked;

    if(!name || !temperature || ingredients.length === 0) {
        helper.handleDrinkError('All fields are required');
        return false;
    }

    helper.sendDrinkPost(e.target.action, { name, temperature, ingredients, favorite }, onDrinkAdded);
    return false;
}

// name: DrinkForm
// input: Props object with a triggerReload function
// output: JSX form element for adding a new drink
// description: Renders a drink form with fields for name, temperature, ingredients, and a favorite toggle.
// Submits the form using the handleDrink function.
const DrinkForm = (props) => {
    return(
        <form id="drinkForm"
            onSubmit={(e) => handleDrink(e, props.triggerReload)}
            name='drinkForm'
            action='/drink'
            method='POST'
            className='drinkForm'
        >
            <label htmlFor='name'>Name: </label>
            <input id='drinkName' type='text' name='name' placeholder='Drink Name' />
            
            <label htmlFor="temperature">Temperature: </label>
            <select id="drinkTemp" name="temperature">
                <option value="Hot">Hot</option>
                <option value="Cold">Cold</option>
            </select>

            <label htmlFor='ingredients'>Ingredients:</label>
            <input id="drinkIngredients" type="text" name="ingredients" placeholder="e.g., coffee, tea, water, sugar" />

            <div id='favCheck'>
                <label htmlFor="favorite">Favorite: </label>
                <input id="drinkFavorite" type="checkbox" name="favorite" />
            </div>
            

            <input className='makeDrinkSubmit' type='submit' value='Make Drink' />
        </form>
    )
}

// name: DrinkList
// input: Props object with drinks array, reloadDrinks flag, and triggerReload function
// output: JSX list of drinks or a message indicating no drinks exist
// description: Displays a list of drinks fetched from the server. 
// Allows removing or toggling favorite status of drinks, and triggers data reload.
const DrinkList = (props) => {
    const [drinks, setDrinks] = useState(props.drinks);

    useEffect(() => {
        const loadDrinksFromServer = async () => {
            const response = await fetch('/getDrinks');
            const data = await response.json();
            setDrinks(data.drinks);
        };
        loadDrinksFromServer();
    }, [props.reloadDrinks]);

    const handleRemoveDrink = async (id) => {
        try {
            const response = await fetch('/removeDrink', {
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
            console.error('Error sending remove request:', err);
        }
    };

    const handleFavoriteDrink = async (id) => {
        try {
            const response = await fetch('/favoriteDrink', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ _id: id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error favoriting drink:', errorData.error);
                return;
            }

            props.triggerReload();
        } catch (err) {
            console.error('Error sending favorite request:', err);
        }
    };

    if(drinks.length === 0) {
        return (
            <div className='drinksList'>
                <h3 className='emptyDrink'>No Drinks Yet!</h3>
            </div>
        );
    }

    const drinkNodes = drinks.map(drink => {
        console.log(drink.temperature)
        console.log(drink.ingredients)
        return (
            <div key={drink._id} className='drink'>
                <img src='/assets/img/logo.png' alt="drink" className='drinkFace' />
                <h3 className='drinkName'>{drink.name}</h3>
                <div>
                    <label htmlFor={`favorite-${drink._id}`}>Favorite: </label>
                    <input
                        type="checkbox"
                        id={`favorite-${drink._id}`}
                        checked={drink.favorite || false}
                        onChange={(e) => handleFavoriteDrink(drink._id)}
                    />
                </div>
                <h3 className='drinkAge'>Temperature: {drink.temperature}</h3>
                <h3 className='drinkIngredients'>Ingredients: {drink.ingredients.split(',').map((ingredient, index) => (
        <li key={index}>{ingredient.trim()}</li>
    ))}</h3>
                <button onClick={() => handleRemoveDrink(drink._id)}>Delete</button>
            </div>
        );
    });

    return (
        <div className='drinksList'>
            {drinkNodes}
        </div>
    );
};

// name: App
// input: None
// output: JSX structure containing the DrinkForm and DrinkList components
// description: Manages state for reloading drinks and renders the main application layout.
const App = () => {
    const [reloadDrinks, setReloadDrinks] = useState(false);

    return (
        <div>
            <div id='makeDrink'>
                <DrinkForm triggerReload={() => setReloadDrinks(!reloadDrinks)}/>
            </div>
            <div id='drinks'>
                <DrinkList drinks={[]} reloadDrinks={reloadDrinks} triggerReload={() => setReloadDrinks(!reloadDrinks)} />
            </div>
        </div>
    );
};

// name: init
// description: Initializes the React application by rendering the App component into the DOM.
const init = () => {
    const root = createRoot(document.getElementById('drink'));
    root.render( <App />);
};

window.onload = init;
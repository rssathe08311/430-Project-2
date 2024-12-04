const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

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
                <h3 className='drinkAge'>Temperature: {drink.temperature}</h3>
                <h3 className='drinkIngredients'>Ingredients: {drink.ingredients}</h3>
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

const init = () => {
    const root = createRoot(document.getElementById('drink'));
    root.render( <App />);
};

window.onload = init;
const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

const handleDrink = (e, onDrinkAdded) => {
    e.preventDefault();
    helper.hideDrinkError();

    const name = e.target.querySelector('#drinkName').value;
    const temperature = e.target.querySelector('#drinkTemp').value;

    if(!name || !temperature) {
        helper.handleDrinkError('All fields are required');
        return false;
    }

    helper.sendDrinkPost(e.target.action, { name, temperature }, onDrinkAdded);
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
            <label htmlFor='temperature'>Temperature: </label>
            <input id='drinkTemp' type='number' min='0' name='temperature' />
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

    if(drinks.length === 0) {
        return (
            <div className='drinksList'>
                <h3 className='emptyDrink'>No Drinks Yet!</h3>
            </div>
        );
    }

    const drinkNodes = drinks.map(drink => {
        return (
            <div key={drink.id} className='drink'>
                <img src='/assets/img/drink.png' alt="drink" className='drinkFace' />
                <h3 className='drinkName'>Name: {drink.name}</h3>
                <h3 className='drinkAge'>Temperature: {drink.temperature}</h3>
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
                <DrinkList drinks={[]} reloadDrinks={reloadDrinks} />
            </div>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('drink'));
    root.render( <App />);
};

window.onload = init;
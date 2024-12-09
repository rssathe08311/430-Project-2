/* Takes in an error message. Sets the error message up in html, and
   displays it to the user. Will be hidden by other events that could
   end in an error.
*/

// name: handleDrinkError
// input: message (string) - The error message to display.
// output: None
// description: Sets the error message in the DOM and displays it to the user. The error message is displayed in an HTML element with ID 'drinkMessage'. The message will be hidden when other events occur that might trigger errors.

const handleDrinkError = (message) => {
  document.getElementById('errorMessage').textContent = message;
  document.getElementById('drinkMessage').classList.remove('hidden');
};


// name: sendPost
// input: 
//   - url (string) - The URL for the POST request.
//   - data (object) - The data to send in the POST request body.
//   - handler (function) - Optional callback to handle the response.
// output: None
// description: Sends a POST request to the specified URL with the given data. 
// Handles the JSON response by checking for redirection, errors, and calling the optional handler function.
const sendPost = async (url, data, handler) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  document.getElementById('drinkMessage').classList.add('hidden');

  if(result.redirect) {
    window.location = result.redirect;
  }

  if(result.error) {
    handleError(result.error);
  }

  if(handler) {
    handler(result);
  }
};

// name: sendDrinkPost
// input: 
//   - url (string) - The URL for the POST request.
//   - data (object) - The data to send in the POST request body.
//   - handler (function) - Optional callback to handle the response.
// output: None
// description: Sends a POST request to the specified URL with the given data. 
// Handles the JSON response by checking for redirection, errors, and calling the optional handler function.
const sendDrinkPost = async (url, data, handler) => {
  const response = await fetch(url, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
  });

  const result = await response.json();
  document.getElementById('drinkMessage').classList.add('hidden');

  if (result.redirect) {
      window.location = result.redirect;
  }

  if (result.error) {
      handleDrinkError(result.error);
  }

  if (handler) {
      handler(result);
  }
};

// name: sendLocPost
// input: 
//   - url (string) - The URL for the POST request.
//   - data (object) - The data to send in the POST request body.
//   - handler (function) - Optional callback to handle the response.
// output: None
// description: Sends a POST request to the specified URL with the given data. 
// Handles the JSON response by checking for redirection, errors, and calling the optional handler function.
const sendLocPost = async (url, data, handler) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  document.getElementById('drinkMessage').classList.add('hidden');

  if (result.redirect) {
    window.location = result.redirect;
  }

  if (result.error) {
      handleDrinkError(result.error);
  }

  if (handler) {
      handler(result);
  }
}

// name: sendFriendPost
// input: 
//   - url (string) - The URL for the POST request.
//   - data (object) - The data to send in the POST request body.
//   - handler (function) - Optional callback to handle the response.
// output: None
// description: Sends a POST request to the specified URL with the given data. 
// Handles the JSON response by checking for redirection, errors, and calling the optional handler function.
const sendFriendPost = async (url, data, handler) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  document.getElementById('drinkMessage').classList.add('hidden');

  if (result.redirect) {
    window.location = result.redirect;
  }

  if (result.error) {
      handleDrinkError(result.error);
  }

  if (handler) {
      handler(result);
  }
}


// name: hideDrinkError
// input: None
// output: None
// description: Hides the error message by adding the 'hidden' class to the element with the ID 'drinkMessage'.
const hideDrinkError = () => {
  const drinkMessage = document.getElementById('drinkMessage');
  console.log('drinkMessage element:', drinkMessage);
  if (!drinkMessage) {
      console.error('drinkMessage element not found!');
      return;
  }
  drinkMessage.classList.add('hidden');
};


module.exports = {
    handleDrinkError,
    sendPost,
    sendDrinkPost,
    sendLocPost,
    sendFriendPost,
    hideDrinkError,
}
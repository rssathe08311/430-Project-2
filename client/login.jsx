const helper = require('./helper.js');
const React = require('react');
const {createRoot} = require('react-dom/client');

// name: handleLogin
// input: Event object (e)
// output: None (Handles form submission for login)
// description: Validates login credentials and sends a POST request to the server.
const handleLogin = (e) => {
    e.preventDefault();
    helper.hideDrinkError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;

    if(!username || !pass) {
        helper.handleDrinkError('Username or password is empty!');
        return false;
    }

    helper.sendPost(e.target.action, {username, pass});
    return false;
}

// name: handleSignup
// input: Event object (e)
// output: None (Handles form submission for signup)
// description: Validates signup credentials, checks if passwords match, 
// and sends a POST request to the server.
const handleSignup = (e) => {
    e.preventDefault();
    helper.hideDrinkError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;

    if(!username || !pass || !pass2) {
        helper.handleDrinkError('All fields are required!');
        return false;
    }

    if(pass !== pass2) {
        helper.handleDrinkError('Passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, {username, pass, pass2});
    return false;
}

// name: handlePasswordChange
// input: Event object (e)
// output: None (Handles form submission for password change)
// description: Validates password change data, checks if new passwords match, 
// and sends a POST request to the server.
const handlePasswordChange = (e) => {
    e.preventDefault();
    helper.hideDrinkError();

    const username = e.target.querySelector('#username').value;
    const newPass = e.target.querySelector('#newPass').value;
    const newPass2 = e.target.querySelector('#newPass2').value;

    if (!username || !newPass || !newPass2) {
        helper.handleDrinkError('All fields are required!');
        return false;
    }

    if (newPass !== newPass2) {
        helper.handleDrinkError('New passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, { username, newPass, newPass2 });
    return false;
};

// name: LoginWindow
// input: None
// output: JSX structure for the login form
// description: Renders a login form and handles login submissions.
const LoginWindow = (props) => {
    return (
        <form id="loginForm"
            name="loginForm"
            onSubmit={handleLogin}
            action="/login"
            method="POST"
            className="mainForm"
        >
            <label htmlFor="username">Username: </label>
            <input id="user" type="text" name="username" placeholder="username" />
            <label htmlFor="pass">Password: </label>
            <input id="pass" type="password" name="pass" placeholder="password" />
            <input className="formSubmit" type="submit" value="Sign in" />
        </form>
    );
};

// name: SignupWindow
// input: None
// output: JSX structure for the signup form
// description: Renders a signup form and handles signup submissions.
const SignupWindow = (props) => {
    return (
        <form id="signupForm"
            name="signupForm"
            onSubmit={handleSignup}
            action="/signup"
            method="POST"
            className="mainForm"
        >
            <label htmlFor="username">Username: </label>
            <input id="user" type="text" name="username" placeholder="username" />
            <label htmlFor="pass">Password: </label>
            <input id="pass" type="password" name="pass" placeholder="password" />
            <label htmlFor="pass">Password: </label>
            <input id="pass2" type="password" name="pass2" placeholder="retype password" />
            <input className="formSubmit" type="submit" value="Sign up" />
        </form>
    )
}

// name: ChangePasswordWindow
// input: None
// output: JSX structure for the change password form
// description: Renders a change password form and handles password change submissions.
const ChangePasswordWindow = (props) => {
    return (
        <form id="changePasswordForm"
            name="changePasswordForm"
            onSubmit={handlePasswordChange}
            action="/changePassword"
            method="POST"
            className="mainForm"
        >
            <label htmlFor="username">Username: </label>
            <input id="username" type="text" name="username" placeholder="username" />
            <label htmlFor="newPass">New Password: </label>
            <input id="newPass" type="password" name="newPass" placeholder="new password" />
            <label htmlFor="newPass2">Retype New Password: </label>
            <input id="newPass2" type="password" name="newPass2" placeholder="retype new password" />
            <input className="formSubmit" type="submit" value="Change Password" />
        </form>
    );
};

// name: init
// input: None
// output: None
// description: Initializes the application, sets up button event listeners, 
// and renders the LoginWindow by default.
const init = () => {
    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');
    const changePasswordButton = document.getElementById('changePasswordButton');

    const root = createRoot(document.getElementById('content'));

    loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render( <LoginWindow />);
        return false;
    });

    signupButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render( <SignupWindow />);
        return false;
    });

    changePasswordButton.addEventListener('click', (e) => {
        e.preventDefault();
        root.render(<ChangePasswordWindow />);
        return false;
    });

    root.render( <LoginWindow />);
}

window.onload = init;
# ForeCafe

ForeCafe is a full-stack social web application for sharing favorite café drinks, saving café locations, and connecting with friends. The project uses an MVC-style Node.js backend with MongoDB for persistence, Redis-backed sessions for authentication state, Handlebars for page templates, and React bundles for interactive client-side views.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Application Routes](#application-routes)
- [Data Model Summary](#data-model-summary)
- [Security and Middleware](#security-and-middleware)
- [Development Notes](#development-notes)

## Overview

ForeCafe is designed as a small social platform centered around café culture. After creating an account, users can:

- create and manage drinks,
- save café locations with coordinates,
- mark drinks as favorites,
- search for other users,
- send, accept, and reject friend requests,
- browse a shared home feed containing drinks and locations from across the platform,
- view a personal profile page with friends, favorite drinks, and saved locations.

The app serves Handlebars views from the Express server and mounts page-specific React applications into those views for dynamic behavior.

## Key Features

### Authentication and Sessions
- Sign up with a username and password.
- Log in and log out with server-managed sessions.
- Change account passwords.
- Secure session storage using Redis.

### Drink Management
- Create drinks with a name, temperature, and ingredients.
- Mark drinks as favorites at creation time or later.
- Remove previously created drinks.
- View personal drinks and shared drink content on the home page.

### Location Management
- Save café locations with a name, address, longitude, and latitude.
- Remove saved locations.
- View personal locations and platform-wide location content on the home page.

### Social Features
- Search for users by username.
- Send friend requests.
- Accept or reject incoming friend requests.
- View current friends on the friends page.
- View friends and favorite drinks on the profile page.

### Built-In Documentation
- The application includes an authenticated `/documentation` page that lists supported routes and expected request formats.

## Tech Stack

### Backend
- Node.js
- Express
- Mongoose
- MongoDB
- Redis
- express-session
- connect-redis
- Handlebars

### Frontend
- React
- React DOM
- Webpack
- Babel
- CSS

### Supporting Libraries
- bcrypt for password hashing
- helmet for secure HTTP headers
- compression for response compression
- body-parser for JSON and form handling

## Project Structure

```text
.
├── client/                 # React entry points for each page
├── hosted/                 # Compiled frontend bundles, styles, and static assets
├── server/
│   ├── controllers/        # Route handlers and application logic
│   ├── middleware/         # Authentication and request middleware
│   ├── models/             # Mongoose schemas and model exports
│   ├── app.js              # Express app bootstrap
│   └── router.js           # Route definitions
├── views/                  # Handlebars page templates
├── webpack.config.js       # Frontend bundle configuration
└── package.json            # Dependencies and npm scripts
```

## Getting Started

### Prerequisites

Make sure the following services and tools are available locally:

- Node.js 18 or higher
- npm
- MongoDB
- Redis

### Installation

1. Clone the repository.
2. Install dependencies:

   ```bash
   npm ci
   ```

3. Create a `.env` file in the project root.
4. Add the required environment variables listed below.
5. Start MongoDB and Redis.
6. Build the frontend bundles:

   ```bash
   npm run webpack
   ```

7. Start the server:

   ```bash
   npm start
   ```

8. Open `http://localhost:3000` in your browser unless you configured a different port.

## Environment Variables

The server reads configuration from environment variables with `dotenv`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | Primary port used by the Express server. |
| `NODE_PORT` | No | Fallback port if `PORT` is not set. |
| `MONGODB_URI` | No | MongoDB connection string. Defaults to `mongodb://127.0.0.1/ForeCafe`. |
| `REDISCLOUD_URL` | Yes | Redis connection URL used for session storage. Despite the name, it can point to a local Redis instance or a hosted Redis service. |

Example:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1/ForeCafe
REDISCLOUD_URL=redis://127.0.0.1:6379
```

## Available Scripts

| Script | Description |
| --- | --- |
| `npm start` | Starts the Express server. |
| `npm run nodemon` | Starts the server with file watching for server, HTML, and CSS changes. |
| `npm run webpack` | Builds the React frontend bundles into `hosted/`. |
| `npm run webpackWatch` | Rebuilds frontend assets in watch mode. |
| `npm test` | Runs ESLint on the `server/` directory and then executes the placeholder test command. |

## Application Routes

### Page Routes

| Route | Method | Description | Access |
| --- | --- | --- | --- |
| `/` | GET | Login page | Logged-out users |
| `/login` | GET | Login page | Logged-out users |
| `/home` | GET | Shared home feed for drinks and locations | Logged-in users |
| `/documentation` | GET | In-app API documentation page | Logged-in users |
| `/drink` | GET | Drink management page | Logged-in users |
| `/location` | GET | Location management page | Logged-in users |
| `/profile` | GET | Logged-in user profile | Logged-in users |
| `/friend` | GET | Friend search and requests page | Logged-in users |
| `/logout` | GET | Destroys session and redirects to login | Logged-in users |

### Account and Social API

| Route | Method | Description |
| --- | --- | --- |
| `/login` | POST | Authenticates a user and starts a session |
| `/signup` | POST | Creates a new account |
| `/changePassword` | POST | Changes a user password |
| `/getUserProfile` | GET | Returns profile data, favorite drinks, friends, and locations |
| `/getFriends` | GET | Returns the authenticated user's friends |
| `/searchUsers` | GET | Searches users by username with a `query` parameter |
| `/sendFriendRequest` | POST | Sends a friend request to another user |
| `/acceptFriendRequest` | POST | Accepts a pending friend request |
| `/rejectFriendRequest` | POST | Rejects a pending friend request |
| `/getFriendRequests` | GET | Returns pending friend requests |
| `/getHomeData` | GET | Returns drinks and locations shown on the home feed |

### Drink API

| Route | Method | Description |
| --- | --- | --- |
| `/drink` | POST | Creates a new drink |
| `/getDrinks` | GET | Returns drinks owned by the authenticated user |
| `/removeDrink` | POST | Deletes a drink by ID or name |
| `/favoriteDrink` | POST | Toggles a drink's favorite status |

### Location API

| Route | Method | Description |
| --- | --- | --- |
| `/makeLocation` | POST | Creates a new location |
| `/getLocations` | GET | Returns locations owned by the authenticated user |
| `/removeLocation` | POST | Deletes a location by ID or name |

## Data Model Summary

### Account
- `username`
- `password`
- `profilePicture`
- `friends`
- `friendRequests`
- `favoriteDrinks`
- `locations`
- `createdDate`

### Drink
- `name`
- `temperature` (`Hot` or `Cold`)
- `ingredients`
- `favorite`
- `owner`
- `createdDate`

### Location
- `name`
- `address`
- `loc.type`
- `loc.coordinates`
- `owner`
- `createdDate`

## Security and Middleware

- Passwords are hashed with `bcrypt`.
- Session state is stored in Redis using `express-session` and `connect-redis`.
- `helmet` is enabled for secure HTTP headers.
- Auth-protected routes use middleware that requires an active session.
- Logged-in users are redirected away from logged-out-only routes.
- Drink and location names are sanitized at the schema level with `underscore.escape`.

## Development Notes

- Frontend code lives in `client/` and is bundled per page with Webpack.
- Compiled assets are emitted into `hosted/`.
- The server automatically creates an `uploads` directory at startup if it does not exist.
- The current `npm test` script primarily performs linting and then prints a placeholder completion message, so additional automated test coverage may still be needed for production readiness.

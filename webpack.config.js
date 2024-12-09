const path = require('path');


module.exports = {
    entry: {
        drink: './client/drink.jsx',
        login: './client/login.jsx',
        profile: './client/profile.jsx',
        location: './client/location.jsx',
        friend: './client/friend.jsx',
        home: './client/home.jsx',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    mode: 'production',
    watchOptions: {
        aggregateTimeout: 200,
    },
    output: {
        path: path.resolve(__dirname, 'hosted'),
        filename: '[name]Bundle.js',
    },
    resolve: {
        extensions: ['.js', '.jsx'],
    },
};
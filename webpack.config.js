const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: [
        './src/index.js'
    ],
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        contentBase: './dist',
    },
    plugins: [
        new CopyWebpackPlugin([
            {from:'assets',to:'assets'},
            {from:'index.html',to:'index.html'}
        ]),
    ]
};
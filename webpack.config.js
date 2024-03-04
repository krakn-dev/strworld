const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const TerserPlugin = require("terser-webpack-plugin");

var config = {
    entry: './src/main.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
            },
            {
                test: /\.css$/,
                loader: 'css-loader',
            },
        ],
    },
    plugins: [new HtmlWebpackPlugin({ template: "./src/ui/index.html" })],
    resolve: {
        extensions: ['.ts'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
};

module.exports = (env, argv) => {
    config.mode = argv.mode
    if (argv.mode === 'production') {
        config.optimization = {
            minimize: true,
            minimizer: [new TerserPlugin()],
        }
    }
    else if (argv.mode === 'development') {
        config.watch = true
        config.watchOptions = {
            aggregateTimeout: 100,
            poll: 1000,
        }
        config.optimization = {
            minimize: false,
        }
        // express dev server
        const express = require("express");
        const app = express();
        app.use(express.static("dist"));
        //        app.listen(8080, "localhost");
        app.listen(8080, "192.168.1.7")
    }

    return config;
};


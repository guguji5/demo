const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const SpritesmithPlugin = require('webpack-spritesmith');

module.exports = {
    mode: 'none',
    entry: {
        app: './src/index.js',
        print: './src/print.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
            title: 'Output Management1'
        }),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader?limit=8192&name=[name].[hash:7].[ext]'
                ]
            }
        ]
    }
};
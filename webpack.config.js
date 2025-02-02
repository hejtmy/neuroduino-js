const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'neuroduino.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'Neuroduino',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 9000,
  }
}; 
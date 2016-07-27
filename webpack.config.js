module.exports = {  
  entry: ['./ts/IENotification.ts'],
  output: {
    path: "",
    filename: 'IENotification.js'
  },
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  },
  devtool: 'source-map',
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts-loader' }
    ]
  }
}
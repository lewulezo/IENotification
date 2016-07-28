module.exports = {  
  entry: ['./ts/IENotification.ts'],
  output: {
    filename: 'IENotification.js'
  },
  resolve: {
    extensions: ['', '.d.ts',' .webpack.js', '.web.js', '.ts', '.js']
  },
  devtool: 'source-map',
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts-loader' }
    ]
  }
}
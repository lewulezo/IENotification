module.exports = {  
  entry: ['ts/utils.ts'],
  output: {
    path: "js/",
    filename: 'ie-noti.js'
  },
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  },
  devtool: 'source-map',
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'awesome-typescript-loader' }
    ]
  }
}
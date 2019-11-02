const path = require('path')
const TerserJSPlugin = require('terser-webpack-plugin')
const WebpackBar = require('webpackbar')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const HtmlWebpackPlugin = require('html-webpack-plugin')
const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  mode: isDev ? 'development' : 'production',
  entry: path.resolve(__dirname,'src/index.js'),

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library:'viewport-check',
    libraryTarget:'umd',
  },
  resolve: {
    extensions: ['.js'],
  },
  devtool: isDev ? 'cheap-module-eval-source-map' : false,
  plugins: [
    !isDev && new CleanWebpackPlugin(),
    new WebpackBar(),
    !isDev && new BundleAnalyzerPlugin(),
    isDev && new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname,'src/index.html'),
      inject: true,
      cache: true,
    })
  ].filter(Boolean),
  optimization: {
    minimize: !isDev,
    minimizer: [new TerserJSPlugin({
      cache: true,
      parallel: true,
      terserOptions: {
        parse: {
          ecma: 8,
        },
        compress: isDev
          ? false
          : {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
          },
        output: {
          ecma: 5,
          comments: false,
          ascii_only: true,
        },
        ie8: true,
        safari10: true
      }
    })],
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            enforce: 'pre',
            test: /\.js$/,
            exclude: /(node_modules)/,
            loader: 'eslint-loader',
            options: {
              fix: true
            }
          },
          {
            test: /\.js$/,
            include: path.resolve(__dirname,'src'),
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
                babelrc: true,
              }
            }
          },
        ]
      }
    ],
  },
  stats: {
    all: false,
    children:true,
    colors: true,
    errors: true,
    warnings: true,
    timings: true,
  },
  devServer: isDev ? {
    overlay: true,
    noInfo: true,
    clientLogLevel: 'silent',
    hot: true,
    port: 3000,
    host: getIP(),
  } : {},
}

function getIP (force) {
  if (force) return force
  const os = require('os')
  const ifaces = os.networkInterfaces()
  for (const key in ifaces) {
    for (const details of ifaces[key]) {
      if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
        return details.address
      }
    }
  }
  return '0.0.0.0'
}

const path = require('path')
const TerserJSPlugin = require('terser-webpack-plugin')
const WebpackBar = require('webpackbar')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const HtmlWebpackPlugin = require('html-webpack-plugin')


module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname,'src/demo.js'),

  output: {
    path: path.resolve(__dirname, 'demo'),
    filename: 'index.js',
    library:'viewport-check',
    libraryTarget:'umd',
  },
  resolve: {
    extensions: ['.js'],
  },
  devtool:  'cheap-module-eval-source-map',
  plugins: [
    new CleanWebpackPlugin(),
    new WebpackBar(),
    new BundleAnalyzerPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname,'public/index.html'),
      inject: true,
      cache: true,
    })
  ].filter(Boolean),
  optimization: {
    minimize: true,
    minimizer: [new TerserJSPlugin({
      cache: true,
      parallel: true,
      terserOptions: {
        parse: {
          ecma: 8,
        },
        compress: {
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
          {
            test: /\.scss$/,
            use:  [
              { loader: 'style-loader' },
              {
                loader: 'css-loader',
                options: {
                  // 开启css中的图片打包功能
                  url: true,
                  importLoaders: 1,
                  sourceMap: true
                }
              },
              {loader: 'sass-loader'}
            ]
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
  node:{
    child_process: 'empty'
  }
}



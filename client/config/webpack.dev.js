const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const srcDir = path.resolve(__dirname, '..', 'src')
const distDir = path.resolve(__dirname, '..', 'dist')
const { NODE_ENV = 'development' } = process.env

module.exports = {
  // Where to fine the source code
  context: srcDir,

  // No source map for production build
  devtool: 'source-map',

  entry: [
    './index.js'
  ],

  output: {
    // The destination file name concatenated with hash (generated whenever you change your code).
    // The hash is really useful to let the browser knows when it should get a new bundle
    // or use the one in cache
    filename: 'main.js',

    // The destination folder where to put the output bundle
    path: distDir,

    // Wherever resource (css, js, img) you call <script src="..."></script>,
    // or css, or img use this path as the root
    publicPath: '/',

    // At some point you'll have to debug your code, that's why I'm giving you
    // for free a source map file to make your life easier
    sourceMapFilename: 'main.map'
  },

  devServer: {
    contentBase: srcDir,
    // match the output path
    publicPath: '/',
    // match the output `publicPath`
    historyApiFallback: true,
    port: 3000,
    proxy: {
      "/api": "http://localhost:5000",
      "/ws": { target: "ws://localhost:5000", ws: true }
    },
  },

  module: {
    rules: [
      {
        // Webpack, when walking down the tree, whenever you see `.js` file use babel to transpile
        // the code to ES5. I don't want you to look into the node_modules folder.
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          'babel-loader'
        ],
        include: srcDir
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [require('autoprefixer')({
                browsers: [
                  'last 3 version',
                  'ie >= 10' // supports IE from version 10 onwards
                ]
              })]
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.hbs$/,
        loader: 'handlebars-loader',
        query: {
          partialDirs: [
            path.join(srcDir, 'templates', 'partials')
          ]
        }
      },
      {
        test: /\.xml$/,
        loader: 'xml-loader',
        query: {
          partialDirs: [
            path.join(srcDir, 'assets')
          ]
        }
      },
      {
        test: /\.(eot?.+|svg?.+|ttf?.+|otf?.+|woff?.+|woff2?.+)$/,
        use: 'file-loader?name=assets/[name].[ext]'
      },
      {
        test: /\.(jpg|jpeg|png|gif|ico|svg)$/,
        use: [
          // if less than 10Kb, bundle the asset inline, if greater, copy it to the dist/assets
          // folder using file-loader
          'url-loader?limit=10240&name=assets/[name].[ext]'
        ],
        include: path.resolve(srcDir, 'assets')
      }
    ]
  },

  plugins: [
    new webpack.NamedModulesPlugin(),

    // environment globals added must be added to .eslintrc
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(NODE_ENV)
      },
      'NODE_ENV': NODE_ENV,
      '__DEV__': NODE_ENV === 'development',
      '__PROD__': NODE_ENV === 'production'
    }),

    new HtmlWebpackPlugin({
      // where to find the handlebars template
      template: path.join(srcDir, 'index.hbs'),

      // where to put the generated file
      path: distDir,

      // the output file name
      filename: 'index.html'
    })
  ]
}

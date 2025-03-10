const path = require('path');

const HtmlMinimizerPlugin = require('html-minimizer-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ElementInjectorPlugin = require('./plugins/element-injector-plugin');

module.exports = (env, argv) => {
  const regex_nm = /node_modules/;
  const isProd = env.NODE_ENV === 'production' || argv.mode === 'production';

  const projectPath = argv.projectPath || env.projectPath || process.cwd();
  const port  = argv.port || 8080;

  const optionsBuilder = ext => {
    return {
      name: '[path][name].' + (ext || '[ext]'),
      context: './src',
    };
  };

  return {
    entry: path.resolve(projectPath, 'src', 'index.ts'),
    devtool: isProd ? undefined : 'inline-source-map',
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
      }),
      new ElementInjectorPlugin({
        filename: 'main.css',
      })
    ],
    output: {
      path: path.resolve(projectPath, 'dist'),
      filename: 'main.js',
      clean: true
    },
    module: {
      rules: [
        { // Processing `ts` and `js` files
          test: /\.(ts|js)$/,
          use: ['babel-loader', 'ts-loader'],
          exclude: regex_nm,
        },
        { // Processing `html` files
          test: /\.html$/i,
          use: [
            {
              loader: 'file-loader',
              options: optionsBuilder('html'),
            }
          ],
          exclude: [regex_nm, path.resolve(projectPath, 'src', 'index.html')],
        },
        { // Processing `css` files
          test: /\.css$/,
          use: {
            loader: 'file-loader',
            options: optionsBuilder()
          },
          exclude: [regex_nm]
        },
        { // Processing `sass` files
          test: /\.s[ac]ss$/i,
          use: [
            { // Output the files
              loader: 'file-loader',
              options: optionsBuilder('css'),
            },
            // Compiles Sass to CSS
            'sass-loader',
          ],
          exclude: [regex_nm]
        },
        { // Processing other `static` files
          test: /\.(png|jpe?g|gif|svg|eot|otf|ttf|woff|woff2|txt|pdf)$/i,
          type: "asset",
          use: {
            loader: 'file-loader',
            options: optionsBuilder(),
          },
          exclude: [regex_nm]
        },
      ]
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    optimization: isProd ? {
      minimize: true,
      minimizer: [
        new CssMinimizerPlugin({
          test: /\.css$/i,
        }),
        new HtmlMinimizerPlugin({
          test: /\.html$/i,
        }),
        new TerserPlugin({
          test: /\.js(\?.*)?$/i,
        }),
      ],
    } : {},
    watchOptions: {
      ignored: regex_nm,
    },
    devServer: {
      port: port,
      historyApiFallback: true,
      hot: true,

      setupMiddlewares: (middlewares, devServer) => {
        devServer.app.use((req, res, next) => {
          if (!req.route) {
            res.sendFile(path.join(projectPath, 'index.html'));
          } else {
            next();
          }
        });
        return middlewares;
      }
    }
  }
};
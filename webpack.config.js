import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import HtmlMinimizerPlugin from 'html-minimizer-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserWebpackPlugin from 'terser-webpack-plugin';
/**
 * to be able to use `asset-copy-plugin` locally you need:
 * 1. install bouel-cli as dev dependency (`npm install --save-dev bouer-cli`)
 * 2. target the plugin via node_modules (`import AssetCopyPlugin from './node_modules/bouer-cli/plugins/asset-copy-plugin.js'`)
 */
import AssetCopyPlugin from './plugins/asset-copy-plugin.js';
import loadBouerConfig from './helpers/project-config-loader.js';

export default (env, argv) => {
  const nm_rgx = /node_modules/;
  const cwd = argv.projectPath || env.projectPath || process.cwd();
  const mode = argv.mode || env.NODE_ENV || 'development';

  // Global config
  const config = loadBouerConfig(cwd);

  // Project config
  const projectConfig = config.project;

  // CLI config
  const cliServerConfig = config.cli.server;

  // Build mode[development|production] config
  const buildModeConfig = projectConfig.build[mode];

  // Build filename
  const filename = [buildModeConfig.filename, '[name]', buildModeConfig.hash, 'js']
    .filter(x => x && x !== 'none').join('.');

  return {
    entry: projectConfig.entry,
    devtool: buildModeConfig.devtool,
    mode: mode,
    context: path.resolve(cwd, projectConfig.context), // Set the base directory
    plugins: [
      new HtmlWebpackPlugin({
        template: `./${projectConfig.build.index}`,
        filename: projectConfig.build.index
      }),
      new AssetCopyPlugin({
        patterns: (projectConfig.build.assets || []).map(asset => {
          return {
            from: path.resolve(cwd, projectConfig.context, asset),
            to: path.resolve(cwd, projectConfig.build.outputPath, asset)
          };
        })
      })
    ],
    output: {
      path: path.resolve(cwd, projectConfig.build.outputPath),
      filename: filename,
      clean: true
    },
    module: {
      rules: [
        { // Processing `ts` and `js` files
          test: /\.(ts|js)$/,
          use: [
            'babel-loader',
            {
              loader: 'ts-loader',
              options: {
                configFile: path.resolve(cwd, buildModeConfig.tsConfig || 'tsconfig.json'),
                transpileOnly: true
              },
            }
          ],
          exclude: [nm_rgx],
        },

        { // Process the `index.html` file
          test: /\.html$/i,
          loader: 'html-loader',
          options: {
            sources: true
          },
          exclude: [nm_rgx],
          include: [new RegExp(projectConfig.build.index + '$')]
        },

        { // Processing `html` files except `index.html`
          test: /\.html$/i,
          type: 'asset/resource',
          generator: {
            filename: '[path][name].html'
          },
          exclude: [nm_rgx, new RegExp(projectConfig.build.index + '$')]
        },

        { // Processing `css` files
          test: /\.css$/i,
          type: 'asset/resource',
          generator: {
            filename: '[path][name].css'
          },
          exclude: [nm_rgx]
        },

        { // Processing `scss` files, and compiling them into `css`
          test: /\.s[ac]ss$/i,
          type: 'asset/resource',
          generator: {
            filename: '[path][name].css'
          },
          use: ['sass-loader'],
          exclude: [nm_rgx]
        },

        { // Processing other `static` files
          test: /\.(png|jpe?g|gif|svg|eot|otf|ttf|woff|woff2|txt|pdf)$/i,
          type: 'asset/resource',
          generator: {
            filename: '[path][name][ext]'
          },
          exclude: [nm_rgx]
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    optimization: {
      minimize: buildModeConfig.minimize,
      // Configures vendor code splitting
      splitChunks: buildModeConfig.splitChunks ? {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: nm_rgx,
            name: 'vendor',
            chunks: 'all',
            enforce: true
          }
        }
      } : {},
      // If production, minify
      minimizer: buildModeConfig.minimize ? [
        new TerserWebpackPlugin({
          // Keep class names because Bouer uses them as component names
          terserOptions: { keep_classnames: true }
        }),
        new CssMinimizerPlugin({ test: /\.css$/i }),
        new HtmlMinimizerPlugin({ test: /\.html$/i }),
      ] : []
    },
    watchOptions: {
      ignored: nm_rgx,
    },
    devServer: {
      hot: cliServerConfig.hot,
      port: argv.port || cliServerConfig.port,
      historyApiFallback: true,
      static: {
        directory: path.resolve(cwd, cliServerConfig.staticDir),
      },
      devMiddleware: {
        publicPath: cliServerConfig.publicPath,
      },
      open: cliServerConfig.openBrowser,
      compress: cliServerConfig.compress,
    }
  };
};
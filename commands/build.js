import path from 'path';
import fs from 'fs';
import { execute } from '../helpers/executor.js';
import loadBouerConfig from '../helpers/project-config-loader.js';
import 'colors';


export default function buildCommand(program) {
  program
    .command('build')
    .alias('b')
    .description('Builds the Bouer.js project for development or production')
    .option('-m, --mode <mode>', 'Build mode (dev or prod)', 'dev')
    .option('--mix-config <config-path>', 'The other webpack.config.js path that need to mixed to', '')
    .action(options => {
      try {
        
        const cwd = process.cwd();
        const config = loadBouerConfig(cwd);

        // Check if we're in a Bouer.js project by looking for package.json
        const packagePath = path.join(cwd, 'package.json');
        if (!fs.existsSync(packagePath)) {
          console.error('Error:'.red + ' No package.json found. Make sure you are in a Bouer.js project directory.');
          process.exit(1);
        }

        // Build the project using webpack
        const mode = ({
          dev: 'development',
          prod: 'production',
          development: 'development',
          production: 'production'
        })[options.mode.toLowerCase()];

        console.log(`Starting Bouer build: ${mode.green}...`);

        // Set the mix config if provided
        options.mixConfig = options.mixConfig || config.project.build[mode].webpackMixConfig;

        // Execute the webpack build command
        const $execution = execute(`npx webpack --mode ${mode}`, options);

        $execution.once('close', (code) => {
          if (code !== 0) {
            console.error('Error building project.'.red + ' Check the console output for more information.');
            process.exit(1);
          }

          console.log('Build completed successfully!'.green);
        });

      } catch (error) {
        console.error('Error building project:'.red, error.message);
        process.exit(1);
      }

    });
};
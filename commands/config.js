import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'node:url';
import 'colors';

const cwd = process.cwd();
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Webpack config creation
function createWebpackConfig(options) {
  const cliWebpackConfigPath = path.join(__dirname, '..', 'webpack.config.js');
  let content = fs.readFileSync(cliWebpackConfigPath, 'utf8');

  if ('preview' in options) {
    console.log("\n\n");
    return console.log(content);
  }

  try {
    console.log('Generating ' + 'webpack.config.js'.yellow + ' file...');
    fs.writeFileSync(path.join(cwd, 'webpack.config.js'), content, 'utf8');
    console.log('webpack.config.js'.green + ' successfully generated...');
  } catch (error) {
    console.error('Error:'.red + 'Could not create webpack.config.js file.');
    console.error('Error:'.red, error.message);
    process.exit(1);
  }
}

function createBouerConfig() {
  const configPath = path.resolve(cwd, 'bouer.json');
  const action = fs.existsSync(configPath) ? 'restored' : 'generated';
  const defaultBouerConfig = require('../templates/default.bouer.json');

  fs.writeFileSync(configPath, JSON.stringify(defaultBouerConfig, null, 2), 'utf8');
  console.log('bouer.json'.green + ' successfully '+ action +'...');
}

export default function configCommand(program) {
  const config = program
    .command('config')
    .alias('cfg')
    .description('Bouer configuration management');

  // Subcommand for webpack config
  config
    .command('webpack')
    .alias('wp')
    .option('--preview', 'Used to preview the configuration instead of create it')
    .description('Generates a new webpack.config.js for the project according to the cli config')
    .action(async (options) => {
      try {
        createWebpackConfig(options);
      } catch (error) {
        console.error('Error:'.red, error.message);
        process.exit(1);
      }
    });

  // Subcommand for webpack config
  config
    .command('init')
    .alias('i')
    .description('Generates a new bouer.json configuration file')
    .action(async (options) => {
      try {
        createBouerConfig();
      } catch (error) {
        console.error('Error:'.red, error.message);
        process.exit(1);
      }
    });
}; 
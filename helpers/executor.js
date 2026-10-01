import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import 'colors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cwd = process.cwd();
const runtimeConfigName = 'runtime.webpack.config.js';
const runtimeWebpackConfigPath = path.join(__dirname, '../templates', runtimeConfigName);
const cliWebpackConfigPath = path.join(__dirname, '..', 'webpack.config.js');
const projectWebpackConfigPath = path.join(cwd, 'webpack.config.js');

function tempConfigHandler(options) {
  const wpConfig = options.wpConfig;
  const mixConfig = options.mixConfig;

  // If no mixConfig is provided, return the default webpack config
  if (!options.mixConfig)
    return {
      configPath: wpConfig,
      // Cleanup function
      cleanup: () => { }
    };

  const mixConfigPath = path.join(cwd, mixConfig);

  if (!fs.existsSync(mixConfigPath))
    throw new Error(`Error: The provided mix-config ${mixConfig} file was not found.`);

  // Set the content of the temporary webpack config file

  const fileContent = fs.readFileSync(runtimeWebpackConfigPath, 'utf-8')
    .replace(/{webpack-config-path}/g, wpConfig.replace(/\\/g, '\\\\'))
    .replace(/{mix-config-path}/g, mixConfigPath.replace(/\\/g, '\\\\'));

  // writing the merged config to a temporary file
  const runtimeConfigPath = path.join(__dirname, '../temp', 'wp' + randomUUID().split('-')[0] + '.' + runtimeConfigName);
  fs.writeFileSync(runtimeConfigPath, fileContent, 'utf-8');

  // Return the temporary config path and cleanup function
  return {
    configPath: runtimeConfigPath,
    cleanup: () => {
      fs.unlink(runtimeConfigPath, (code) => { });
    }
  };
}

function execute(command, commandOptions) {

  let tempConfigResponse = {
    cleanup: () => { }
  };

  // Split the command into arguments
  const $commandArgs = command.split(' ').filter(item => {
    if (item.trim() == '') return false;
    return item.trim();
  });

  // Extract the command
  const $command = $commandArgs.shift(); // Ex: npx

  const hasProjectWebpackConfig = fs.existsSync(projectWebpackConfigPath);

  // If the project has its own webpack.config.js file, use that
  if (hasProjectWebpackConfig) {
    $commandArgs.push('--config', commandOptions.wpConfig = projectWebpackConfigPath);
  } else {
    // Otherwise use the cli webpack.config.js file
    $commandArgs.push('--config', commandOptions.wpConfig = cliWebpackConfigPath);
  }

  if (commandOptions.mixConfig) {
    $commandArgs.pop(); // webpack.config.js
    $commandArgs.pop(); // --config

    tempConfigResponse = tempConfigHandler(commandOptions);
    $commandArgs.push('--config', tempConfigResponse.configPath);
  }

  // Execute the command
  const $execution = spawn($command, $commandArgs, { stdio: 'inherit', shell: true });

  // Handle the exit signals
  ['close', 'exit'].forEach((signal) => {
    process.once(signal, () => {
      tempConfigResponse.cleanup();
      process.exit(0);
    });
  });

  return $execution;
}

export {
  execute
};
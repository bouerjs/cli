const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const cliWebpackConfigPath = path.join(__dirname, '..', 'webpack.config.js');
const projectWebpackConfigPath = path.join(process.cwd(), 'webpack.config.js');


function tempConfigHandler(options) {
  const mixConfig = options.mixConfig;

  // If no mixConfig is provided, return the default webpack config
  if (!options.mixConfig)
    return {
      configPath: projectWebpackConfigPath,
      // Cleanup function
      cleanup: () => { }
    };

  const mixConfigPath = path.join(process.cwd(), mixConfig);

  if (!fs.existsSync(mixConfigPath))
    throw new Error(`Error: The provided --mix-config ${mixConfig} file was not found.`);

  // Set the content of the temporary webpack config file
  const fileContent =
    `
const { merge } = require('webpack-merge');

// loading the cli webpack config
const cliConfig = require('${cliWebpackConfigPath.replace(/\\/g, '\\\\')}');

// loading the project webpack config
const targetConfig = require('${mixConfigPath.replace(/\\/g, '\\\\')}');

module.exports = (env, argv) => {
  const cliConfigData = typeof cliConfig === 'function' ? cliConfig(env, argv) : cliConfig; 
  const targetConfigData = typeof targetConfig === 'function' ? targetConfig(env, argv) : targetConfig; 

  return merge(cliConfigData, targetConfigData);
};`;

  const runtimeConfigName = 'runtime.webpack.config.js';
  console.log(`Generating temporary ${runtimeConfigName.yellow} file...`);

  // writing the merged config to a temporary file
  const runtimeConfigPath = path.join(process.cwd(), runtimeConfigName);
  fs.writeFileSync(runtimeConfigPath, fileContent, 'utf-8');

  // Return the temporary config path and cleanup function
  return {
    configPath: runtimeConfigPath,
    cleanup: () => {
      console.log(`Cleaning up ${runtimeConfigName.yellow} file...`);
      fs.unlink(runtimeConfigPath, (err) => {
        if (err) {
          console.error('Error:'.red + ' Could not delete the temporary webpack config file.', runtimeConfigPath);
          throw err;
        }
      });
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

  // 1. If the project does not have a webpack.config.js file, use the cli webpack.config.js file
  if (!fs.existsSync(projectWebpackConfigPath)) {
    // Add the ars arguments
    $commandArgs.push('--config', cliWebpackConfigPath);
  }
  // 2. If the project has a webpack.config.js file, use that
  else if (fs.existsSync(projectWebpackConfigPath) && !commandOptions.mixConfig) {
    // Add the ars arguments
    $commandArgs.push('--config', projectWebpackConfigPath);
  }
  // 3. If the mix-config option is provided, merge the project webpack.config.js file with the cli webpack.config.js file
  else if (fs.existsSync(projectWebpackConfigPath) && commandOptions.mixConfig) {
    // Use temporaty webpack config if mix-config is provided, otherwise use the `webpackConfigToUse` provided
    tempConfigResponse = tempConfigHandler(commandOptions);

    // Add the ars arguments
    $commandArgs.push('--config', tempConfigResponse.configPath);
  }
  // 4. If the mix-config option is not provided, use the project webpack.config.js file
  else {
    console.log('Using the cli ' + 'webpack.config.js'.yellow + ' file, if this is not what you wanted check running command...');
    $commandArgs.push('--config', cliWebpackConfigPath);
  }

  // Execute the command
  const $execution = spawn($command, $commandArgs, { stdio: 'inherit', shell: true });

  // Handle the exit signals
  ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGQUIT'].forEach((signal) => {
    process.on(signal, () => {
      $execution.kill(signal); // Send SIGINT to Webpack process
      tempConfigResponse.cleanup();
      process.exit(0);
    });
  });

  return $execution;
}

module.exports = {
  execute
};
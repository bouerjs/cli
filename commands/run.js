const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { execute } = require('../helpers/executor');


module.exports = function runCommand(program) {
  program
    .command('run')
    .description('Runs the development live server for the current Bouer.js project')
    .option('--mix-config <config-path>', 'The other webpack.config.js path that need to mixed to', '')
    .option('--port <port-number>', 'The port number the server should be running. Default: 8080', '8080')
    .action((options) => {
      try {
        // Check if we're in a Bouer.js project by looking for package.json
        const packagePath = path.join(process.cwd(), 'package.json');
        if (!fs.existsSync(packagePath)) {
          console.error('Error:'.red + ' No package.json found. Make sure you are in a Bouer.js project directory.');
          process.exit(1);
        }

        const port = options.port ? ('--port ' + options.port) : '';
        execute(`npx webpack serve --mode development ${ port }`, options);
      } catch (error) {
        if (error.status === 'ENOENT') {
          console.error('Error:'.red + ' The "webpack serve" command failed. Make sure webpack-dev-server is installed and configured properly.');
        } else {
          console.error('Error:'.red, error.message);
        }
        process.exit(1);
      }
    }
    );
}; 
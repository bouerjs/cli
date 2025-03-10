const path = require('path');
const fs = require('fs');
const { execute } = require('../helpers/executor');


module.exports = function buildCommand(program) {
    program
        .command('build')
        .description('Builds the Bouer.js project for development or production')
        .option('-m, --mode <mode>', 'Build mode (dev or prod)', 'dev')
        .option('--mix-config <config-path>', 'The other webpack.config.js path that need to mixed to', '')
        .action((options) => {
            try {

                // Check if we're in a Bouer.js project by looking for package.json
                const packagePath = path.join(process.cwd(), 'package.json');
                if (!fs.existsSync(packagePath)) {
                    console.error('Error: No package.json found. Make sure you are in a Bouer.js project directory.');
                    process.exit(1);
                }

                // Build the project using webpack
                const mode = ({
                    dev: 'development',
                    prod: 'production'
                })[options.mode.toLowerCase()] || 'development';

                console.log(`Starting Bouer build: ${mode}... ⌛`);

                // Execute the webpack build command
                const $execution = execute(`npx webpack --mode ${mode}`, options);

                $execution.once('close', (code) => {
                    if (code !== 0) {
                        console.error('Error building project ❌. Check the console output for more information.');
                        process.exit(1);
                    }
                    console.log('Build completed successfully! ✅');
                });

            } catch (error) {
                console.error('Error building project:', error.message);
                process.exit(1);
            }

        });
};
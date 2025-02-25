const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

module.exports = function buildCommand(program) {
    program
        .command('build')
        .description('Builds the Bouer.js project for development or production')
        .option('-m, --mode <mode>', 'Build mode (dev or prod)', 'dev')
        .action((options) => {

            try {
                const buildMode = options.mode.toLowerCase();

                // Check if we're in a Bouer.js project by looking for package.json
                const packagePath = path.join(process.cwd(), 'package.json');
                if (!fs.existsSync(packagePath)) {
                    console.error('Error: No package.json found. Make sure you are in a Bouer.js project directory.');
                    process.exit(1);
                }

                if (buildMode === 'dev') {
                    console.log('Building project for development...');
                    execSync('npm run build', { stdio: 'inherit' });
                } else if (buildMode === 'prod') {
                    console.log('Building project for production...');
                    execSync('npm run publish', { stdio: 'inherit' });
                }

                console.log('Build completed successfully!');
                
            } catch (error) {
                console.error('Error building project:', error.message);
                process.exit(1);
            }

        }
    );
};
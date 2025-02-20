const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

module.exports = function buildCommand(program) {
    const build = program
        .command('build')
        .description('Builds the Bouer.js project for development or production');

    // Subcommand for development build
    build
        .command('dev')
        .description('Build for development')
        .action(() => {
            try {
                // Check if we're in a Bouer.js project by looking for package.json
                const packagePath = path.join(process.cwd(), 'package.json');
                if (!fs.existsSync(packagePath)) {
                    console.error('Error: No package.json found. Make sure you are in a Bouer.js project directory.');
                    process.exit(1);
                }

                console.log('Building project for development...');
                execSync('npm build', { stdio: 'inherit' });
                console.log('Build completed successfully!');

            } catch (error) {
                console.error('Error building project:', error.message);
                process.exit(1);
            }
        });

    // Subcommand for production build  
    build
        .command('prod')
        .description('Build for production')
        .action(() => {
            try {
                // Check if we're in a Bouer.js project by looking for package.json
                const packagePath = path.join(process.cwd(), 'package.json');
                if (!fs.existsSync(packagePath)) {
                    console.error('Error: No package.json found. Make sure you are in a Bouer.js project directory.');
                    process.exit(1);
                }

                console.log('Building project for production...');
                execSync('npm publish', { stdio: 'inherit' });
                console.log('Build completed successfully!');

            } catch (error) {
                console.error('Error building project:', error.message);
                process.exit(1);
            }
        });
};
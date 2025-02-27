const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

module.exports = function installCommand(program) {
    program
        .command('install')
        .description('Installs dependencies for the current Bouer.js project')
        .action(() => {
        try {
            // Check if we're in a Bouer.js project by looking for package.json
            const packagePath = path.join(process.cwd(), 'package.json');
            if (!fs.existsSync(packagePath)) {
                console.error('Error: No package.json found. Make sure you are in a Bouer.js project directory.');
                process.exit(1);
            }
    
            console.log('Installing dependencies...');
            execSync('npm install', { stdio: 'inherit' });
            console.log('Dependencies installed successfully!');
            
        } catch (error) {
            console.error('Error installing dependencies:', error.message);
            process.exit(1);
        }}
    );
}; 
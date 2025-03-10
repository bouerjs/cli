const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

module.exports = function runCommand(program) {
    program
        .command('run')
        .description('Runs the development live server for the current Bouer.js project')
        .action(() => {
        try {
            // Check if we're in a Bouer.js project by looking for package.json
            const packagePath = path.join(process.cwd(), 'package.json');
            if (!fs.existsSync(packagePath)) {
                console.error('Error: No package.json found. Make sure you are in a Bouer.js project directory.');
                process.exit(1);
            }
    
            console.log('Starting development server...');
            execSync('npx webpack serve --mode development', { stdio: 'inherit' });
            
        } catch (error) {
            if (error.status === 'ENOENT') {
                console.error('Error: The "webpack serve" command failed. Make sure webpack-dev-server is installed and configured properly.');
            } else {
                console.error('Error:', error.message);
            }
            process.exit(1);
        }}
    );
}; 
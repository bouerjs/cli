import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

export default function installCommand(program) {
  program
    .command('install')
    .alias('i')
    .description('Installs dependencies for the current Bouer.js project')
    .action(() => {
      try {
        // Check if we're in a Bouer.js project by looking for package.json
        const packagePath = path.join(process.cwd(), 'package.json');
        if (!fs.existsSync(packagePath)) {
          console.error('Error:'.red + ' No package.json found. Make sure you are in a Bouer.js project directory.');
          process.exit(1);
        }

        console.log('Installing dependencies...');
        execSync('npm install', { stdio: 'inherit' });
        console.log('Dependencies installed successfully!'.green);

      } catch (error) {
        console.error('Error installing dependencies:'.red, error.message);
        process.exit(1);
      }
    }
  );
}; 
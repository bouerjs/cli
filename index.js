#!/usr/bin/env node

const { Command } = require('commander');
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const program = new Command();

const repoUrl = 'https://github.com/bouerjs/cli.git'

program.version('0.6.1','-v, --version');

program
  .command('create <project-name>')
  .description('Creates a new Bouer.js project')
  .action(async (projectName) => {
    const git = simpleGit();

    try {
      console.log('Creating new project...');
      
      // Check if directory already exists
      if (fs.existsSync(projectName)) {
        console.error(`Error: Directory ${projectName} already exists`);
        process.exit(1);
      }

      // Clone the repository
      await git.clone(repoUrl, projectName);
      
      // Remove the .git folder to start fresh
      fs.rmSync(path.join(projectName, '.git'), { recursive: true, force: true });

      // Install dependencies
      console.log('Installing dependencies...');
      execSync('npm install', { cwd: projectName, stdio: 'inherit' });

      console.log(`
Successfully created project ${projectName}!
Dependencies installed.

Get started with:
cd ${projectName}
bouer run
	`);

    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

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
      execSync('webpack serve', { stdio: 'inherit' });
      
    } catch (error) {
      if (error.status === 'ENOENT') {
        console.error('Error: The "webpack serve" command failed. Make sure webpack-dev-server is installed and configured properly.');
      } else {
        console.error('Error:', error.message);
      }
      process.exit(1);
    }
  });

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
    }
  });

// Default command when just 'bouer' is run
program
  .action(() => {
    program.outputHelp();
  });  

// This will show help after errors and suggest similar commands if the user makes a typo.
program.showHelpAfterError()
  .showSuggestionAfterError();

program.parse(process.argv);

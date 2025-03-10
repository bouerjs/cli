#!/usr/bin/env node

const { Command } = require('commander');
const registerCommands = require('./commands');

const program = new Command('bouer');

// Set version
program.version(require('./package.json').version, '-v, --version');

// Register all commands
registerCommands(program);

// Default command when just 'bouer' is run
program
  .action(() => {
    program.outputHelp();
  });

// Show help after errors and suggest similar commands
program.showHelpAfterError()
  .showSuggestionAfterError();

program.parse(process.argv);

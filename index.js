#!/usr/bin/env node
import { Command } from 'commander';
import registerCommands from './commands/index.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version } = require('./package.json');
const program = new Command('bouer');

// Set version
program.version(version, '-v, --version');

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

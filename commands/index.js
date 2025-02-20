const createCommand = require('./create');
const buildCommand = require('./build');
const runCommand = require('./run');
const installCommand = require('./install');

module.exports = function registerCommands(program) {
  createCommand(program);
  buildCommand(program);
  runCommand(program);
  installCommand(program);
};

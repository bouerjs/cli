import createCommand from './create.js';
import buildCommand from './build.js';
import runCommand from './run.js';
import installCommand from './install.js';

export default function registerCommands(program) {
  createCommand(program);
  buildCommand(program);
  runCommand(program);
  installCommand(program);
};

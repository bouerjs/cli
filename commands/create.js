import simpleGit from 'simple-git';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { execSync, } from 'child_process';
import { createRequire } from 'module';
import projectConfigLoader from '../helpers/project-config-loader.js';
import 'colors';

const cwd = process.cwd();
const require = createRequire(import.meta.url);
const defaultBouerConfig = require('../default.bouer.json');
const defaultBouerVersion = defaultBouerConfig.project.version;

const templSuffix = 'templates-bouer-cli-';
const repoUrl = 'https://github.com/bouerjs/templates.git';

function getPathFromName(input) {
  const parts = input.split('/');
  const name = parts.pop();
  const dir = parts.join('/');

  return {
    dir: dir,
    name: name
  };
}

function getTemplatePath() {
  return path.join(os.tmpdir(), templSuffix + new Date().toJSON().split('T')[0]);
}

async function createProject(projectName, options) {
  if (!projectName) {
    console.error('Error:'.red + ' Project name is required');
    process.exit(1);
  }

  const template = options.template.toLowerCase();

  // Validate template type
  if (!['blank', 'routing', 'ghpages'].includes(template)) {
    console.error('Invalid template. '.red + ' Please use either "blank" or "routing"');
    process.exit(1);
  }

  console.log(`Creating new ${template.yellow} project: ${projectName.green}`);

  // Check if directory already exists
  if (fs.existsSync(projectName)) {
    console.error(`Error:`.red + ` Directory ${projectName} already exists`);
    process.exit(1);
  }

  const templateDir = getTemplatePath();
  let templatesLoaded = false;


  try {
    if (!fs.existsSync(templateDir)) {
      templatesLoaded = true
      console.log('Loading the bouer templates...');
      // Clone the specific branch/directory
      await simpleGit().clone(
        repoUrl, templateDir, ['--depth', '1']  // Shallow clone for speed
      );
    }

    // Copy only the needed template directory
    const templatePath = path.join(templateDir, defaultBouerVersion, 'app', template);  // Adjust path as needed

    createFolder(projectName);
    copyItemSync(templatePath, projectName);

    // update the project name in the package.json file
    await updateProjectName(projectName);

    fs.writeFileSync(
      path.join(cwd, projectName, 'bouer.json'),
      JSON.stringify(defaultBouerConfig, null, 2),
      'utf8'
    );

    console.log('Installing dependencies...');
    execSync('npm install', { cwd: projectName, stdio: 'inherit' });

    console.log(`
  Successfully created project ${projectName.green}
  Dependencies installed.
  
  Get started with:
  cd ${projectName.green}
  ${'npm'.blue} start | ${'bouer'.blue} run
  Access your app at: http://127.0.0.1:8080
  `);

  } catch (error) {
    console.error('Error creating project:'.red, error.message);
  } finally {
    if (templatesLoaded) cleanUp();
  }
}

function copyItemSync(source, destination, cb) {
  if (fs.existsSync(source) && !fs.lstatSync(source).isDirectory()) {
    fs.copyFileSync(source, destination);
    return;
  } 

  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  fs.readdirSync(source).forEach(file => {
    const srcFile = path.join(source, file);
    const destFile = path.join(destination, file);

    if (fs.lstatSync(srcFile).isDirectory()) {
      copyItemSync(srcFile, destFile, cb);
    } else {
      fs.copyFileSync(srcFile, destFile);
      if (typeof cb === 'function') cb(srcFile, destFile)
    }
  });
}

function createFolder(path, options) {
  fs.mkdirSync(path.toLowerCase(), options);
}

function cleanUp() {
  try {
    Promise.resolve().then(() => {
      const today = new Date();
      const todaytemplate = templSuffix + today.toJSON().split('T')[0];
      fs.readdirSync(os.tmpdir()).forEach(file => {
        if (file.startsWith(templSuffix) && todaytemplate !== file) {
          removeFolder(path.join(os.tmpdir(), file));
        }
      })
    });
  } catch (error) {};
}

function removeFolder(path) {
  if (!fs.existsSync(path)) return;
  fs.rmSync(path, { recursive: true, force: true });
}

async function updateProjectName(projectName) {
  // update the project name in the package.json file
  const packageJsonPath = path.join(projectName, 'package.json');

  // Read and parse package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Update the name property
  packageJson.name = projectName;

  // Write back to file with proper formatting
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n'  // 2 spaces indentation + trailing newline
  );
}

// Component creation
async function createComponent(componentName, targetPath, type) {
  if (!componentName) {
    console.error('Error:'.red + 'Component name is required');
    process.exit(1);
  }

  const config = projectConfigLoader(cwd);
  const cliScaffoldConfig = config.cli.scaffold;

  const $path = getPathFromName(componentName);

  componentName = $path.name.trim(); // Removing any space
  // Making the first letter of the component name upper. Ex: home => Home 
  componentName = componentName[0].toUpperCase() + componentName.substring(1);

  targetPath = $path.dir || targetPath;

  const packagePath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packagePath)) {
    console.error('Error:'.red + ' No package.json found. Make sure you are in a Bouer.js project directory.');
    process.exit(1);
  }

  // Check if path exists, create if it doesn't
  if (targetPath) {
    // Removing any leading '.' if exists
    targetPath = targetPath[0] === '.' ? targetPath.substring(1) : targetPath;
    // joining the target path
    targetPath = path.join('src', targetPath, componentName.toLowerCase());
  } else {
    const dir = (cliScaffoldConfig.templates[type] || {}).path || '';
    targetPath = path.join('src', dir, componentName.toLowerCase());
  }

  // check if the target path exists, create if it doesn't
  if (fs.existsSync(targetPath))
    return console.log(`Component ${componentName.yellow} already exists in ${targetPath.yellow}`);

  console.log('');
  console.log(`Scaffolding ${componentName.green} in ${targetPath.yellow}...`);

  createFolder(targetPath, { recursive: true });

  // Create temporary directory
  const templateDir = getTemplatePath();
  let templatesLoaded = false;

  try {
    if (!fs.existsSync(templateDir)) {
      templatesLoaded = true;
      console.log('Loading the bouer templates...');
      // Clone the specific branch/directory
      await simpleGit().clone(
        repoUrl, templateDir, ['--depth', '1']  // Shallow clone for speed
      );
    }

    // Copy only the needed template directory
    const repoPath = path.join(templateDir, defaultBouerVersion, 'component', type || 'blank');  // Adjust path as needed
    copyItemSync(repoPath, targetPath);

    renameGeneratedComponent(cliScaffoldConfig, componentName, targetPath, type || 'blank');
  } catch (error) {
    console.error('Fail to create component'.red, error.message);
    removeFolder(targetPath);
  } finally {
    // Clean up temp directory
    if (templatesLoaded) cleanUp();
  }
}

function renameGeneratedComponent(cliScaffoldConfig, componentName, targetPath, type) {

  const files = fs.readdirSync(path.join(targetPath));
  const $type = cliScaffoldConfig.templates[type];
  const suffix = ($type.suffix || '').trim();

  files.forEach(filepath => {
    // get the file
    const file = filepath.split('\\').pop();

    // get the file extension type
    const type = file.split('.')[0];

    // loading the extension from config
    const ext = cliScaffoldConfig[type] || type;

    // building the name
    const composedName = [componentName, suffix, ext]
      .filter(x => x).map(x => x.trim().toLowerCase())
      .join('.');

    fs.renameSync(
      path.join(targetPath, filepath), 
      path.join(targetPath, composedName)
    );
    console.log(' + '.green + composedName.yellow + ' created');
  });

  // update the ts file content
  const tsFile = [componentName, suffix, cliScaffoldConfig.script]
      .filter(x => x).map(x => x.trim().toLowerCase()).join('.');
  const tsFilePath = path.join(targetPath, tsFile);
  const tsContent = fs.readFileSync(tsFilePath, 'utf8');

  const updatedContent = tsContent
    .replace(/{name}/g, componentName + suffix)
    .replace(/{lower-name}/g, componentName.toLowerCase())
    .replace(/{suffix}/g, suffix.length > 0 ? `.${suffix.toLowerCase()}` : '')
    .replace(/{view}/g, cliScaffoldConfig.view) // import extension
    .replace(/{style}/g, cliScaffoldConfig.style); // import extension

  fs.writeFileSync(tsFilePath, updatedContent);

  const colorizedName = (componentName + suffix).green;

  console.log(`Component ${colorizedName} created successfully in ${targetPath.yellow}`);
  console.log(
    `Make sure to add the ${colorizedName} in: Bouer { components: [${colorizedName}] } or in Component { children: [${colorizedName}] }`
  );
}

// Webpack config creation
function createWebpackConfig(options) {
  const cliWebpackConfigPath = path.join(cwd, '..', 'webpack.config.js');
  let content = fs.readFileSync(cliWebpackConfigPath, 'utf8');

  if ('preview' in options) {
    console.log("\n\n");
    return console.log(content);
  }

  try {
    console.log('Generating ' + 'webpack.config.js'.yellow + ' file...');
    fs.writeFileSync(path.join(process.cwd(), 'webpack.config.js'), content, 'utf8');
    console.log('webpack.config.js'.green + ' successfully generated...');
  } catch (error) {
    console.error('Error:'.red + 'Could not create webpack.config.js file.');
    console.error('Error:'.red, error.message);
    process.exit(1);
  }
}

// Project creation
export default function createCommand(program) {
  const create = program
    .command('create')
    .alias('c')
    .description('Create a new Bouer.js project, component, or service');

  // Subcommand for new project
  create
    .command('new <project-name>')
    .description('Create a new Bouer.js project')
    .option('-t, --template <type>', 'Template type (blank or routing)', 'blank')
    .action(async (projectName, options) => {

      try {
        createProject(projectName, options);
      } catch (error) {
        console.error('Error:'.red, error.message);
        process.exit(1);
      }
    });

  // Subcommand for component
  create
    .command('component <component-name>')
    .alias('cp')
    .description('Creates a new component')
    .option('-p, --path <path>', 'Path to create the component (path: components)', '')
    .action(async (componentName, options) => {
      try {
        await createComponent(componentName, options.path, 'blank');
      } catch (error) {
        console.error('Error:'.red, error.message);
        process.exit(1);
      }
    });

  // Subcommand for component
  create
    .command('page <page-name>')
    .alias('pg')
    .description('Creates a new component')
    .option('-p, --path <path>', 'Path to create the page component (path: pages)', '')
    .action(async (componentName, options) => {
      try {
        await createComponent(componentName, options.path, 'page');
      } catch (error) {
        console.error('Error:'.red, error.message);
        process.exit(1);
      }
    });

  // Subcommand for webpack config
  create
    .command('config')
    .alias('cfg')
    .option('--preview', 'Used to preview the configuration instead of create it')
    .description('Generates a new webpack.config.js for the project according to the cli config')
    .action(async (options) => {
      try {
        createWebpackConfig(options);
      } catch (error) {
        console.error('Error:'.red, error.message);
        process.exit(1);
      }
    });
};
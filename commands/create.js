const simpleGit = require('simple-git');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { execSync } = require('child_process');
require("colors");

const repoUrl = 'https://github.com/bouerjs/templates.git'

module.exports = function createCommand(program) {
  const create = program
    .command('create')
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
    .description('Creates a new component')
    .option('-p, --path <path>', 'Path to create the component (root: ./src)', './')
    .action(async (componentName, options) => {
      try {
        createComponent(componentName, options.path);
      } catch (error) {
        console.error('Error:'.red, error.message);
        process.exit(1);
      }
    });

  // Subcommand for webpack config
  create
    .command('config')
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

// Project creation

async function createProject(projectName, options) {
  const template = options.template.toLowerCase();

  // Validate template type
  if (!['blank', 'routing'].includes(template)) {
    console.error('Invalid template. '.red + ' Please use either "blank" or "routing"');
    process.exit(1);
  }

  console.log(`Creating new ${template.yellow} project: ${projectName.green}`);

  // Check if directory already exists
  if (fs.existsSync(projectName)) {
    console.error(`Error:`.red + ` Directory ${projectName} already exists`);
    process.exit(1);
  }

  const tempDir = path.join(os.tmpdir(), 'temp-' + Math.random().toString(36).slice(2, 11));

  // Clone the specific branch/directory
  await simpleGit().clone(
    repoUrl, tempDir, ['--depth', '1']  // Shallow clone for speed
  );

  // Copy only the needed template directory
  const templatePath = path.join(tempDir, 'app', template);  // Adjust path as needed

  createFolder(projectName);
  copyFolderSync(templatePath, projectName);

  // update the project name in the package.json file
  updateProjectName(projectName);

  try {
    // Clean up temp directory
    removeFolder(tempDir);
  } catch (error) {
    // In case of erro just leave it
  }

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

}

function copyFolderSync(source, destination, cb) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  fs.readdirSync(source).forEach(file => {
    const srcFile = path.join(source, file);
    const destFile = path.join(destination, file);

    if (fs.lstatSync(srcFile).isDirectory()) {
      copyFolderSync(srcFile, destFile, cb);
    } else {
      fs.copyFileSync(srcFile, destFile);
      if (typeof cb === 'function') cb(srcFile, destFile)
    }
  });
}

function createFolder(path, options) {
  fs.mkdirSync(path.toLowerCase(), options);
}

function removeFolder(path) {
  fs.rmdirSync(path, { recursive: true, force: true });
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
async function createComponent(componentName, targetPath) {

  componentName = componentName.trim(); // Removing any space
  // Making the first letter of the component name upper. Ex: home => Home 
  componentName = componentName[0].toUpperCase() + componentName.substring(1);

  const packagePath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packagePath)) {
    console.error('Error:'.red + ' No package.json found. Make sure you are in a Bouer.js project directory.');
    process.exit(1);
  }

  // Check if path exists, create if it doesn't
  if (targetPath !== './') {
    targetPath = path.join('src', targetPath, componentName.toLowerCase());
  } else {
    targetPath = path.join('src', componentName.toLowerCase());
  }

  // check if the target path exists, create if it doesn't
  if (!fs.existsSync(targetPath)) {
    console.log('');
    console.log(`Scaffolding ${componentName.green} in ${targetPath.yellow}...`);

    //fs.mkdirSync(targetPath, { recursive: true });
    createFolder(targetPath, { recursive: true });

    // Create temporary directory
    const tempDir = path.join(os.tmpdir(), 'temp-' + Math.random().toString(36).slice(2, 11));

    // Clone the specific branch/directory
    await simpleGit().clone(
      repoUrl, tempDir, ['--depth', '1']  // Shallow clone for speed
    );

    // Copy only the needed template directory
    const repoPath = path.join(tempDir, 'component', 'blank');  // Adjust path as needed
    //fs.cpSync(repoPath, targetPath, { recursive: true });
    copyFolderSync(repoPath, targetPath);

    // Clean up temp directory
    //fs.rmSync(tempDir, { recursive: true, force: true });
    removeFolder(tempDir);

    renameGeneratedComponent(componentName, targetPath);

    const colorizedName = (componentName + 'Component').green;

    console.log(`Component ${componentName.green} created successfully in ${targetPath.yellow}`);
    console.log(`Make sure to add the ${ colorizedName } to: { components: [${ colorizedName }] } or in { children: [${ colorizedName }] }`)
  } else {
    console.log(`Component ${componentName.yellow} already exists in ${targetPath.yellow}`);
  }

}

function renameGeneratedComponent(componentName, targetPath) {

  const fileExtensions = ['scss', 'css', 'html', 'ts'];
  const componentNameLower = componentName.toLowerCase();

  fileExtensions.forEach(ext => {
    if (fs.existsSync(path.join(targetPath, `${ext}.tmp`))) {
      fs.renameSync(
        path.join(targetPath, `${ext}.tmp`),
        path.join(targetPath, `${componentNameLower}.${ext}`)
      );
      console.log(' + '.green + `${componentNameLower}.${ext}`.yellow + ' created');
    }
  });

  // update the ts file
  const tsFile = path.join(targetPath, componentName + '.ts');
  const tsContent = fs.readFileSync(tsFile, 'utf8');

  const updatedContent = tsContent
    .replace(/{name}/g, componentName)
    .replace(/{lower-name}/g, componentName.toLowerCase());


  fs.writeFileSync(tsFile, updatedContent);
}

// Webpack config creation
function createWebpackConfig(options) {
  const cliWebpackConfigPath = path.join(__dirname, '..', 'webpack.config.js');
  let content = fs.readFileSync(cliWebpackConfigPath, 'utf8');

  const splitted = content.split('\n');
  const line = splitted.findIndex(x => x.includes('const projectPath'));
  splitted[line] = splitted[line].split('=')[0] + `= __dirname;`;

  content = splitted.join('\n');

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
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

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
        console.error('Error:', error.message);
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
        console.error('Error:', error.message);
        process.exit(1);
      }
    });

};

async function createProject(projectName, options) {
  const git = simpleGit();

  const template = options.template.toLowerCase();

  // Validate template type
  if (!['blank', 'routing'].includes(template)) {
    console.error('Invalid template. Please use either "blank" or "routing"');
    process.exit(1);
  }

  console.log(`Creating new ${template} project: ${projectName}`);

  // Check if directory already exists
  if (fs.existsSync(projectName)) {
    console.error(`Error: Directory ${projectName} already exists`);
    process.exit(1);
  }

  // Create temporary directory
  const tempDir = 'temp-' + Math.random().toString(36).slice(2, 11);

  // Clone the specific branch/directory
  await simpleGit().clone(
    repoUrl, tempDir, ['--depth', '1']  // Shallow clone for speed
  );

  // Copy only the needed template directory
  const templatePath = path.join(tempDir, '/app/' + template);  // Adjust path as needed
  //fs.mkdirSync(projectName);
  //fs.cpSync(templatePath, projectName, { recursive: true });
  createFolder(projectName);
  copyFolderSync(templatePath, projectName);

  // update the project name in the package.json file
  updateProjectName(projectName);

  // Clean up temp directory
  //fs.rmSync(tempDir, { recursive: true, force: true });
  removeFolder(tempDir);

  console.log('Installing dependencies...');
  execSync('npm install', { cwd: projectName, stdio: 'inherit' });

  console.log(`
Successfully created project ${projectName}
Dependencies installed.

Get started with:
cd ${projectName}
bouer run
Access your app at: http://127.0.0.1:8080
    `);

}

function copyFolderSync(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  fs.readdirSync(source).forEach(file => {
    const srcFile = path.join(source, file);
    const destFile = path.join(destination, file);

    if (fs.lstatSync(srcFile).isDirectory()) {
      copyFolderSync(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
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

async function createComponent(componentName, targetPath) {

  const packagePath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packagePath)) {
    console.error('Error: No package.json found. Make sure you are in a Bouer.js project directory.');
    process.exit(1);
  }

  // Check if path exists, create if it doesn't
  if (targetPath !== './') {
    targetPath = 'src/' + targetPath + '/' + componentName;
  } else {
    targetPath = 'src/' + componentName;
  }

  // check if the target path exists, create if it doesn't
  if (!fs.existsSync(targetPath)) {
    //fs.mkdirSync(targetPath, { recursive: true });
    createFolder(targetPath, { recursive: true });

    // Create temporary directory
    const tempDir = 'temp-' + Math.random().toString(36).slice(2, 11);

    // Clone the specific branch/directory
    await simpleGit().clone(
      repoUrl, tempDir, ['--depth', '1']  // Shallow clone for speed
    );

    // Copy only the needed template directory
    const repoPath = path.join(tempDir, 'component/blank');  // Adjust path as needed
    //fs.cpSync(repoPath, targetPath, { recursive: true });
    copyFolderSync(repoPath, targetPath);

    // Clean up temp directory
    //fs.rmSync(tempDir, { recursive: true, force: true });
    removeFolder(tempDir);

    renameGeneratedComponent(componentName, targetPath);

    console.log(`Component ${componentName} created successfully in ${targetPath}`);

  } else {
    console.log(`Component ${componentName} already exists in ${targetPath}`);
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
    }
  });

  // update the ts file
  const tsFile = targetPath + '/' + componentName + '.ts';
  const tsContent = fs.readFileSync(tsFile, 'utf8');

  const updatedContent = tsContent
    .replace(/{name}/g, componentName)
    .replace(/{lower-name}/g, componentName.toLowerCase());


  fs.writeFileSync(tsFile, updatedContent);
}

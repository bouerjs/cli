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
            const git = simpleGit();

            try {

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
                const tempDir = 'temp-' + Math.random().toString(36).substr(2, 9);

                // Clone the specific branch/directory
                await simpleGit().clone(
                    repoUrl,tempDir,['--depth', '1']  // Shallow clone for speed
                );

                // Copy only the needed template directory
                const templatePath = path.join(tempDir, '/app/'+template);  // Adjust path as needed
                fs.mkdirSync(projectName);
                fs.cpSync(templatePath, projectName, { recursive: true });

                // Clean up temp directory
                fs.rmSync(tempDir, { recursive: true, force: true });

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

            } catch (error) {
                console.error('Error:', error.message);
                process.exit(1);
            }

            
        });
    
    // Subcommand for component
    create
        .command('component <component-name>')
        .description('Creates a new component')
        .action((componentName) => {
            console.log(`Creating new component: ${componentName}`);
            // Component creation logic
        });

    // Subcommand for service
    create
        .command('service <service-name>')
        .description('Creates a new service')
        .action((serviceName) => {
            console.log(`Creating new service: ${serviceName}`);
            // Service creation logic
        });
}; 
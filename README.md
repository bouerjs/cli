# Bouer CLI

Command Line Interface (CLI) for Bouer.js

## Table of Contents
- [Installation](#installation)
- [Features](#features)
- [Available Commands](#available-commands)
- [Create a New Project](#create-a-new-project)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Installation

Install the CLI globally using npm:

```bash
npm install -g bouer-cli
```

## Features

- Create new Bouer.js projects
- Automatic dependency installation
- Git repository initialization
- Project scaffolding from templates

### Available Commands

- `bouer -v, --version` - Display CLI version
- `bouer -h, --help` - Display help information
- `bouer install` - Installs dependencies for the current Bouer.js project
- `bouer create <project-name>` - Create a new Bouer.js project
- `bouer run` - Runs the development live server for the current Bouer.js project

### Create a New Project

Create a new Bouer.js project:

```bash
bouer create <project-name>
```
Example:

```bash
bouer create my-project
```

## Development

To contribute to this CLI:

1. Clone the repository:
```bash
git clone https://github.com/bouerjs/cli.git
cd cli
```

2. Install dependencies:
```bash
npm install
```

3. Link the package locally:
```bash
npm link
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

# Bouer CLI

Command Line Interface (CLI) for [Bouer.js](https://bouerjs.github.io) - A JavaScript Library for building user interfaces.

## Table of Contents
- [Installation](#installation)
- [Available Commands](#available-commands)
  - [Create New Project](#create-new-project)
  - [Run Development Server](#run-development-server)
  - [Install Dependencies](#install-dependencies)
  - [Build Project](#build-project)
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

## Available Commands

### Basic Commands
- `bouer -v, --version` - Display CLI version
- `bouer -h, --help` - Display help information
- `bouer install` - Installs dependencies for the current Bouer.js project
- `bouer create new <project-name> [-t, --template <type>]` - Create a new Bouer.js project with optional template type (blank or routing)
- `bouer run` - Runs the development live server for the current Bouer.js project
- `bouer build [-m, --mode <mode>]` - Builds the Bouer.js project for development or production (dev or prod)

### Create New Project

Create a new Bouer.js project with a starter template:

```bash
bouer create new <project-name> [-t, --template <type>]
```

Options:
- `--template <name>` - Specify template to use (default: "blank")

Example:
```bash
bouer create new my-awesome-app
```

### Run Development Server

Start the development server with hot-reload:

```bash
bouer run
```

### Install Dependencies

Install or update project dependencies:

```bash
bouer install
```

### Build Project

Build your project for production:

```bash
bouer build [options]
```

Options:
- `--mode <mode>` - Build mode (dev/prod)

## Development

To contribute to the CLI:

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



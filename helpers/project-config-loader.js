import os from 'os';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';


const require = createRequire(import.meta.url);

export default function load(projectPath) {
	const configPath = path.resolve(projectPath, 'bouer.json');

	if (!fs.existsSync(configPath)) {
		const defaultBouerConfig = require('../default.bouer.json');

		fs.writeFileSync(configPath, JSON.stringify(defaultBouerConfig, null, 2), 'utf8');
		return defaultBouerConfig;
	}

	const configuration = require(configPath);
	return configuration;
}
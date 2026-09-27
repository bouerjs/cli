import os from 'os';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import 'colors';

const require = createRequire(import.meta.url);

export default function loadBouerConfig(projectPath) {
	// Configuration path
	const configPath = path.resolve(projectPath, 'bouer.json');

	// Check if the configuration file does not exists
	if (!fs.existsSync(configPath)) {
		// Loading the default configuration
		const defaultBouerConfig = require('../default.bouer.json');

		// Creating the configuration file in the project
		fs.writeFileSync(configPath, JSON.stringify(defaultBouerConfig, null, 2), 'utf8');
		return defaultBouerConfig;
	}

	// Loading the configuration
	const configuration = require(configPath);

	// Validating the configuration
	return validateConfigStructure(configuration);
}

function validateConfigStructure(config) {
	// Loading the schema
	const baseStructure = require('../schemas/bouer.schema.json');
	
	const errors = [];
	const breadcrumb = [];

	function toPath(breadcrumb) {
		const output = [];

		for (let i = 0; i < breadcrumb.length; i++) {
			const item = breadcrumb[i];
			const next = breadcrumb[i + 1] || '';
			output.push(item);

			// Colorize the last item
			if (i === breadcrumb.length - 1) {
				output[ output.length - 1 ] = output[ output.length - 1 ].red;
				break;
			}

			// Skip dot addition
			if (next[0] == '[') continue;

			// Add a dot
			output.push('.');
		}

		// Return the path joined
		return output.join('');
	}

	(function walker(breadcrumb, structure, layer) {
		let $structure = structure;

		// resolve $ref if it exists
		if (structure.$ref != null) {
			$structure = baseStructure.$defs[structure.$ref.split('/').pop()];
		}

		// get the type
		const type = $structure.type instanceof Array ? $structure.type.join(',') : $structure.type;
		const typeOfLayer = layer instanceof Array ? 'array' : typeof layer;

		// If the layer is an object
		if (type === 'object') {
			// Check each required property
			for (const prop in $structure.properties) {
				breadcrumb.push(prop);
	
				// If the property is missing, error
				if (!(prop in layer) && ($structure.required || []).includes(prop)) {
					errors.push(toPath(breadcrumb) + `: Field is required`);
				}
				
				// Process internal properties
				walker(breadcrumb, $structure.properties[prop], layer[prop]);
				breadcrumb.pop();
			}
		}

		// If the layer is an array
		if (typeOfLayer === 'array') {
			layer.forEach((item, index) => {
				breadcrumb.push(`[${index}]`);
				// Process internal properties
				walker(breadcrumb, $structure.items, item);
				breadcrumb.pop();
			});
		}

		// Check the layer type
		if (!type.split(',').includes(typeOfLayer) && typeOfLayer !== 'undefined') {
			errors.push(toPath(breadcrumb) + `: Expected ${type.green}, received ${typeOfLayer.red}`);
			return;
		}
	})(breadcrumb, baseStructure, config);

	if (errors.length === 0) return config;

	console.error('[bouer-cli]',`Invalid ${'bouer.json'.red} configuration.`);
	if (errors.length) {
		console.error('The project configuration object does not match the API schema:');
		errors.forEach((prop) => console.error(' - '.yellow + prop));
	}

	console.error(
		`\nPlease update your configuration file or run "${'bouer'.blue} cfg init" to reset it.`
	);
	process.exit(1);
}
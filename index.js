// #!/usr/bin/env node

const fs = require('node:fs');
const folderPath = 'test/ts/src';
const filesAndSubfolders = fs.readdirSync(folderPath);

(function run() {
	
	console.log(filesAndSubfolders);

})();
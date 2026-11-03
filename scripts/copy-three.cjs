const fs = require('node:fs');
const path = require('node:path');

const source = path.dirname(require.resolve('three/package.json'));
fs.mkdirSync('assets/vendor', { recursive: true });
fs.copyFileSync(path.join(source, 'build/three.min.js'), 'assets/vendor/three.min.js');
fs.copyFileSync(path.join(source, 'LICENSE'), 'assets/vendor/three.LICENSE');

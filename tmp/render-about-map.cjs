const fs = require('node:fs');
const { Resvg } = require('./about-tools/node_modules/@resvg/resvg-js');
const svg = fs.readFileSync('app/assets/images/pages/about/global-footprint.svg', 'utf8');
const renderer = new Resvg(svg, { background: '#f8fafc', fitTo: { mode: 'width', value: 1200 } });
fs.writeFileSync('tmp/global-footprint-preview.png', renderer.render().asPng());

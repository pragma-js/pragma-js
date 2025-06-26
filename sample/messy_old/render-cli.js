const fs = require('fs');
const path = require('path');
const { renderDSL } = require('./render');

const filePath = process.argv[2] || path.join(__dirname, 'dsl', 'example.rds');

try {
    const dslText = fs.readFileSync(filePath, 'utf-8');
    const html = renderDSL(dslText);
    console.log(html);
} catch (err) {
    console.error('Error reading or rendering DSL file:', err);
    process.exit(1);
}
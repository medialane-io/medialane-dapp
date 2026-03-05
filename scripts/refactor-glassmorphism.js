const fs = require('fs');
const path = require('path');

const targetDirs = [
    path.join(__dirname, '..', 'src', 'app'),
    path.join(__dirname, '..', 'src', 'components')
];

const fileExtensions = ['.tsx', '.ts'];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    content = content.replace(/bg-white\/(\d+)/g, 'bg-foreground/$1');
    content = content.replace(/border-white\/(\d+)/g, 'border-foreground/$1');
    content = content.replace(/shadow-white\/(\d+)/g, 'shadow-foreground/$1');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath.replace(path.join(__dirname, '..'), '')}`);
    }
}

function traverseDirectory(directory) {
    if (!fs.existsSync(directory)) return;
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            traverseDirectory(fullPath);
        } else if (fileExtensions.includes(path.extname(fullPath))) {
            processFile(fullPath);
        }
    }
}

console.log("Starting glassmorphism theme refactoring...");
targetDirs.forEach(dir => traverseDirectory(dir));
console.log("Refactoring complete.");

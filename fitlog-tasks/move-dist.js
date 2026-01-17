const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'dist', 'fitlog-tasks', 'browser');
const targetDir = path.join(__dirname, 'dist', 'fitlog-tasks');

if (fs.existsSync(sourceDir)) {
    const files = fs.readdirSync(sourceDir);
    files.forEach(file => {
        const sourcePath = path.join(sourceDir, file);
        const targetPath = path.join(targetDir, file);
        fs.renameSync(sourcePath, targetPath);
    });
    fs.rmdirSync(sourceDir);
    console.log('✅ Moved files from browser/ to root dist directory');
} else {
    console.log('⚠️ No browser directory found, skipping move');
}

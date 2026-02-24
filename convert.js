const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const SRC_DIR = path.join(__dirname, 'client', 'src');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const babelConfig = {
    presets: [
        ['@babel/preset-typescript', { isTSX: true, allExtensions: true }]
    ],
    plugins: [
        ['@babel/plugin-syntax-jsx']
    ],
    retainLines: true
};

console.log('Starting conversion...');

walkDir(SRC_DIR, (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        if (filePath.includes('vite-env.d.ts') || filePath.includes('types\\index.ts')) {
            console.log(`Deleting declaration/types file: ${filePath}`);
            fs.unlinkSync(filePath);
            return;
        }

        try {
            const code = fs.readFileSync(filePath, 'utf8');

            const result = babel.transformSync(code, {
                filename: filePath,
                ...babelConfig
            });

            if (result && result.code) {
                let newExt = filePath.endsWith('.tsx') ? '.jsx' : '.js';
                let newPath = filePath.replace(/\.tsx?$/, newExt);

                fs.writeFileSync(newPath, result.code);
                fs.unlinkSync(filePath);
                console.log(`Converted: ${path.basename(filePath)} -> ${path.basename(newPath)}`);
            }
        } catch (err) {
            console.error(`Error converting ${filePath}:`, err);
        }
    }
});

console.log('Done!');

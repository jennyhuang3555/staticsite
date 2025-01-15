require('dotenv').config({ path: '.env.production' });
const fs = require('fs-extra');
const path = require('path');

async function build() {
    console.log('Starting build process...');
    
    try {
        // Clear dist directory
        await fs.emptyDir('dist');
        console.log('Cleared dist directory');

        // Copy all files from src to dist
        await fs.copy('src', 'dist');
        console.log('Copied src to dist');
        
        // Verify the copy worked
        const srcIndex = await fs.readFile('src/index.html', 'utf-8');
        const distIndex = await fs.readFile('dist/index.html', 'utf-8');
        console.log('Source index.html content:', srcIndex.substring(0, 100));
        console.log('Dist index.html content:', distIndex.substring(0, 100));

        // Ensure templates directory exists
        await fs.ensureDir('dist/templates');
        console.log('Ensured templates directory exists');

        // Ensure blog directory exists
        await fs.ensureDir('dist/blog');
        console.log('Ensured blog directory exists');

        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build(); 
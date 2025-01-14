const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');
const frontMatter = require('front-matter');

async function buildSite() {
    try {
        // Clean and create build directory
        await fs.emptyDir('build');
        
        // Copy static assets
        await fs.copy('css', 'build/css');
        if (fs.existsSync('public')) {
            await fs.copy('public', 'build/public');
        }
        
        // Copy index.html to build directory
        if (fs.existsSync('index.html')) {
            await fs.copy('index.html', 'build/index.html');
        }
        
        console.log('Site built successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

buildSite(); 
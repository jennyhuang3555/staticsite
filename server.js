require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { marked } = require('marked');
const frontMatter = require('front-matter');

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV === 'development';

// Serve static files from both src and dist
app.use(express.static(isDev ? 'src' : 'dist'));

// Add blog routes BEFORE static file serving
app.get('/blog', async (req, res) => {
    try {
        console.log('Blog route hit');
        const posts = await getBlogPosts();
        const templatePath = path.join(__dirname, 'src', 'templates', 'blog-list.html');
        console.log('Template path:', templatePath);
        const template = await fs.readFile(templatePath, 'utf-8');
        
        const postsHtml = posts.map(post => `
            <article class="blog-card">
                <a href="/blog/${post.slug}">
                    <img src="${post.image}" alt="${post.title}" class="blog-card-image">
                    <div class="blog-card-content">
                        <div class="blog-card-meta">
                            <span class="blog-card-category">${post.category || 'General'}</span>
                            <time datetime="${post.date}">${post.formattedDate}</time>
                        </div>
                        <h2 class="blog-card-title">${post.title}</h2>
                        <p class="blog-card-excerpt">${post.description || ''}</p>
                        <div class="blog-card-footer">
                            <div class="blog-card-author">
                                <img src="${post.authorImage || '/images/default-avatar.jpg'}" alt="${post.author || 'Author'}" class="author-avatar">
                                <span class="author-name">${post.author || 'Enneagram for Love'}</span>
                            </div>
                            <span class="read-more">Read article →</span>
                        </div>
                    </div>
                </a>
            </article>
        `).join('');

        console.log('Generated HTML:', postsHtml);
        
        const html = template.replace('{{posts}}', 
            posts.length > 0 ? postsHtml : '<p class="no-posts">No blog posts found.</p>'
        );
        
        res.send(html);
    } catch (error) {
        console.error('Error in blog route:', error);
        res.status(500).send('Error loading blog posts');
    }
});

app.get('/blog/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const filePath = path.join(__dirname, 'src', 'blog', `${slug}.md`);
        const content = await fs.readFile(filePath, 'utf-8');
        const { attributes, body } = frontMatter(content);
        
        const template = await fs.readFile(path.join(__dirname, 'src', 'templates', 'blog-post.html'), 'utf-8');
        
        const html = template
            .replace(/\{\{title\}\}/g, attributes.title)
            .replace(/\{\{date\}\}/g, attributes.date)
            .replace(/\{\{formattedDate\}\}/g, new Date(attributes.date).toLocaleDateString())
            .replace(/\{\{content\}\}/g, marked(body));
        
        res.send(html);
    } catch (error) {
        console.error('Error:', error);
        res.status(404).send('Blog post not found');
    }
});

// Add this function to read and parse blog posts
async function getBlogPosts() {
    const blogDir = path.join(__dirname, 'src', 'blog');
    const files = await fs.readdir(blogDir);
    
    const posts = await Promise.all(
        files.map(async (file) => {
            const content = await fs.readFile(path.join(blogDir, file), 'utf-8');
            const { attributes, body } = frontMatter(content);
            return {
                slug: file.replace('.md', ''),
                title: attributes.title,
                date: attributes.date,
                description: attributes.description,
                image: attributes.image,
                category: attributes.category,
                content: marked(body)
            };
        })
    );
    
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Fallback route for static HTML pages
app.get('/:page.html', (req, res) => {
    res.sendFile(path.join(__dirname, req.params.page + '.html'));
});

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode at http://localhost:${PORT}`);
}); 
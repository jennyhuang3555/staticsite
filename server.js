const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { marked } = require('marked');
const frontMatter = require('front-matter');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));

// Blog route
app.get('/blog/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const markdownContent = await fs.readFile(path.join(__dirname, 'content', 'blog', `${slug}.md`), 'utf-8');
        const { attributes, body } = frontMatter(markdownContent);
        const htmlContent = marked(body);

        const template = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${attributes.title} - Enneagram for Love</title>
                <link rel="stylesheet" href="/css/style.css">
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            </head>
            <body>
                <header>
                    <nav>
                        <ul>
                            <li><a href="/">Home</a></li>
                            <li><a href="/blog">Blog</a></li>
                            <li><a href="/about.html">About</a></li>
                            <li><a href="/faq.html">FAQ</a></li>
                        </ul>
                    </nav>
                </header>
                <main>
                    <article class="blog-post">
                        <div class="container">
                            <h1>${attributes.title}</h1>
                            <div class="metadata">
                                <time datetime="${attributes.date}">${new Date(attributes.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                            </div>
                            ${htmlContent}
                        </div>
                    </article>
                </main>
                <footer>
                    <div class="container">
                        <p>&copy; 2024 Enneagram for Love. All rights reserved.</p>
                    </div>
                </footer>
            </body>
            </html>
        `;

        res.send(template);
    } catch (error) {
        res.status(404).send('Blog post not found');
    }
});

// Blog index route
app.get('/blog', async (req, res) => {
    try {
        const blogDir = path.join(__dirname, 'content', 'blog');
        const files = await fs.readdir(blogDir);
        const posts = await Promise.all(
            files.map(async (file) => {
                const content = await fs.readFile(path.join(blogDir, file), 'utf-8');
                const { attributes } = frontMatter(content);
                return {
                    slug: file.replace('.md', ''),
                    ...attributes
                };
            })
        );

        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        const template = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Blog - Enneagram for Love</title>
                <link rel="stylesheet" href="/css/style.css">
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            </head>
            <body>
                <header>
                    <nav>
                        <ul>
                            <li><a href="/">Home</a></li>
                            <li><a href="/blog">Blog</a></li>
                            <li><a href="/about.html">About</a></li>
                            <li><a href="/faq.html">FAQ</a></li>
                        </ul>
                    </nav>
                </header>
                <main>
                    <section class="hero">
                        <h1>Enneagram Insights</h1>
                        <p>Explore our collection of articles about relationships through the lens of the Enneagram.</p>
                    </section>
                    
                    <div class="container">
                        <div class="blog-list">
                            ${posts.map(post => `
                                <article>
                                    <h2><a href="/blog/${post.slug}">${post.title}</a></h2>
                                    <time datetime="${post.date}">${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                                    <p>${post.description || ''}</p>
                                    <a href="/blog/${post.slug}" class="btn">Read More</a>
                                </article>
                            `).join('')}
                        </div>
                    </div>
                </main>
                <footer>
                    <div class="container">
                        <p>&copy; 2024 Enneagram for Love. All rights reserved.</p>
                    </div>
                </footer>
            </body>
            </html>
        `;

        res.send(template);
    } catch (error) {
        res.status(500).send('Error loading blog posts');
    }
});

// Fallback route for static HTML pages
app.get('/:page.html', (req, res) => {
    res.sendFile(path.join(__dirname, req.params.page + '.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}); 
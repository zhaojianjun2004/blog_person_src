const express = require('express');
const path = require('path');
const ArticleManager = require('./utils/ArticleManager');

const app = express();
const PORT = process.env.PORT || 3001;
const articleManager = new ArticleManager();

// 设置静态文件目录
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/data', express.static(path.join(__dirname, 'data')));

// 解析JSON请求体
app.use(express.json());

// 单篇文章页面路由
app.get('/articles/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, 'article-detail.html'));
});

// API路由 - 获取所有文章
app.get('/api/articles', (req, res) => {
    try {
        const { category, search, tags, page = 1, limit = 10 } = req.query;
        let articles = articleManager.getAllArticles();
        
        // 分类筛选
        if (category && category !== 'all') {
            articles = articles.filter(article => article.category === category);
        }
        
        // 标签筛选
        if (tags) {
            articles = articles.filter(article => 
                article.tags && article.tags.some(tag => 
                    tag.toLowerCase().includes(tags.toLowerCase())
                )
            );
        }
        
        // 关键词搜索筛选
        if (search && !tags) {
            articles = articleManager.searchArticles(search);
        }
        
        // 分页
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedArticles = articles.slice(startIndex, endIndex);
        
        res.json({
            articles: paginatedArticles,
            total: articles.length,
            page: parseInt(page),
            totalPages: Math.ceil(articles.length / limit)
        });
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: 'Failed to fetch articles' });
    }
});

// API路由 - 获取单篇文章
app.get('/api/articles/:slug', (req, res) => {
    try {
        const article = articleManager.getArticleBySlug(req.params.slug);
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json(article);
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ error: 'Failed to fetch article' });
    }
});

// API路由 - 按分类获取文章
app.get('/api/articles/category/:category', (req, res) => {
    try {
        const { category } = req.params;
        let articles = articleManager.getAllArticles();
        
        // 按分类筛选
        articles = articles.filter(article => article.category === category);
        
        // 按日期排序（最新的在前）
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        res.json(articles);
    } catch (error) {
        console.error('Error fetching articles by category:', error);
        res.status(500).json({ error: 'Failed to fetch articles by category' });
    }
});

// API路由 - 获取分类统计
app.get('/api/categories', (req, res) => {
    try {
        const categoryStats = articleManager.getCategoryStats();
        res.json(categoryStats);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// API路由 - 获取标签统计
app.get('/api/tags', (req, res) => {
    try {
        const tagStats = articleManager.getTagStats();
        const popularTags = articleManager.getPopularTags(15);
        
        res.json({
            tags: tagStats,
            popularTags: popularTags,
            totalTags: Object.keys(tagStats).length
        });
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

// API路由 - 获取博客统计
app.get('/api/stats', (req, res) => {
    try {
        const stats = articleManager.getBlogStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// About页面路由
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

// Articles页面路由
app.get('/articles', (req, res) => {
    res.sendFile(path.join(__dirname, 'articles.html'));
});

// Categories页面路由
app.get('/categories', (req, res) => {
    res.sendFile(path.join(__dirname, 'categories.html'));
});

// Link页面路由
app.get('/link', (req, res) => {
    res.sendFile(path.join(__dirname, 'link.html'));
});

// 404页面
app.get('*', (req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>404 - Page Not Found</title>
            <style>
                body { 
                    font-family: 'Inter', sans-serif; 
                    background: #050505; 
                    color: #ffffff; 
                    text-align: center; 
                    padding: 100px 20px; 
                }
                h1 { color: #00ffff; font-size: 4rem; margin-bottom: 1rem; }
                p { font-size: 1.2rem; margin-bottom: 2rem; }
                a { color: #00ffff; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <h1>404</h1>
            <p>Page not found</p>
            <a href="/">← Back to Home</a>
        </body>
        </html>
    `);
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 Tech Blog server running at http://localhost:${PORT}`);
    console.log(`📝 Blog created by CaiCaiXiong`);
    console.log(`📄 Available pages:`);
    console.log(`   - Home: http://localhost:${PORT}/`);
    console.log(`   - About: http://localhost:${PORT}/about`);
    console.log(`   - Articles: http://localhost:${PORT}/articles`);
    console.log(`   - Categories: http://localhost:${PORT}/categories`);
    console.log(`   - Contact: http://localhost:${PORT}/contact`);
    console.log(`🔌 API Endpoints:`);
    console.log(`   - GET /api/articles - Get all articles`);
    console.log(`   - GET /api/articles/:slug - Get article by slug`);
    console.log(`   - GET /api/categories - Get category stats`);
    console.log(`   - GET /api/tags - Get tag stats`);
    console.log(`   - GET /api/stats - Get blog stats`);
});
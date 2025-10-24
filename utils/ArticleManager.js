const fs = require('fs');
const path = require('path');
const frontMatter = require('front-matter');
const MarkdownIt = require('markdown-it');

class ArticleManager {
    constructor() {
        this.postsDir = path.join(__dirname, '../posts');
        this.dataDir = path.join(__dirname, '../data');
        this.md = new MarkdownIt({
            html: true,
            linkify: true,
            typographer: true
        });
        
        // 确保 data 目录存在
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }
    
    getAllArticles() {
        try {
            const files = fs.readdirSync(this.postsDir)
                .filter(file => file.endsWith('.md'))
                .sort();
            
            const articles = files.map(file => {
                const filePath = path.join(this.postsDir, file);
                const content = fs.readFileSync(filePath, 'utf8');
                const parsed = frontMatter(content);
                const stats = fs.statSync(filePath);
                
                // 自动处理时间信息，优先使用 front-matter 中的 updated
                // 文件修改时间
                const fileMTime = stats.mtime.toISOString().split('T')[0];
                // 创建时间：优先 front-matter date，否则使用文件修改时间
                const createdTime = parsed.attributes.date || fileMTime;
                const userUpdated = parsed.attributes.updated;
                // 如果 front-matter 指定了 updated，则使用用户提供的值；否则使用文件修改时间（与创建时间不同时）
                const finalUpdated = userUpdated
                    ? userUpdated
                    : (new Date(fileMTime) > new Date(createdTime) ? fileMTime : null);

                return {
                    slug: file.replace('.md', ''),
                    ...parsed.attributes,
                    date: createdTime, // 创建时间
                    updated: finalUpdated, // 更新时间
                    content: parsed.body,
                    htmlContent: this.md.render(parsed.body),
                    wordCount: this.calculateWordCount(parsed.body),
                    readTime: this.calculateReadTime(parsed.body)
                };
            });
            
            // 按日期排序，最新的在前面
            return articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('Error loading articles:', error);
            return [];
        }
    }
    
    calculateWordCount(content) {
        // 移除 markdown 语法和代码块
        const textContent = content
            .replace(/```[\s\S]*?```/g, '') // 代码块
            .replace(/`[^`]*`/g, '') // 行内代码
            .replace(/[#*_\-\[\]()]/g, '') // markdown 语法
            .replace(/\n/g, ' '); // 换行替换为空格
        
        // 计算中文字符数
        const chineseChars = (textContent.match(/[\u4e00-\u9fa5]/g) || []).length;
        // 计算英文单词数
        const englishWords = (textContent.match(/[a-zA-Z]+/g) || []).length;
        
        return chineseChars + englishWords;
    }
    
    calculateReadTime(content) {
        const wordCount = this.calculateWordCount(content);
        const wordsPerMinute = 200; // 中文阅读速度
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return `${minutes} 分钟`;
    }
    
    getArticleBySlug(slug) {
        try {
            const filePath = path.join(this.postsDir, `${slug}.md`);
            if (!fs.existsSync(filePath)) {
                return null;
            }
            
            const content = fs.readFileSync(filePath, 'utf8');
            const parsed = frontMatter(content);
            const stats = fs.statSync(filePath);
            
            // 自动处理时间信息，优先使用 front-matter 中的 updated
            // 文件修改时间
            const fileMTime = stats.mtime.toISOString().split('T')[0];
            // 创建时间：优先 front-matter date，否则使用文件修改时间
            const createdTime = parsed.attributes.date || fileMTime;
            const userUpdated = parsed.attributes.updated;
            const finalUpdated = userUpdated
                ? userUpdated
                : (new Date(fileMTime) > new Date(createdTime) ? fileMTime : null);

            return {
                slug,
                ...parsed.attributes,
                date: createdTime,
                updated: finalUpdated,
                content: parsed.body,
                htmlContent: this.md.render(parsed.body),
                wordCount: this.calculateWordCount(parsed.body),
                readTime: this.calculateReadTime(parsed.body)
            };
        } catch (error) {
            console.error('Error loading article:', error);
            return null;
        }
    }
    
    getArticlesByCategory(category) {
        return this.getAllArticles().filter(article => article.category === category);
    }
    
    searchArticles(query) {
        const allArticles = this.getAllArticles();
        const searchTerm = query.toLowerCase();
        
        return allArticles.filter(article => {
            // 只搜索标题和标签，不搜索内容和摘要
            const titleMatch = article.title.toLowerCase().includes(searchTerm);
            const tagsMatch = article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            
            return titleMatch || tagsMatch;
        });
    }
    
    getCategoryStats() {
        const articles = this.getAllArticles();
        const stats = {};
        
        // 动态生成分类统计
        articles.forEach(article => {
            if (article.category) {
                if (!stats[article.category]) {
                    stats[article.category] = {
                        name: article.category,
                        count: 0,
                        articles: [],
                        description: `Articles about ${article.category}`,
                        icon: this.getCategoryIcon(article.category)
                    };
                }
                stats[article.category].count++;
                stats[article.category].articles.push(article);
            }
        });
        
        return stats;
    }
    
    getCategoryIcon(category) {
        const iconMap = {
            'java': '☕',
            'database': '🗄️',
            'spring': '🌱',
            'devops': '🚀',
            'tools': '🛠️',
            'architecture': '🏗️',
            'security': '🔒',
            'performance': '⚡',
            'testing': '🧪',
            'javascript': '📜',
            'frontend': '🎨',
            'backend': '⚙️',
            'api': '🔌',
            'microservices': '🔗',
            'daily': '📝',
            'thinking': '💡',
            'interview': '🦜',
            'programming': '💻',
            'interests': '🌸',
            'algorithms': '📐',
            'deeplearning': '🤖',
            
        };
        return iconMap[category.toLowerCase()] || '📂';
    }
    
    getTagStats() {
        const articles = this.getAllArticles();
        const tagStats = {};
        
        articles.forEach(article => {
            if (article.tags) {
                article.tags.forEach(tag => {
                    if (!tagStats[tag]) {
                        tagStats[tag] = 0;
                    }
                    tagStats[tag]++;
                });
            }
        });
        
        return tagStats;
    }
    
    getBlogStats() {
        const articles = this.getAllArticles();
        const categoryStats = this.getCategoryStats();
        const tagStats = this.getTagStats();
        
        // 获取最新文章的日期作为最后更新时间
        const lastUpdated = articles.length > 0 
            ? articles.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date
            : new Date().toISOString();
        
        return {
            totalArticles: articles.length,
            totalCategories: Object.keys(categoryStats).length,
            totalTags: Object.keys(tagStats).length,
            lastUpdated: lastUpdated
        };
    }
    
    getPopularTags(limit = 15) {
        const tagStats = this.getTagStats();
        return Object.entries(tagStats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([tag, count]) => ({ tag, count }));
    }
}

module.exports = ArticleManager;
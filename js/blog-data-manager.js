// 博客数据管理器 - 负责从后端API获取和缓存文章、分类数据
class BlogDataManager {
    constructor() {
        this.cache = {
            articles: null,
            categories: null,
            stats: null,
            lastUpdate: null
        };
        this.cacheExpiry = 5 * 60 * 1000; // 5分钟缓存
        this.baseUrl = window.location.origin; // 使用当前域名
    }

    // 检查缓存是否有效
    isCacheValid() {
        return this.cache.lastUpdate && 
               (Date.now() - this.cache.lastUpdate) < this.cacheExpiry;
    }

    // 获取所有文章数据
    async getArticles() {
        if (this.isCacheValid() && this.cache.articles) {
            return this.cache.articles;
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/articles`);
            if (response.ok) {
                const data = await response.json();
                this.cache.articles = data.articles || data;
                this.cache.lastUpdate = Date.now();
                return this.cache.articles;
            }
        } catch (error) {
            console.warn('无法从API获取文章数据，使用fallback数据:', error);
        }

        // 如果API调用失败，返回基础数据结构
        return this.getFallbackArticles();
    }

    // 获取所有分类
    async getCategories() {
        if (this.isCacheValid() && this.cache.categories) {
            return this.cache.categories;
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/categories`);
            if (response.ok) {
                const data = await response.json();
                // 如果返回的是对象格式的统计数据，转换为数组
                if (data && typeof data === 'object' && !Array.isArray(data)) {
                    this.cache.categories = Object.values(data);
                } else {
                    this.cache.categories = data.categories || data || [];
                }
                return this.cache.categories;
            }
        } catch (error) {
            console.warn('无法从API获取分类数据，从文章数据生成:', error);
        }

        // 从文章数据生成分类
        try {
            const articles = await this.getArticles();
            const categoryMap = new Map();

            articles.forEach(article => {
                const category = article.category || 'uncategorized';
                if (!categoryMap.has(category)) {
                    categoryMap.set(category, {
                        name: category,
                        count: 0,
                        articles: []
                    });
                }
                
                const catData = categoryMap.get(category);
                catData.count++;
                catData.articles.push(article);
            });

            this.cache.categories = Array.from(categoryMap.values());
            return this.cache.categories;
        } catch (error) {
            console.error('生成分类数据失败:', error);
            return [];
        }
    }

    // 获取博客统计信息
    async getStats() {
        if (this.isCacheValid() && this.cache.stats) {
            return this.cache.stats;
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/stats`);
            if (response.ok) {
                const data = await response.json();
                this.cache.stats = data;
                return data;
            }
        } catch (error) {
            console.warn('无法获取统计数据，从本地计算:', error);
        }

        // 从现有数据计算统计信息
        try {
            const [articles, categories] = await Promise.all([
                this.getArticles(),
                this.getCategories()
            ]);
            
            const allTags = [...new Set(articles.flatMap(a => a.tags || []))];
            const stats = {
                totalArticles: articles.length,
                totalCategories: categories.length,
                totalTags: allTags.length,
                lastUpdated: new Date().toISOString()
            };
            
            this.cache.stats = stats;
            return stats;
        } catch (error) {
            console.error('计算统计数据失败:', error);
            return { totalArticles: 0, totalCategories: 0, totalTags: 0 };
        }
    }

    // 根据slug查找文章
    async findArticleBySlug(slug) {
        try {
            const response = await fetch(`${this.baseUrl}/api/article/${slug}`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn('API调用失败，从缓存查找:', error);
        }

        // 从缓存中查找
        const articles = await this.getArticles();
        return articles.find(article => article.slug === slug);
    }

    // 根据分类查找文章
    async findArticlesByCategory(category) {
        try {
            const response = await fetch(`${this.baseUrl}/api/articles?category=${encodeURIComponent(category)}`);
            if (response.ok) {
                const data = await response.json();
                return data.articles || data;
            }
        } catch (error) {
            console.warn('API调用失败，从缓存过滤:', error);
        }

        // 从缓存中过滤
        const articles = await this.getArticles();
        return articles.filter(article => 
            article.category && article.category.toLowerCase() === category.toLowerCase()
        );
    }

    // 搜索文章（标题和标签）
    async searchArticles(query) {
        try {
            const response = await fetch(`${this.baseUrl}/api/articles?search=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                return data.articles || data;
            }
        } catch (error) {
            console.warn('API搜索失败，使用本地搜索:', error);
        }

        // 本地搜索
        const articles = await this.getArticles();
        const lowQuery = query.toLowerCase();
        
        return articles.filter(article => 
            (article.title && article.title.toLowerCase().includes(lowQuery)) ||
            (article.tags && article.tags.some(tag => tag.toLowerCase().includes(lowQuery))) ||
            (article.content && article.content.toLowerCase().includes(lowQuery))
        );
    }

    // Fallback文章数据（当API不可用时）
    getFallbackArticles() {
        return [
            {
                title: "深入理解MVCC：多版本并发控制的实现原理",
                slug: "MVCC",
                category: "database",
                tags: ["Mysql", "面试题", "MVCC"],
                date: "2024-12-01"
            },
            {
                title: "mysql事务是什么？如何与Spring集成的？",
                slug: "mysql_Transaction_lock",
                category: "database", 
                tags: ["mysql", "面试题"],
                date: "2024-11-28"
            },
            {
                title: "深入理解Java ThreadLocal机制",
                slug: "TheadLocal",
                category: "java",
                tags: ["Java", "并发编程", "ThreadLocal"],
                date: "2024-11-25"
            },
            {
                title: "我的一些思考",
                slug: "My_thinking",
                category: "personal",
                tags: ["思考", "随笔"],
                date: "2024-11-20"
            },
            {
                title: "无法访问此网站的解决方案",
                slug: "unable_access",
                category: "tech",
                tags: ["网络", "故障排除"],
                date: "2024-11-15"
            },
            {
                title: "手写Java代码的艺术",
                slug: "handwrite_javaCode",
                category: "java",
                tags: ["Java", "编程技巧"],
                date: "2024-11-10"
            },
            {
                title: "GitHub学生开发者包申请指南",
                slug: "github_student",
                category: "guide",
                tags: ["GitHub", "学生", "开发工具"],
                date: "2024-11-05"
            }
        ];
    }

    // 清除缓存
    clearCache() {
        this.cache = {
            articles: null,
            categories: null,
            stats: null,
            lastUpdate: null
        };
    }
}

// 创建全局数据管理器实例
const blogDataManager = new BlogDataManager();
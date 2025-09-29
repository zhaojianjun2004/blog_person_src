// 增强的文章筛选和搜索功能
class EnhancedArticlesFilter {
    constructor() {
        this.searchInput = document.querySelector('.search-input');
        this.filterTags = document.querySelectorAll('.filter-tag');
        this.articleCards = document.querySelectorAll('.article-card');
        this.activeCategory = 'all';
        this.activeSearchTerm = '';
        this.activeTag = null;
        
        this.init();
    }
    
    init() {
        // 检查URL参数
        this.parseUrlParams();
        
        if (this.searchInput) {
            // 搜索功能
            this.searchInput.addEventListener('input', (e) => {
                this.activeSearchTerm = e.target.value;
                this.filterArticles();
            });
            
            // 搜索框回车事件
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(this.searchInput.value);
                }
            });
        }
        
        // 分类筛选
        this.filterTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.setActiveCategory(category);
                this.filterArticles();
            });
        });
        
        // 初始化标签点击事件（用于从其他页面跳转过来的标签过滤）
        this.initializeTagFiltering();
        
        // 页面加载完成后更新初始统计
        setTimeout(() => {
            this.updateInitialStats();
        }, 500);
        
        console.log('🔍 增强文章筛选功能初始化完成');
    }
    
    // 更新初始统计信息
    updateInitialStats() {
        const visibleCount = this.countVisibleArticles();
        if (visibleCount > 0) {
            this.updateResultsInfo(visibleCount);
        }
    }
    
    parseUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // 处理搜索参数
        const searchParam = urlParams.get('search');
        if (searchParam && this.searchInput) {
            this.activeSearchTerm = searchParam;
            this.searchInput.value = searchParam;
        }
        
        // 处理分类参数
        const categoryParam = urlParams.get('category');
        if (categoryParam) {
            this.activeCategory = categoryParam;
            this.setActiveCategory(categoryParam);
        }
        
        // 处理标签参数
        const tagParam = urlParams.get('tag');
        if (tagParam) {
            this.activeTag = tagParam;
            this.activeSearchTerm = tagParam; // 将标签作为搜索词
            if (this.searchInput) {
                this.searchInput.value = tagParam;
            }
        }
        
        // 应用筛选
        if (searchParam || categoryParam || tagParam) {
            setTimeout(() => {
                this.filterArticles();
            }, 100);
        }
    }
    
    setActiveCategory(category) {
        this.activeCategory = category;
        
        // 更新活跃标签样式
        this.filterTags.forEach(tag => {
            tag.classList.remove('active');
            if (tag.dataset.category === category) {
                tag.classList.add('active');
            }
        });
        
        // 更新URL
        this.updateUrl();
    }
    
    performSearch(searchTerm) {
        this.activeSearchTerm = searchTerm;
        this.filterArticles();
        this.updateUrl();
    }
    
    filterArticles() {
        let visibleCount = 0;
        
        // 重新获取文章卡片，确保获取到最新的DOM状态
        this.articleCards = document.querySelectorAll('.article-card');
        
        this.articleCards.forEach(card => {
            const shouldShow = this.shouldShowArticle(card);
            
            if (shouldShow) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.3s ease forwards';
                visibleCount++;
                // 高亮搜索关键词
                this.highlightSearchTerms(card);
            } else {
                card.style.display = 'none';
            }
        });
        
        // 使用延迟确保DOM更新完成后再统计
        setTimeout(() => {
            const actualVisibleCount = this.countVisibleArticles();
            this.updateResultsInfo(actualVisibleCount);
        }, 50);
    }
    
    // 新增方法：实际计算可见文章数量
    countVisibleArticles() {
        const visibleCards = document.querySelectorAll('.article-card:not([style*="display: none"])');
        return visibleCards.length;
    }
    
    shouldShowArticle(card) {
        // 获取文章信息
        const titleElement = card.querySelector('.article-title a');
        const excerptElement = card.querySelector('.article-excerpt');
        const tagsElement = card.querySelector('.article-tags');
        
        const title = titleElement ? titleElement.textContent.toLowerCase() : '';
        const excerpt = excerptElement ? excerptElement.textContent.toLowerCase() : '';
        const cardCategory = card.dataset.category;
        
        // 获取文章标签
        let articleTags = [];
        if (tagsElement) {
            const tagElements = tagsElement.querySelectorAll('.tag-item, .article-tag');
            articleTags = Array.from(tagElements).map(tag => tag.textContent.toLowerCase());
        }
        
        // 检查搜索条件
        const searchTerm = this.activeSearchTerm.toLowerCase();
        const matchesSearch = !searchTerm || 
            title.includes(searchTerm) || 
            excerpt.includes(searchTerm) ||
            articleTags.some(tag => tag.includes(searchTerm));
        
        // 检查分类条件
        const matchesCategory = this.activeCategory === 'all' || cardCategory === this.activeCategory;
        
        return matchesSearch && matchesCategory;
    }
    
    highlightSearchTerms(card) {
        if (!this.activeSearchTerm) return;
        
        const titleElement = card.querySelector('.article-title a');
        const excerptElement = card.querySelector('.article-excerpt');
        
        if (titleElement) {
            this.highlightText(titleElement, this.activeSearchTerm);
        }
        
        if (excerptElement) {
            this.highlightText(excerptElement, this.activeSearchTerm);
        }
    }
    
    highlightText(element, searchTerm) {
        const originalText = element.getAttribute('data-original-text') || element.textContent;
        
        if (!element.hasAttribute('data-original-text')) {
            element.setAttribute('data-original-text', originalText);
        }
        
        if (!searchTerm) {
            element.innerHTML = originalText;
            return;
        }
        
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')})`, 'gi');
        const highlightedText = originalText.replace(regex, '<mark class="search-highlight">$1</mark>');
        element.innerHTML = highlightedText;
    }
    
    initializeTagFiltering() {
        // 监听页面上所有标签元素的点击
        document.addEventListener('click', (e) => {
            // 检查是否点击了标签
            if (e.target.classList.contains('tag-item') || 
                e.target.classList.contains('article-tag') ||
                e.target.classList.contains('tag-cloud-item')) {
                
                const tagText = e.target.textContent.trim();
                
                // 防止默认行为
                e.preventDefault();
                e.stopPropagation();
                
                // 执行标签搜索
                this.searchByTag(tagText);
            }
        });
    }
    
    searchByTag(tagText) {
        this.activeTag = tagText;
        this.activeSearchTerm = tagText;
        
        if (this.searchInput) {
            this.searchInput.value = tagText;
        }
        
        this.filterArticles();
        this.updateUrl();
        
        // 滚动到搜索结果区域
        const articlesSection = document.querySelector('.articles-grid') || document.querySelector('.content');
        if (articlesSection) {
            articlesSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    updateUrl() {
        const urlParams = new URLSearchParams();
        
        if (this.activeSearchTerm) {
            urlParams.set('search', this.activeSearchTerm);
        }
        
        if (this.activeCategory && this.activeCategory !== 'all') {
            urlParams.set('category', this.activeCategory);
        }
        
        if (this.activeTag) {
            urlParams.set('tag', this.activeTag);
        }
        
        const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
        history.replaceState(null, '', newUrl);
    }
    
    updateResultsInfo(count) {
        // 如果count未定义或为负数，重新计算
        if (count === undefined || count < 0) {
            count = this.countVisibleArticles();
        }
        
        // 查找或创建结果信息显示元素
        let resultsInfo = document.querySelector('.search-results-info');
        
        if (!resultsInfo) {
            resultsInfo = document.createElement('div');
            resultsInfo.className = 'search-results-info';
            resultsInfo.style.cssText = `
                margin: 1rem 0;
                padding: 0.75rem 1rem;
                background: rgba(0, 255, 255, 0.05);
                border: 1px solid rgba(0, 255, 255, 0.2);
                border-radius: 6px;
                font-size: 0.9rem;
                color: var(--text-secondary);
                text-align: center;
            `;
            
            // 尝试插入到更合适的位置
            const articlesFilter = document.querySelector('.articles-filter');
            const articlesGrid = document.querySelector('.articles-grid');
            
            if (articlesFilter && articlesGrid) {
                articlesGrid.parentNode.insertBefore(resultsInfo, articlesGrid);
            } else if (articlesGrid) {
                articlesGrid.parentNode.insertBefore(resultsInfo, articlesGrid);
            }
        }
        
        if (resultsInfo) {
            let message = `找到 ${count} 篇文章`;
            
            if (this.activeSearchTerm) {
                message += ` (搜索: \"${this.activeSearchTerm}\")`;
            }
            
            if (this.activeCategory && this.activeCategory !== 'all') {
                const categoryName = this.getCategoryDisplayName(this.activeCategory);
                message += ` (分类: ${categoryName})`;
            }
            
            if (this.activeTag) {
                message += ` (标签: ${this.activeTag})`;
            }
            
            resultsInfo.textContent = message;
            
            // 显示逻辑：当有筛选条件或搜索内容时显示
            const shouldShow = count === 0 || 
                              this.activeSearchTerm || 
                              (this.activeCategory && this.activeCategory !== 'all') ||
                              this.activeTag;
            
            resultsInfo.style.display = shouldShow ? 'block' : 'none';
        }
        
        console.log(`📊 文章统计更新: 显示 ${count} 篇文章`);
    }
    
    // 获取分类显示名称
    getCategoryDisplayName(category) {
        const categoryMap = {
            'java': 'Java',
            'spring': 'Spring',
            'database': '数据库',
            'devops': 'DevOps',
            'tools': '工具',
            'daily': '日常'
        };
        return categoryMap[category] || category;
    }
    
    clearSearch() {
        this.activeSearchTerm = '';
        this.activeTag = null;
        this.activeCategory = 'all';
        
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        
        this.setActiveCategory('all');
        this.filterArticles();
        this.updateUrl();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 替换原有的 ArticlesFilter
    if (window.ArticlesFilter) {
        window.ArticlesFilter = EnhancedArticlesFilter;
    }
    new EnhancedArticlesFilter();
});
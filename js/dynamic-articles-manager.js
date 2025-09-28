// 动态文章管理器 - 处理URL参数和实时过滤
class DynamicArticleManager {
    constructor() {
        this.articles = [];
        this.filteredArticles = [];
        this.currentPage = 1;
        this.articlesPerPage = 9; // 修改为9个一页
        
        this.init();
    }
    
    async init() {
        // 解析URL参数
        this.parseUrlParams();
        
        // 加载文章数据
        await this.loadArticles();
        
        // 应用过滤器
        this.applyFilters();
        
        // 渲染文章
        this.renderArticles();
        
        // 绑定事件
        this.bindEvents();
        
        console.log('📄 动态文章管理器初始化完成');
    }
    
    parseUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        this.filters = {
            category: urlParams.get('category') || 'all',
            search: urlParams.get('search') || '',
            tags: urlParams.get('tags') || ''
        };
        
        // 重置到第一页如果有新的过滤条件
        this.currentPage = parseInt(urlParams.get('page')) || 1;
        
        console.log('🔍 解析URL参数:', this.filters);
    }
    
    async loadArticles() {
        try {
            const response = await fetch('/api/articles?limit=100'); // 加载所有文章
            const data = await response.json();
            this.articles = data.articles.map(article => ({
                ...article,
                // 生成摘要：取正文前150个字符
                excerpt: this.generateExcerpt(article.content || article.htmlContent),
                // 修复category为undefined的问题
                category: article.category || 'uncategorized'
            }));
            console.log('✅ 文章加载成功:', this.articles.length + ' 篇');
        } catch (error) {
            console.error('❌ 加载文章失败:', error);
            this.articles = [];
        }
    }
    
    generateExcerpt(content, maxLength = 150) {
        if (!content) return '暂无描述';
        
        // 移除HTML标签和Markdown语法
        const plainText = content
            .replace(/<[^>]*>/g, '') // 移除HTML标签
            .replace(/#{1,6}\s+/g, '') // 移除Markdown标题
            .replace(/\*\*([^*]+)\*\*/g, '$1') // 移除粗体标记
            .replace(/\*([^*]+)\*/g, '$1') // 移除斜体标记
            .replace(/`([^`]+)`/g, '$1') // 移除代码标记
            .replace(/\n+/g, ' ') // 将换行替换为空格
            .trim();
        
        return plainText.length > maxLength 
            ? plainText.substring(0, maxLength) + '...' 
            : plainText;
    }
    
    applyFilters() {
        this.filteredArticles = this.articles.filter(article => {
            // 分类过滤
            const categoryMatch = this.filters.category === 'all' || 
                                article.category === this.filters.category;
            
            // 搜索过滤
            const searchTerm = this.filters.search.toLowerCase();
            const searchMatch = !searchTerm || 
                               article.title.toLowerCase().includes(searchTerm) ||
                               article.excerpt.toLowerCase().includes(searchTerm) ||
                               article.content.toLowerCase().includes(searchTerm) ||
                               (article.tags && article.tags.some(tag => 
                                   tag.toLowerCase().includes(searchTerm)));
            
            // 标签过滤
            const tagsFilter = this.filters.tags.toLowerCase();
            const tagsMatch = !tagsFilter ||
                             (article.tags && article.tags.some(tag => 
                                 tag.toLowerCase().includes(tagsFilter)));
            
            return categoryMatch && searchMatch && tagsMatch;
        });
        
        // 重置到第一页
        this.currentPage = 1;
        
        console.log(`🎯 过滤后显示 ${this.filteredArticles.length} 篇文章`);
    }
    
    renderArticles() {
        const articlesContainer = document.querySelector('.articles-grid');
        if (!articlesContainer) return;
        
        // 清空容器
        articlesContainer.innerHTML = '';
        
        if (this.filteredArticles.length === 0) {
            articlesContainer.innerHTML = `
                <div class="no-articles">
                    <h3>没有找到相关文章</h3>
                    <p>请尝试调整搜索条件</p>
                </div>
            `;
            this.renderPagination(0, 0);
            return;
        }
        
        // 分页计算
        const totalPages = Math.ceil(this.filteredArticles.length / this.articlesPerPage);
        const startIndex = (this.currentPage - 1) * this.articlesPerPage;
        const endIndex = startIndex + this.articlesPerPage;
        const currentPageArticles = this.filteredArticles.slice(startIndex, endIndex);
        
        // 渲染当前页的文章
        currentPageArticles.forEach((article, index) => {
            const articleCard = this.createArticleCard(article);
            articleCard.style.animationDelay = `${index * 0.1}s`;
            articlesContainer.appendChild(articleCard);
        });
        
        // 更新搜索框和过滤器状态
        this.updateFilterUI();
        
        // 更新结果统计和分页
        this.updateResultsInfo();
        this.renderPagination(this.filteredArticles.length, totalPages);
    }
    
    createArticleCard(article) {
        const card = document.createElement('article');
        card.className = 'article-card fade-in-up';
        card.dataset.category = article.category;
        
        // 获取分类显示名称
        const categoryDisplayName = this.getCategoryDisplayName(article.category);
        
        card.innerHTML = `
            <div class="article-meta">
                <time class="article-date">${this.formatDate(article.date)}</time>
                <span class="article-category">${categoryDisplayName}</span>
            </div>
            <h2 class="article-title">
                <a href="/articles/${article.slug}">${article.title}</a>
            </h2>
            <p class="article-excerpt">${article.excerpt}</p>
            <div class="article-tags">
                ${article.tags && article.tags.length > 0 ? article.tags.map(tag => 
                    `<span class="article-tag" onclick="searchByTag('${tag}')">#${tag}</span>`
                ).join('') : ''}
            </div>
        `;
        
        return card;
    }
    
    getCategoryDisplayName(category) {
        const categoryMap = {
            'java': 'Java',
            'spring': 'Spring',
            'database': 'Database',
            'uncategorized': '未分类'
        };
        return categoryMap[category] || category;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    updateFilterUI() {
        // 更新搜索框
        const searchInput = document.querySelector('.search-input');
        if (searchInput && searchInput !== document.activeElement) {
            searchInput.value = this.filters.search;
        }
        
        // 更新分类过滤器
        const filterTags = document.querySelectorAll('.filter-tag');
        filterTags.forEach(tag => {
            tag.classList.remove('active');
            if (tag.dataset.category === this.filters.category) {
                tag.classList.add('active');
            }
        });
    }
    
    updateResultsInfo() {
        const resultsInfo = document.querySelector('.results-info');
        if (resultsInfo) {
            const startIndex = (this.currentPage - 1) * this.articlesPerPage + 1;
            const endIndex = Math.min(this.currentPage * this.articlesPerPage, this.filteredArticles.length);
            resultsInfo.innerHTML = `
                <div class="results-display">
                    <span class="results-count">第 ${startIndex}-${endIndex} 篇</span>
                    <span class="results-divider">·</span>
                    <span class="results-total">共 ${this.filteredArticles.length} 篇文章</span>
                </div>
            `;
        }
    }
    
    renderPagination(totalItems, totalPages) {
        const paginationContainer = document.querySelector('.pagination') || this.createPaginationContainer();
        
        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }
        
        paginationContainer.style.display = 'flex';
        paginationContainer.innerHTML = '';
        
        // 上一页按钮
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.textContent = '← 上一页';
        prevBtn.disabled = this.currentPage === 1;
        prevBtn.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        paginationContainer.appendChild(prevBtn);
        
        // 页码信息
        const pageInfo = document.createElement('span');
        pageInfo.className = 'pagination-info';
        pageInfo.textContent = `第 ${this.currentPage} 页，共 ${totalPages} 页`;
        paginationContainer.appendChild(pageInfo);
        
        // 下一页按钮
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.textContent = '下一页 →';
        nextBtn.disabled = this.currentPage === totalPages;
        nextBtn.addEventListener('click', () => this.goToPage(this.currentPage + 1));
        paginationContainer.appendChild(nextBtn);
    }
    
    createPaginationContainer() {
        const container = document.createElement('div');
        container.className = 'pagination';
        const articlesContainer = document.querySelector('.articles-grid');
        articlesContainer.parentNode.appendChild(container);
        return container;
    }
    
    goToPage(page) {
        this.currentPage = page;
        this.renderArticles();
        this.updateURL();
        
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    bindEvents() {
        // 搜索框事件 - 使用防抖
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filters.search = e.target.value;
                    this.applyFilters();
                    this.renderArticles();
                    this.updateURL();
                }, 300); // 300ms防抖
            });
        }
        
        // 分类过滤器事件
        const filterTags = document.querySelectorAll('.filter-tag');
        filterTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                // 清除搜索条件，避免冲突
                this.filters.search = '';
                this.filters.tags = '';
                this.filters.category = e.target.dataset.category;
                
                // 重置搜索框
                const searchInput = document.querySelector('.search-input');
                if (searchInput) {
                    searchInput.value = '';
                }
                
                this.applyFilters();
                this.renderArticles();
                this.updateURL();
            });
        });
    }
    
    updateURL() {
        const params = new URLSearchParams();
        
        if (this.filters.category !== 'all') {
            params.set('category', this.filters.category);
        }
        if (this.filters.search) {
            params.set('search', this.filters.search);
        }
        if (this.filters.tags) {
            params.set('tags', this.filters.tags);
        }
        if (this.currentPage > 1) {
            params.set('page', this.currentPage);
        }
        
        const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        window.history.replaceState({}, '', newURL);
    }
}

// 全局函数：通过标签搜索
function searchByTag(tag) {
    const manager = window.articleManager;
    if (manager) {
        manager.filters.search = tag;
        manager.filters.category = 'all';
        manager.filters.tags = '';
        manager.applyFilters();
        manager.renderArticles();
        manager.updateURL();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    window.articleManager = new DynamicArticleManager();
});
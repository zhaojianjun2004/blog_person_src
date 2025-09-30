// 动态文章管理器 - 处理URL参数和实时过滤（性能优化版）
class DynamicArticleManager {
    constructor() {
        this.articles = [];
        this.filteredArticles = [];
        this.currentPage = 1;
        this.articlesPerPage = 9;
        this.renderingPaused = false;
        this.lastRenderTime = 0;
        this.renderThrottle = 100; // 渲染节流时间（毫秒）
        
        this.init();
    }
    
    async init() {
        // 解析URL参数
        this.parseUrlParams();
        
        // 加载文章数据（带缓存）
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
            // 检查缓存
            const cacheKey = 'articles_all';
            if (window.cacheManager && window.cacheManager.has(cacheKey)) {
                this.articles = window.cacheManager.get(cacheKey);
                console.log('✅ 从缓存加载文章:', this.articles.length + ' 篇');
                return;
            }
            
            const response = await fetch('/api/articles?limit=100');
            const data = await response.json();
            this.articles = data.articles.map(article => ({
                ...article,
                excerpt: this.generateExcerpt(article.content || article.htmlContent),
                category: article.category || 'uncategorized'
            }));
            
            // 存入缓存
            if (window.cacheManager) {
                window.cacheManager.set(cacheKey, this.articles);
            }
            
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
        // 防抖渲染
        const now = Date.now();
        if (now - this.lastRenderTime < this.renderThrottle) {
            return;
        }
        this.lastRenderTime = now;
        
        // 如果渲染被暂停，不执行渲染
        if (this.renderingPaused) {
            console.log('📄 DynamicArticleManager 渲染已暂停，等待手动搜索完成');
            return;
        }
        
        const articlesContainer = document.querySelector('.articles-grid');
        if (!articlesContainer) return;
        
        if (this.filteredArticles.length === 0) {
            articlesContainer.innerHTML = `
                <div class="no-articles">
                    <h3>没有找到相关文章</h3>
                    <p>请尝试调整搜索条件</p>
                </div>
            `;
            this.updateResultsInfo();
            this.renderPagination(0, 0);
            return;
        }
        
        // 分页计算
        const totalPages = Math.ceil(this.filteredArticles.length / this.articlesPerPage);
        const startIndex = (this.currentPage - 1) * this.articlesPerPage;
        const endIndex = startIndex + this.articlesPerPage;
        const currentPageArticles = this.filteredArticles.slice(startIndex, endIndex);
        
        // 使用DocumentFragment提高性能
        const fragment = document.createDocumentFragment();
        
        // 批量创建文章卡片
        currentPageArticles.forEach((article) => {
            const articleCard = this.createArticleCard(article);
            fragment.appendChild(articleCard);
        });
        
        // 一次性更新DOM
        articlesContainer.innerHTML = '';
        articlesContainer.appendChild(fragment);
        
        // 更新搜索框和过滤器状态
        this.updateFilterUI();
        
        // 更新结果统计和分页
        this.updateResultsInfo();
        this.renderPagination(this.filteredArticles.length, totalPages);
    }
    
    createArticleCard(article) {
        const card = document.createElement('article');
        card.className = 'article-card';
        card.dataset.category = article.category;
        
        // 获取分类显示名称
        const categoryDisplayName = this.getCategoryDisplayName(article.category);
        
        // 使用新的卡片结构，提升性能
        card.innerHTML = `
            <header class="article-card-header">
                <div class="article-meta">
                    <time class="article-date">${this.formatDate(article.date)}</time>
                    <span class="article-category">${categoryDisplayName}</span>
                </div>
                <h2 class="article-title">
                    <a href="/articles/${article.slug}" title="${article.title}">${article.title}</a>
                </h2>
            </header>
            <div class="article-card-body">
                <p class="article-excerpt">${article.excerpt}</p>
            </div>
            <footer class="article-card-footer">
                <div class="article-tags">
                    ${article.tags && article.tags.length > 0 ? article.tags.slice(0, 3).map(tag => 
                        `<span class="article-tag" data-tag="${tag}">#${tag}</span>`
                    ).join('') : ''}
                </div>
            </footer>
        `;
        
        // 为了性能，移除复杂的交互效果，只保留基本的点击功能
        card.addEventListener('click', (e) => {
            // 如果点击的是标签，则搜索标签
            if (e.target.classList.contains('article-tag')) {
                e.preventDefault();
                e.stopPropagation();
                const tag = e.target.dataset.tag;
                this.searchByTag(tag);
            } else if (!e.target.closest('a')) {
                // 如果不是点击链接，则跳转到文章详情
                window.location.href = `/articles/${article.slug}`;
            }
        }, { passive: true });
        
        return card;
    }
    
    getCategoryDisplayName(category) {
        const categoryMap = {
            'java': 'Java',
            'spring': 'Spring',
            'database': 'Database',
            'daily': 'Daily',
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
            // 处理文章数为0的情况
            if (this.filteredArticles.length === 0) {
                resultsInfo.innerHTML = `
                    <div class="results-display">
                        <span class="results-count">暂无文章</span>
                        <span class="results-divider">·</span>
                        <span class="results-total">共 0 篇文章</span>
                    </div>
                `;
                return;
            }
            
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
        // 搜索框事件 - 检查是否已被EnhancedArticlesFilter接管
        const searchInput = document.querySelector('.search-input');
        if (searchInput && !searchInput.hasAttribute('data-enhanced-filter')) {
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
                // 清空搜索条件
                this.filters.search = '';
                this.filters.tags = '';
                this.filters.category = e.target.dataset.category;
                
                // 清空搜索框（包括EnhancedArticlesFilter的搜索框）
                const searchInput = document.querySelector('.search-input');
                if (searchInput) {
                    searchInput.value = '';
                    // 如果是EnhancedArticlesFilter管理的搜索框，也要重置其状态
                    if (searchInput.hasAttribute('data-enhanced-filter')) {
                        // 触发input事件来清空EnhancedArticlesFilter的搜索状态
                        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
                
                this.applyFilters();
                this.renderArticles();
                this.updateURL();
            });
        });
    }
    
    // 标签搜索功能
    searchByTag(tag) {
        // 清空其他搜索条件
        this.filters.search = '';
        this.filters.category = 'all';
        this.filters.tags = tag;
        this.currentPage = 1;
        
        // 清空搜索框
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // 重置分类过滤器
        const filterTags = document.querySelectorAll('.filter-tag');
        filterTags.forEach(filterTag => {
            filterTag.classList.remove('active');
            if (filterTag.dataset.category === 'all') {
                filterTag.classList.add('active');
            }
        });
        
        console.log(`🏷️ 按标签搜索: ${tag}`);
        
        this.applyFilters();
        this.renderArticles();
        this.updateURL();
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
    
    // 暂停渲染方法，供EnhancedArticlesFilter调用
    pauseRendering() {
        this.renderingPaused = true;
        console.log('⏸️ DynamicArticleManager 渲染已暂停');
    }
    
    // 恢复渲染方法
    resumeRendering() {
        this.renderingPaused = false;
        console.log('▶️ DynamicArticleManager 渲染已恢复');
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
// 动态文章加载和筛选功能
class DynamicArticlesManager {
    constructor() {
        this.articlesContainer = document.querySelector('.articles-grid');
        this.searchInput = document.querySelector('.search-input');
        this.filterTags = document.querySelectorAll('.filter-tag');
        this.paginationInfo = document.querySelector('.pagination-info');
        this.prevBtn = document.querySelector('.pagination-btn:first-child');
        this.nextBtn = document.querySelector('.pagination-btn:last-child');
        
        this.currentPage = 1;
        this.totalPages = 1;
        this.currentCategory = 'all';
        this.currentSearch = '';
        this.currentTag = ''; // 新增标签筛选
        
        this.init();
    }
    
    init() {
        this.loadArticles();
        this.bindEvents();
        console.log('📚 动态文章管理器初始化完成');
    }
    
    bindEvents() {
        // 搜索功能
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value;
                this.currentPage = 1;
                this.loadArticles();
            });
        }
        
        // 分类筛选
        this.filterTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                this.currentCategory = e.target.dataset.category;
                this.currentPage = 1;
                this.setActiveFilter(e.target);
                this.loadArticles();
            });
        });
        
        // 分页按钮
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.loadArticles();
                }
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                if (this.currentPage < this.totalPages) {
                    this.currentPage++;
                    this.loadArticles();
                }
            });
        }
        
        // 处理URL参数
        this.handleUrlParams();
    }
    
    handleUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const search = urlParams.get('search');
        const tag = urlParams.get('tag'); // 新增标签参数处理
        
        if (category) {
            this.currentCategory = category;
            const filterTag = document.querySelector(`[data-category="${category}"]`);
            if (filterTag) {
                this.setActiveFilter(filterTag);
            }
        }
        
        if (search) {
            this.currentSearch = search;
            if (this.searchInput) {
                this.searchInput.value = search;
            }
        }
        
        if (tag) {
            this.currentTag = tag;
            // 显示当前标签筛选状态
            this.showTagFilter(tag);
        }
    }
    
    showTagFilter(tag) {
        // 在页面上显示当前的标签筛选状态
        const pageHeader = document.querySelector('.page-header');
        if (pageHeader) {
            const existingTagNotice = pageHeader.querySelector('.tag-filter-notice');
            if (existingTagNotice) {
                existingTagNotice.remove();
            }
            
            const tagNotice = document.createElement('div');
            tagNotice.className = 'tag-filter-notice';
            tagNotice.innerHTML = `
                <span>筛选标签: <strong>${tag}</strong></span>
                <button onclick="clearTagFilter()" style="margin-left: 10px; padding: 2px 8px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">清除</button>
            `;
            tagNotice.style.cssText = 'margin-top: 10px; padding: 8px 12px; background: #e3f2fd; border-radius: 6px; font-size: 14px;';
            pageHeader.appendChild(tagNotice);
        }
    }
    
    setActiveFilter(activeTag) {
        this.filterTags.forEach(tag => tag.classList.remove('active'));
        activeTag.classList.add('active');
    }
    
    async loadArticles() {
        try {
            this.showLoading();
            
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 6
            });
            
            if (this.currentCategory !== 'all') {
                params.append('category', this.currentCategory);
            }
            
            // 优先使用标签筛选，其次是搜索
            if (this.currentTag) {
                params.append('tags', this.currentTag);
            } else if (this.currentSearch) {
                params.append('search', this.currentSearch);
            }
            
            const response = await fetch(`/api/articles?${params}`);
            const data = await response.json();
            
            this.renderArticles(data.articles);
            this.updatePagination(data);
            
        } catch (error) {
            console.error('Error loading articles:', error);
            this.showError('Failed to load articles');
        }
    }
    
    renderArticles(articles) {
        if (!this.articlesContainer) return;
        
        if (articles.length === 0) {
            this.articlesContainer.innerHTML = `
                <div class="no-articles">
                    <p>No articles found matching your criteria.</p>
                </div>
            `;
            return;
        }
        
        this.articlesContainer.innerHTML = articles.map(article => 
            this.createArticleCard(article)
        ).join('');
    }
    
    createArticleCard(article) {
        const categoryInfo = this.getCategoryInfo(article.category);
        
        return `
            <article class="article-card" data-category="${article.category}">
                <div class="article-meta">
                    <span class="article-date">${this.formatDate(article.date)}</span>
                    <span class="article-category">${categoryInfo.name}</span>
                </div>
                <h2 class="article-title">
                    <a href="/articles/${article.slug}">${article.title}</a>
                </h2>
                <p class="article-excerpt">${article.excerpt}</p>
                <div class="article-tags">
                    ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </article>
        `;
    }
    
    getCategoryInfo(category) {
        const categories = {
            'programming': { name: 'Programming' },
            'algorithms': { name: 'Algorithms' },
            'interests': { name: 'Interests' },
            'daily': { name: 'Daily' },
            'devops': { name: 'DevOps' },
            'architecture': { name: 'Architecture' },
            'tools': { name: 'Tools' }
        };
        
        return categories[category] || { name: 'General' };
    }
    
    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
    
    updatePagination(data) {
        this.totalPages = data.totalPages;
        
        if (this.paginationInfo) {
            this.paginationInfo.textContent = `Page ${data.page} of ${data.totalPages}`;
        }
        
        if (this.prevBtn) {
            this.prevBtn.disabled = data.page <= 1;
        }
        
        if (this.nextBtn) {
            this.nextBtn.disabled = data.page >= data.totalPages;
        }
    }
    
    showLoading() {
        if (this.articlesContainer) {
            this.articlesContainer.innerHTML = `
                <div class="loading-articles">
                    <div class="loading-spinner"></div>
                    <p>Loading articles...</p>
                </div>
            `;
        }
    }
    
    showError(message) {
        if (this.articlesContainer) {
            this.articlesContainer.innerHTML = `
                <div class="error-message">
                    <p>⚠️ ${message}</p>
                </div>
            `;
        }
    }
}

// 全局函数：清除标签筛选
window.clearTagFilter = function() {
    window.location.href = '/articles';
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    new DynamicArticlesManager();
});
// 增强的文章筛选和搜索功能
class EnhancedArticlesFilter {
    constructor() {
        this.searchInput = document.querySelector('.search-input');
        this.filterTags = document.querySelectorAll('.filter-tag');
        this.articleCards = document.querySelectorAll('.article-card');
        this.activeCategory = 'all';
        this.activeSearchTerm = '';
        this.activeTag = null;
        this.isManualSearch = false; // 标识是否为手动搜索
        
        this.init();
    }
    
    init() {
        // 检查URL参数（只处理分类参数，不处理搜索和标签参数）
        this.parseUrlParams();
        
        if (this.searchInput) {
            // 为搜索框添加标识，避免与其他管理器冲突
            this.searchInput.setAttribute('data-enhanced-filter', 'true');
            
            // 搜索功能 - 仅支持title搜索
            this.searchInput.addEventListener('input', (e) => {
                this.isManualSearch = true;
                this.activeSearchTerm = e.target.value;
                this.performTitleSearch();
            });
            
            // 搜索框回车事件
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.isManualSearch = true;
                    this.performTitleSearch();
                }
            });
        }
        
        // 分类筛选
        this.filterTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                
                // 清空搜索栏
                this.activeSearchTerm = '';
                this.isManualSearch = false;
                if (this.searchInput) {
                    this.searchInput.value = '';
                }
                
                // 恢复其他管理器的渲染
                if (window.articleManager && typeof window.articleManager.resumeRendering === 'function') {
                    window.articleManager.resumeRendering();
                }
                
                this.setActiveCategory(category);
                this.filterArticles();
            });
        });
        
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
        
        // 仅处理分类参数，避免与其他管理器冲突
        const categoryParam = urlParams.get('category');
        if (categoryParam) {
            this.activeCategory = categoryParam;
            this.setActiveCategory(categoryParam);
        }
        
        // 不处理标签和搜索参数，让DynamicArticleManager处理
        // 应用筛选
        if (categoryParam) {
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
    
    // 专门的title搜索方法
    performTitleSearch() {
        // 如果搜索词为空，恢复其他管理器的渲染
        if (!this.activeSearchTerm.trim()) {
            this.isManualSearch = false;
            if (window.articleManager && typeof window.articleManager.resumeRendering === 'function') {
                window.articleManager.resumeRendering();
                // 让DynamicArticleManager重新渲染，不要自己干预
                window.articleManager.renderArticles();
            }
            return;
        }
        
        // 如果有其他管理器在运行，先停止它们的渲染
        if (window.articleManager && typeof window.articleManager.pauseRendering === 'function') {
            window.articleManager.pauseRendering();
        }
        
        this.filterArticles();
        
        console.log(`🔍 手动title搜索: "${this.activeSearchTerm}"`);
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
        const cardCategory = card.dataset.category;
        
        const title = titleElement ? titleElement.textContent.toLowerCase() : '';
        
        // 检查搜索条件 - 仅支持title搜索
        const searchTerm = this.activeSearchTerm.toLowerCase();
        const matchesSearch = !searchTerm || title.includes(searchTerm);
        
        // 检查分类条件
        const matchesCategory = this.activeCategory === 'all' || cardCategory === this.activeCategory;
        
        return matchesSearch && matchesCategory;
    }
    
    highlightSearchTerms(card) {
        if (!this.activeSearchTerm || !this.isManualSearch) return;
        
        // 仅高亮title中的搜索词
        const titleElement = card.querySelector('.article-title a');
        
        if (titleElement) {
            this.highlightText(titleElement, this.activeSearchTerm);
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
    
    updateResultsInfo(count) {
        // 如果count未定义或为负数，重新计算
        if (count === undefined || count < 0) {
            count = this.countVisibleArticles();
        }
        
        // 查找已存在的结果信息显示元素并隐藏
        let resultsInfo = document.querySelector('.search-results-info');
        
        if (resultsInfo) {
            resultsInfo.style.display = 'none';
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
    
    updateUrl() {
        const urlParams = new URLSearchParams();
        
        // 更新分类参数到URL
        if (this.activeCategory && this.activeCategory !== 'all') {
            urlParams.set('category', this.activeCategory);
        }
        
        // 更新标签参数到URL
        if (this.activeTag) {
            urlParams.set('tag', this.activeTag);
        }
        
        const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
        history.replaceState(null, '', newUrl);
    }
    
    clearSearch() {
        this.activeSearchTerm = '';
        this.activeCategory = 'all';
        this.activeTag = null;
        this.isManualSearch = false;
        
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        
        // 恢复其他管理器的渲染
        if (window.articleManager && typeof window.articleManager.resumeRendering === 'function') {
            window.articleManager.resumeRendering();
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
// 文章筛选功能
class ArticlesFilter {
    constructor() {
        this.searchInput = document.querySelector('.search-input');
        this.filterTags = document.querySelectorAll('.filter-tag');
        this.articleCards = document.querySelectorAll('.article-card');
        this.activeCategory = 'all';
        
        this.init();
    }
    
    init() {
        if (!this.searchInput || !this.filterTags.length) return;
        
        // 搜索功能
        this.searchInput.addEventListener('input', (e) => {
            this.filterArticles(e.target.value, this.activeCategory);
        });
        
        // 分类筛选
        this.filterTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.setActiveCategory(category);
                this.filterArticles(this.searchInput.value, category);
            });
        });
        
        console.log('🔍 文章筛选功能初始化完成');
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
    }
    
    filterArticles(searchTerm, category) {
        let visibleCount = 0;
        
        this.articleCards.forEach(card => {
            const title = card.querySelector('.article-title a').textContent.toLowerCase();
            const excerpt = card.querySelector('.article-excerpt').textContent.toLowerCase();
            const cardCategory = card.dataset.category;
            
            const matchesSearch = !searchTerm || 
                title.includes(searchTerm.toLowerCase()) || 
                excerpt.includes(searchTerm.toLowerCase());
            
            const matchesCategory = category === 'all' || cardCategory === category;
            
            if (matchesSearch && matchesCategory) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.3s ease forwards';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // 显示结果统计
        this.updateResultsInfo(visibleCount);
    }
    
    updateResultsInfo(count) {
        // 可以添加结果数量显示
        console.log(`显示 ${count} 篇文章`);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    new ArticlesFilter();
});
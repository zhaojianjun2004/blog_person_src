// 动态分类页面管理
class DynamicCategoriesManager {
    constructor() {
        this.categoriesContainer = document.querySelector('.categories-grid');
        this.statsGrid = document.querySelector('.stats-grid');
        this.popularTagsContainer = document.querySelector('.tag-cloud');
        
        this.init();
    }
    
    init() {
        this.loadStats();
        this.loadCategories();
        this.loadPopularTags();
        console.log('📂 动态分类管理器初始化完成');
    }
    
    async loadStats() {
        try {
            const response = await fetch('/api/stats');
            const stats = await response.json();
            
            if (this.statsGrid) {
                this.renderStats(stats);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }
    
    async loadCategories() {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            
            if (this.categoriesContainer) {
                this.renderCategories(data);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            this.showError('Failed to load categories');
        }
    }
    
    async loadPopularTags() {
        try {
            const response = await fetch('/api/tags');
            const data = await response.json();
            
            if (this.popularTagsContainer && data.popularTags) {
                this.renderPopularTags(data.popularTags);
            }
        } catch (error) {
            console.error('Error loading popular tags:', error);
        }
    }
    
    renderStats(stats) {
        const statsCards = [
            {
                title: 'Total Articles',
                value: stats.totalArticles,
                icon: '📝',
                description: '发表的技术文章'
            },
            {
                title: 'Categories',
                value: stats.totalCategories,
                icon: '📂',
                description: '涵盖的技术领域'
            },
            {
                title: 'Tags',
                value: stats.totalTags,
                icon: '🏷️',
                description: '技术标签数量'
            },
            {
                title: 'Last Updated',
                value: this.formatDate(stats.lastUpdated),
                icon: '⏰',
                description: '最近更新时间'
            }
        ];
        
        this.statsGrid.innerHTML = statsCards.map(stat => 
            this.createStatCard(stat)
        ).join('');
    }
    
    renderPopularTags(popularTags) {
        if (!this.popularTagsContainer) return;
        
        this.popularTagsContainer.innerHTML = popularTags.map(tagInfo => {
            // 根据使用频率调整字体大小
            const fontSize = Math.max(0.8, Math.min(1.2, tagInfo.count / 5));
            return `<span class="tag-cloud-item" 
                           style="font-size: ${fontSize}em; cursor: pointer;" 
                           onclick="goToTagSearch('${tagInfo.tag}')" 
                           title="Used in ${tagInfo.count} articles">${tagInfo.tag}</span>`;
        }).join('');
    }
    
    createStatCard(stat) {
        return `
            <div class="stat-card">
                <div class="stat-icon">${stat.icon}</div>
                <div class="stat-content">
                    <div class="stat-value">${stat.value}</div>
                    <div class="stat-title">${stat.title}</div>
                    <div class="stat-description">${stat.description}</div>
                </div>
            </div>
        `;
    }
    
    renderCategories(categories) {
        this.categoriesContainer.innerHTML = Object.keys(categories).map(categoryId => {
            const category = categories[categoryId];
            return this.createCategoryCard(categoryId, category);
        }).join('');
        
        // 绑定标签点击事件
        this.bindTagClickEvents();
    }
    
    createCategoryCard(categoryId, category) {
        const relatedTags = this.getRelatedTags(categoryId);
        const articleCount = category.count || 0;
        
        return `
            <div class="category-card" onclick="goToCategory('${categoryId}')">
                <div class="category-header">
                    <div class="category-icon">${category.icon}</div>
                    <h3 class="category-title">${category.name}</h3>
                </div>
                <p class="category-description">${category.description}</p>
                <div class="category-stats">
                    <span class="article-count">${articleCount} articles</span>
                    <div class="category-tags">
                        ${relatedTags.slice(0, 3).map(tag => 
                            `<span class="mini-tag" onclick="event.stopPropagation(); goToTagSearch('${tag}')">${tag}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    getRelatedTags(categoryId) {
        // 根据分类返回相关标签
        const tagMap = {
            'java': ['Java', 'JVM', 'JUC', 'Maven','springboot'],
            'database': ['MySQL', 'Redis', 'PostgreSQL', 'SQL' , 'NoSQL' , 'MongoDB'],
            'daily': ['Daily Life', 'Thoughts', 'Experience', 'Growth','Thinking','daily','life'],
            'spring': ['SpringBoot', 'SpringCloud', 'Microservices', 'RESTAPI','Spring','security'],
            'devops': ['Docker', 'CI/CD', 'Kubernetes', 'Linux', 'Nginx','DevOps'],
            'tools': ['VSCode', 'Git', 'Github', 'CLI', 'Postman','IDEA']
        };
        return tagMap[categoryId] || ['General'];
    }
    
    bindTagClickEvents() {
        // 标签点击事件已经在HTML中通过onclick绑定
        console.log('标签点击事件已绑定');
    }
    
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
    
    showError(message) {
        if (this.categoriesContainer) {
            this.categoriesContainer.innerHTML = `
                <div class="error-message">
                    <p>⚠️ ${message}</p>
                </div>
            `;
        }
    }
    
    goToCategory(categoryId) {
        window.location.href = `/articles?category=${categoryId}`;
    }
}

// 全局方法，供HTML内联onclick调用
window.goToCategory = function(categoryId) {
    window.location.href = `/articles?category=${categoryId}`;
};

window.goToTagSearch = function(tag) {
    // 直接跳转到articles页面，使用tag参数进行后台筛选
    window.location.href = `/articles?tag=${encodeURIComponent(tag)}`;
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    new DynamicCategoriesManager();
});
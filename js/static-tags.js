// 静态标签云管理器
class StaticTagsManager {
    constructor() {
        this.container = document.getElementById('tagsCloud');
        this.init();
    }
    
    async init() {
        if (!this.container) return;
        
        await this.loadAndRenderTags();
        console.log('🏷️ 静态标签云初始化完成');
    }
    
    async loadAndRenderTags() {
        try {
            const response = await fetch('/api/tags');
            const data = await response.json();
            
            let tags = [];
            if (data.popularTags && Array.isArray(data.popularTags)) {
                tags = data.popularTags;
            } else if (data.tags) {
                tags = Object.entries(data.tags).map(([tag, count]) => ({ tag, count }));
            }
            
            this.renderTags(tags);
        } catch (error) {
            console.error('❌ 加载标签失败:', error);
            this.renderDefaultTags();
        }
    }
    
    renderTags(tags) {
        if (tags.length === 0) {
            this.container.innerHTML = '<p>暂无标签</p>';
            return;
        }
        
        // 计算字体大小范围
        const maxCount = Math.max(...tags.map(t => t.count));
        const minCount = Math.min(...tags.map(t => t.count));
        
        this.container.innerHTML = tags.map(({ tag, count }) => {
            const fontSize = this.calculateFontSize(count, minCount, maxCount);
            return `
                <span class="tag-cloud-item" 
                      style="font-size: ${fontSize}em;" 
                      onclick="handleTagClick('${tag}')"
                      data-count="${count}">
                    ${tag}
                </span>
            `;
        }).join('');
    }
    
    calculateFontSize(count, minCount, maxCount) {
        const minSize = 0.8;
        const maxSize = 1.6;
        
        if (maxCount === minCount) {
            return 1.0;
        }
        
        const ratio = (count - minCount) / (maxCount - minCount);
        return minSize + (maxSize - minSize) * ratio;
    }
    
    renderDefaultTags() {
        const defaultTags = [
            { tag: 'Java', count: 5 },
            { tag: 'Spring Boot', count: 4 },
            { tag: 'MySQL', count: 3 },
            { tag: 'Best Practices', count: 4 },
            { tag: 'Clean Code', count: 3 }
        ];
        
        this.renderTags(defaultTags);
    }
}

// 全局标签点击处理函数
function handleTagClick(tagName) {
    window.location.href = `/articles?tags=${encodeURIComponent(tagName)}`;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    new StaticTagsManager();
});
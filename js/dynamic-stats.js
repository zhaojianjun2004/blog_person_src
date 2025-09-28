// 动态统计数据加载器
class DynamicStats {
    constructor() {
        this.loadStats();
    }

    async loadStats() {
        try {
            const response = await fetch('/api/stats');
            const stats = await response.json();
            
            this.updateHomeStats(stats);
        } catch (error) {
            console.error('❌ 加载统计数据失败:', error);
        }
    }

    updateHomeStats(stats) {
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length >= 3) {
            // 更新文章数量
            statNumbers[0].textContent = stats.totalArticles;
            statNumbers[0].setAttribute('data-count', stats.totalArticles);
            
            // 更新分类数量（假设第二个是经验年数，保持不变）
            // statNumbers[1] 保持原值
            
            // 更新项目数量为标签数量
            statNumbers[2].textContent = stats.totalTags;
            statNumbers[2].setAttribute('data-count', stats.totalTags);
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    new DynamicStats();
});
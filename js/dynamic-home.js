// 动态主页管理器
class DynamicHomeManager {
    constructor() {
        this.statsCards = document.querySelectorAll('.stat-card .stat-number');
        this.init();
    }
    
    init() {
        this.loadStats();
        console.log('🏠 动态主页管理器初始化完成');
    }
    
    async loadStats() {
        try {
            const response = await fetch('/api/stats');
            const stats = await response.json();
            
            this.updateStatsCards(stats);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }
    
    updateStatsCards(stats) {
        // 更新统计卡片数据
        const statMapping = [
            { selector: '.stat-card:nth-child(1) .stat-number', value: stats.totalArticles },
            { selector: '.stat-card:nth-child(2) .stat-number', value: stats.totalCategories },
            { selector: '.stat-card:nth-child(3) .stat-number', value: stats.totalTags },
            { selector: '.stat-card:nth-child(4) .stat-number', value: this.formatDate(stats.lastUpdated) }
        ];
        
        statMapping.forEach((mapping, index) => {
            const element = document.querySelector(mapping.selector);
            if (element) {
                // 使用动画效果更新数字
                if (index < 3) {
                    this.animateNumber(element, mapping.value);
                } else {
                    element.textContent = mapping.value;
                }
            }
        });
    }
    
    animateNumber(element, targetValue) {
        const startValue = 0;
        const duration = 1500; // 1.5秒
        const startTime = Date.now();
        
        const updateNumber = () => {
            const currentTime = Date.now();
            const progress = Math.min((currentTime - startTime) / duration, 1);
            
            // 使用缓动函数
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                element.textContent = targetValue;
            }
        };
        
        requestAnimationFrame(updateNumber);
    }
    
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 延迟一点启动，确保其他脚本先初始化
    setTimeout(() => {
        new DynamicHomeManager();
    }, 100);
});
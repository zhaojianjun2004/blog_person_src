// 动态漂浮标签云管理器
class FloatingTagsManager {
    constructor() {
        this.container = document.getElementById('floatingTagsContainer');
        this.tags = [];
        this.animationClasses = ['float-1', 'float-2', 'float-3', 'float-4', 'float-5'];
        this.themes = ['primary', 'secondary', 'accent'];
        this.init();
    }
    
    async init() {
        if (!this.container) return;
        
        await this.loadTagsFromAPI();
        this.generateFloatingTags();
        this.startRandomRepositioning();
        
        console.log('✨ 动态漂浮标签云初始化完成');
    }
    
    async loadTagsFromAPI() {
        try {
            const response = await fetch('/api/tags');
            const data = await response.json();
            
            // 使用popularTags数组数据
            if (data.popularTags && Array.isArray(data.popularTags)) {
                this.tags = data.popularTags.map((item, index) => ({
                    name: item.tag,
                    weight: Math.min(item.count + 1, 5), // 限制权重在1-5之间
                    theme: this.themes[index % this.themes.length],
                    count: item.count
                }));
            } else {
                // 如果没有popularTags，使用tags对象
                this.tags = Object.entries(data.tags || {}).map(([name, count], index) => ({
                    name,
                    weight: Math.min(count + 1, 5),
                    theme: this.themes[index % this.themes.length],
                    count
                }));
            }
            
            console.log('📊 加载标签数据:', this.tags);
        } catch (error) {
            console.error('❌ 加载标签失败，使用默认数据:', error);
            // 使用默认标签数据
            this.tags = [
                { name: 'Java', weight: 5, theme: 'primary' },
                { name: 'Spring Boot', weight: 4, theme: 'primary' },
                { name: 'MySQL', weight: 3, theme: 'secondary' },
                { name: 'Best Practices', weight: 4, theme: 'accent' },
                { name: 'Clean Code', weight: 3, theme: 'primary' },
                { name: 'Microservices', weight: 3, theme: 'secondary' }
            ];
        }
    }
    
    generateFloatingTags() {
        this.container.innerHTML = '';
        
        this.tags.forEach((tag, index) => {
            const tagElement = this.createFloatingTag(tag, index);
            this.container.appendChild(tagElement);
        });
    }
    
    createFloatingTag(tag, index) {
        const tagElement = document.createElement('div');
        tagElement.className = 'floating-tag';
        tagElement.textContent = tag.name;
        
        // 根据权重设置大小
        const sizeClass = this.getSizeClass(tag.weight);
        tagElement.classList.add(sizeClass);
        
        // 设置主题色
        tagElement.classList.add(`theme-${tag.theme}`);
        
        // 随机选择动画
        const animationClass = this.animationClasses[index % this.animationClasses.length];
        tagElement.classList.add(animationClass);
        
        // 设置随机初始位置
        this.setRandomPosition(tagElement);
        
        // 添加点击事件
        tagElement.addEventListener('click', () => {
            this.handleTagClick(tag.name);
        });
        
        // 添加悬停效果
        this.addHoverEffect(tagElement);
        
        return tagElement;
    }
    
    getSizeClass(weight) {
        if (weight >= 4) return 'size-large';
        if (weight >= 3) return 'size-medium';
        return 'size-small';
    }
    
    setRandomPosition(element) {
        const container = this.container;
        const containerRect = container.getBoundingClientRect();
        
        // 获取容器中心点
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;
        
        // 计算集中区域范围（容器的60%区域）
        const maxRadius = Math.min(containerRect.width, containerRect.height) * 0.3;
        
        // 使用极坐标生成更集中的分布
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * maxRadius;
        
        let x = centerX + radius * Math.cos(angle) - 75; // 预留标签宽度的一半
        let y = centerY + radius * Math.sin(angle) - 25; // 预留标签高度的一半
        
        // 确保不超出边界
        x = Math.max(10, Math.min(x, containerRect.width - 150));
        y = Math.max(10, Math.min(y, containerRect.height - 50));
        
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
    }
    
    addHoverEffect(element) {
        let hoverTimeout;
        
        element.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            element.style.animationPlayState = 'paused';
        });
        
        element.addEventListener('mouseleave', () => {
            hoverTimeout = setTimeout(() => {
                element.style.animationPlayState = 'running';
            }, 500);
        });
    }
    
    handleTagClick(tagName) {
        // 跳转到文章页面并按标签筛选
        window.location.href = `/articles?tags=${encodeURIComponent(tagName)}`;
    }
    
    startRandomRepositioning() {
        // 每30秒随机重新定位一些标签
        setInterval(() => {
            this.repositionRandomTags();
        }, 30000);
    }
    
    repositionRandomTags() {
        const tags = this.container.querySelectorAll('.floating-tag');
        const tagsToReposition = Math.floor(tags.length * 0.3); // 重新定位30%的标签
        
        for (let i = 0; i < tagsToReposition; i++) {
            const randomIndex = Math.floor(Math.random() * tags.length);
            const tag = tags[randomIndex];
            
            // 添加过渡效果
            tag.style.transition = 'all 2s ease-in-out';
            this.setRandomPosition(tag);
            
            // 2秒后移除过渡效果，恢复动画
            setTimeout(() => {
                tag.style.transition = '';
            }, 2000);
        }
    }
    
    // 响应式调整
    handleResize() {
        // 重新定位所有标签以适应新的容器大小
        const tags = this.container.querySelectorAll('.floating-tag');
        tags.forEach(tag => {
            this.setRandomPosition(tag);
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    const floatingTagsManager = new FloatingTagsManager();
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
        floatingTagsManager.handleResize();
    });
});

// 导出为全局变量，方便调试
window.FloatingTagsManager = FloatingTagsManager;
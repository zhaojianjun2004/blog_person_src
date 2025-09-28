// 统计数字动画功能
class StatsAnimator {
    constructor() {
        this.statNumbers = document.querySelectorAll('.stat-number');
        this.animationDuration = 2000; // 2秒动画时间
        this.hasAnimated = false;
        
        this.init();
    }
    
    init() {
        // 使用Intersection Observer检测元素是否进入视口
        this.setupIntersectionObserver();
        console.log('📊 统计动画器初始化完成');
    }
    
    setupIntersectionObserver() {
        const options = {
            threshold: 0.5, // 元素50%可见时触发
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasAnimated) {
                    this.hasAnimated = true;
                    this.animateAllStats();
                }
            });
        }, options);
        
        // 观察统计卡片容器
        const statsContainer = document.querySelector('.stats-cards');
        if (statsContainer) {
            observer.observe(statsContainer);
        }
    }
    
    animateAllStats() {
        this.statNumbers.forEach((element, index) => {
            const targetCount = parseInt(element.getAttribute('data-count') || '0');
            
            // 添加延迟，让动画依次进行
            setTimeout(() => {
                this.animateNumber(element, targetCount);
            }, index * 200);
        });
    }
    
    animateNumber(element, targetCount) {
        const startCount = 0;
        const startTime = performance.now();
        
        const updateNumber = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / this.animationDuration, 1);
            
            // 使用缓动函数让动画更自然
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentCount = Math.floor(startCount + (targetCount - startCount) * easeOutQuart);
            
            element.textContent = currentCount;
            
            // 添加脉冲效果
            if (progress < 1) {
                element.style.transform = `scale(${1 + Math.sin(progress * Math.PI) * 0.1})`;
                requestAnimationFrame(updateNumber);
            } else {
                element.textContent = targetCount;
                element.style.transform = 'scale(1)';
                
                // 动画完成后添加发光效果
                this.addGlowEffect(element);
            }
        };
        
        requestAnimationFrame(updateNumber);
    }
    
    addGlowEffect(element) {
        element.style.textShadow = '0 0 20px var(--tech-primary)';
        
        setTimeout(() => {
            element.style.textShadow = 'none';
        }, 500);
    }
}

// 页面加载完成后初始化统计动画
document.addEventListener('DOMContentLoaded', function() {
    // 延迟初始化，确保页面完全加载
    setTimeout(() => {
        new StatsAnimator();
    }, 1500);
});
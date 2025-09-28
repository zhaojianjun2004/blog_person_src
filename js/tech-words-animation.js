// 技术栈飞行动画效果
class TechWordsAnimation {
    constructor() {
        this.container = document.querySelector('.tech-words');
        this.techWords = [
            'Java', 'Spring Boot', 'MySQL', 'Redis', 'Docker',
            'Git', 'RabbitMQ', 'Kafka', 'Dubbo', 'XXL-Job',
            'MyBatis', 'Maven', 'Gradle', 'IntelliJ IDEA',
            'Linux', 'Nginx', 'Tomcat', 'JVM', 'Microservices',
            'REST API', 'JSON', 'XML', 'JWT', 'OAuth2'
        ];
        
        this.isActive = true;
        this.animationInterval = null;
        
        this.init();
    }
    
    init() {
        if (!this.container) {
            console.warn('技术词汇容器未找到');
            return;
        }
        
        // 开始飞行动画
        this.startAnimation();
        
        // 监听页面可见性变化，优化性能
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAnimation();
            } else {
                this.startAnimation();
            }
        });
        
        console.log('✨ 技术栈飞行动画初始化完成');
    }
    
    startAnimation() {
        if (this.animationInterval) return;
        
        this.isActive = true;
        
        // 每隔一段时间创建新的飞行词汇
        this.animationInterval = setInterval(() => {
            if (this.isActive) {
                this.createFlyingWord();
            }
        }, 2000 + Math.random() * 3000); // 2-5秒间隔
        
        // 立即创建第一个
        setTimeout(() => {
            this.createFlyingWord();
        }, 1000);
    }
    
    stopAnimation() {
        this.isActive = false;
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    }
    
    createFlyingWord() {
        const word = this.getRandomWord();
        const wordElement = this.createWordElement(word);
        
        this.container.appendChild(wordElement);
        
        // 动画结束后移除元素
        setTimeout(() => {
            if (wordElement.parentNode) {
                wordElement.parentNode.removeChild(wordElement);
            }
        }, 15000);
    }
    
    getRandomWord() {
        return this.techWords[Math.floor(Math.random() * this.techWords.length)];
    }
    
    createWordElement(word) {
        const element = document.createElement('div');
        element.className = 'tech-word';
        element.textContent = word;
        
        // 随机位置和样式
        const startY = Math.random() * 60 + 10; // 10% - 70% 的高度
        const fontSize = Math.random() * 0.4 + 0.8; // 0.8rem - 1.2rem
        const opacity = Math.random() * 0.4 + 0.3; // 0.3 - 0.7
        const animationDuration = Math.random() * 10 + 10; // 10-20秒
        
        element.style.cssText = `
            position: absolute;
            top: ${startY}%;
            left: -200px;
            font-size: ${fontSize}rem;
            opacity: ${opacity};
            color: var(--tech-primary);
            font-family: 'JetBrains Mono', monospace;
            font-weight: 500;
            white-space: nowrap;
            pointer-events: none;
            animation: flyAcross ${animationDuration}s linear infinite;
            text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
        `;
        
        return element;
    }
}

// 页面加载完成后初始化技术栈动画
document.addEventListener('DOMContentLoaded', function() {
    // 延迟初始化，让页面先稳定
    setTimeout(() => {
        new TechWordsAnimation();
    }, 3000);
});
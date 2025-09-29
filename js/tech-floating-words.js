// 全屏随机飘动技术栈效果 - 支持主题切换
class TechFloatingWords {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.words = [];
        this.techWords = [
            'JavaScript', 'React', 'Vue.js', 'Node.js', 'Python', 'Java', 'Spring Boot',
            'MySQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'Git', 'TypeScript',
            'HTML5', 'CSS3', 'Webpack', 'Redis', 'PostgreSQL', 'Express', 'Angular',
            'GraphQL', 'REST API', 'Microservices', 'DevOps', 'CI/CD', 'Linux',
            'Nginx', 'Jenkins', 'Elasticsearch', 'RabbitMQ', 'Spring Cloud'
        ];
        this.animationId = null;
        this.isActive = false;
        this.currentTheme = 'dark';
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.bindEvents();
        this.detectCurrentTheme();
        this.createInitialWords();
        this.start();
        console.log('🎈 全屏随机飘动技术栈效果初始化完成');
    }
    
    detectCurrentTheme() {
        this.currentTheme = document.body.getAttribute('data-theme') || 'dark';
    }
    
    createCanvas() {
        // 删除已存在的canvas
        const existingCanvas = document.getElementById('tech-floating-canvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }
        
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'tech-floating-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';
        this.canvas.style.opacity = '0.4';
        
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
    }
    
    bindEvents() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // 监听主题变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    this.currentTheme = document.body.getAttribute('data-theme') || 'dark';
                }
            });
        });
        
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }
    
    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
    }
    
    createWord() {
        return {
            word: this.techWords[Math.floor(Math.random() * this.techWords.length)],
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 2, // 水平速度
            vy: (Math.random() - 0.5) * 2, // 垂直速度
            fontSize: 12 + Math.random() * 20, // 字体大小
            opacity: 0.3 + Math.random() * 0.7, // 透明度
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.02, // 旋转速度
            life: 0.8 + Math.random() * 0.2, // 生命值
            pulsePhase: Math.random() * Math.PI * 2 // 呼吸效果相位
        };
    }
    
    createInitialWords() {
        this.words = [];
        // 初始创建更多词汇，让效果立即可见
        for (let i = 0; i < 25; i++) {
            this.words.push(this.createWord());
        }
    }
    
    updateWords() {
        // 增加新词汇出现频率，让效果更早更快显现
        if (Math.random() < 0.005 && this.words.length < 25) {
            this.words.push(this.createWord());
        }
        
        this.words.forEach(word => {
            // 更新位置
            word.x += word.vx;
            word.y += word.vy;
            
            // 边界碰撞反弹
            if (word.x <= 0 || word.x >= window.innerWidth) {
                word.vx *= -1;
                word.x = Math.max(0, Math.min(window.innerWidth, word.x));
            }
            if (word.y <= 0 || word.y >= window.innerHeight) {
                word.vy *= -1;
                word.y = Math.max(0, Math.min(window.innerHeight, word.y));
            }
            
            // 旋转
            word.rotation += word.rotationSpeed;
            
            // 呼吸效果
            word.pulsePhase += 0.04; // 增加呼吸频率
            
            // 生命周期（稍微加快衰减）
            word.life -= 0.001;
        });
        
        // 移除生命值耗尽的词汇，并添加新的
        const initialLength = this.words.length;
        this.words = this.words.filter(word => word.life > 0);
        
        // 如果有词汇消失，补充新的
        const removedCount = initialLength - this.words.length;
        for (let i = 0; i < removedCount; i++) {
            this.words.push(this.createWord());
        }
    }
    
    drawWords() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.words.forEach(word => {
            this.ctx.save();
            
            // 移动到词汇位置
            this.ctx.translate(word.x, word.y);
            this.ctx.rotate(word.rotation);
            
            // 计算呼吸效果的透明度
            const pulseOpacity = word.opacity * (0.7 + 0.3 * Math.sin(word.pulsePhase));
            
            // 根据主题动态设置颜色
            let baseColor, shadowColor;
            if (this.currentTheme === 'dark') {
                // 黑夜模式：使用青蓝色系，更亮更明显
                baseColor = '0, 255, 255'; // 青色
                shadowColor = 'rgba(0, 255, 255, 0.5)';
            } else {
                // 白天模式：使用深蓝色系
                baseColor = '100, 149, 237'; // 深蓝色
                shadowColor = 'rgba(100, 149, 237, 0.3)';
            }
            
            // 设置字体和样式
            this.ctx.font = `${word.fontSize}px 'JetBrains Mono', monospace`;
            this.ctx.fillStyle = `rgba(${baseColor}, ${pulseOpacity * word.life})`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // 添加发光效果（黑夜模式更明显）
            this.ctx.shadowColor = shadowColor;
            this.ctx.shadowBlur = this.currentTheme === 'dark' ? 12 : 8;
            
            // 绘制文字
            this.ctx.fillText(word.word, 0, 0);
            
            this.ctx.restore();
        });
    }
    
    animate() {
        if (!this.isActive) return;
        
        this.updateWords();
        this.drawWords();
        
        // 使用更高频率的动画帧，确保流畅度
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    start() {
        this.isActive = true;
        this.animate();
    }
    
    pause() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    resume() {
        if (!this.isActive) {
            this.start();
        }
    }
    
    destroy() {
        this.pause();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// 页面加载后立即初始化
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        // 立即启动，不延迟
        setTimeout(() => {
            new TechFloatingWords();
        }, 100); // 只等待100ms确保基本DOM就绪
    }
});
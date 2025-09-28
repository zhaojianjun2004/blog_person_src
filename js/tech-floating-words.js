// 全屏随机飘动技术栈效果
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
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.bindEvents();
        this.createInitialWords();
        this.start();
        console.log('🎈 全屏随机飘动技术栈效果初始化完成');
    }
    
    createCanvas() {
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
        const word = this.techWords[Math.floor(Math.random() * this.techWords.length)];
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const vx = (Math.random() - 0.5) * 1.2; // 增加水平速度
        const vy = (Math.random() - 0.5) * 1.2; // 增加垂直速度
        const opacity = 0.4 + Math.random() * 0.6;
        const fontSize = 10 + Math.random() * 6;
        const rotation = Math.random() * Math.PI * 2;
        const rotationSpeed = (Math.random() - 0.5) * 0.04; // 增加旋转速度
        
        return {
            word,
            x,
            y,
            vx,
            vy,
            opacity,
            fontSize,
            rotation,
            rotationSpeed,
            life: 1.0,
            maxLife: 1.0,
            pulsePhase: Math.random() * Math.PI * 2 // 呼吸效果相位
        };
    }
    
    createInitialWords() {
        // 初始创建一些词汇
        for (let i = 0; i < 15; i++) {
            this.words.push(this.createWord());
        }
    }
    
    updateWords() {
        // 偶尔添加新词汇
        if (Math.random() < 0.002 && this.words.length < 20) {
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
            
            // 设置字体和样式
            this.ctx.font = `${word.fontSize}px 'JetBrains Mono', monospace`;
            this.ctx.fillStyle = `rgba(100, 149, 237, ${pulseOpacity * word.life})`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // 添加轻微的发光效果
            this.ctx.shadowColor = 'rgba(100, 149, 237, 0.3)';
            this.ctx.shadowBlur = 5;
            
            // 绘制文字
            this.ctx.fillText(word.word, 0, 0);
            
            this.ctx.restore();
        });
    }
    
    animate() {
        if (!this.isActive) return;
        
        this.updateWords();
        this.drawWords();
        
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        new TechFloatingWords();
    }
});
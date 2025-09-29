// 黑客风格技术栈穿越效果
class HackerStyleTechEffect {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.words = [];
        this.matrixChars = [];
        this.isDarkMode = false;
        this.animationId = null;
        this.isActive = false;
        
        // 技术词汇
        this.techWords = [
            'JavaScript', 'React', 'Vue.js', 'Node.js', 'Python', 'Java', 'Spring Boot',
            'MySQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'Git', 'TypeScript',
            'HTML5', 'CSS3', 'Webpack', 'Redis', 'PostgreSQL', 'Express', 'Angular',
            'GraphQL', 'REST API', 'Microservices', 'DevOps', 'CI/CD', 'Linux',
            'Nginx', 'Jenkins', 'Elasticsearch', 'RabbitMQ', 'Spring Cloud'
        ];
        
        // 矩阵字符（黑客风格）
        this.matrixCharacters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        this.init();
    }
    
    init() {
        this.detectTheme();
        this.createCanvas();
        this.bindEvents();
        this.start();
        console.log('🎯 黑客风格技术栈效果初始化完成');
    }
    
    detectTheme() {
        // 检测当前主题
        const body = document.body;
        const theme = body.getAttribute('data-theme');
        this.isDarkMode = theme === 'dark';
        
        // 监听主题变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    const newTheme = body.getAttribute('data-theme');
                    this.isDarkMode = newTheme === 'dark';
                    this.updateEffectStyle();
                }
            });
        });
        
        observer.observe(body, { attributes: true });
    }
    
    createCanvas() {
        // 移除旧的canvas
        const existingCanvas = document.getElementById('hacker-tech-canvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }
        
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'hacker-tech-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';
        this.canvas.style.opacity = this.isDarkMode ? '0.9' : '0.3';
        this.canvas.style.mixBlendMode = this.isDarkMode ? 'screen' : 'normal';
        
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
    
    updateEffectStyle() {
        if (this.canvas) {
            this.canvas.style.opacity = this.isDarkMode ? '0.9' : '0.3';
            this.canvas.style.mixBlendMode = this.isDarkMode ? 'screen' : 'normal';
            
            // 重新初始化矩阵字符以适应主题变化
            if (this.isDarkMode && this.matrixChars.length === 0) {
                for (let i = 0; i < 15; i++) {
                    this.matrixChars.push(this.createMatrixChar());
                }
            } else if (!this.isDarkMode) {
                this.matrixChars = [];
            }
        }
    }
    
    start() {
        this.isActive = true;
        this.initializeWords();
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
    
    initializeWords() {
        this.words = [];
        
        // 创建初始的技术词汇流
        for (let i = 0; i < 8; i++) {
            this.words.push(this.createHorizontalWord());
        }
        
        // 创建矩阵字符流（黑夜模式专用）
        if (this.isDarkMode) {
            this.matrixChars = [];
            for (let i = 0; i < 15; i++) {
                this.matrixChars.push(this.createMatrixChar());
            }
        }
    }
    
    createHorizontalWord() {
        const word = this.techWords[Math.floor(Math.random() * this.techWords.length)];
        const y = Math.random() * window.innerHeight;
        const direction = Math.random() > 0.5 ? 1 : -1; // 随机方向
        const speed = 0.8 + Math.random() * 1.5; // 水平速度
        
        return {
            word,
            x: direction > 0 ? -200 : window.innerWidth + 200, // 从屏幕外开始
            y,
            vx: speed * direction,
            direction,
            opacity: 0.6 + Math.random() * 0.4,
            fontSize: 12 + Math.random() * 8,
            glowIntensity: Math.random() * 0.5 + 0.3,
            scanEffect: Math.random() * Math.PI * 2, // 扫描线效果
            life: 1.0,
            wordLength: word.length * 8 // 估算词汇长度（像素）
        };
    }
    
    createMatrixChar() {
        const char = this.matrixCharacters[Math.floor(Math.random() * this.matrixCharacters.length)];
        const x = Math.random() * window.innerWidth;
        
        return {
            char,
            x,
            y: -20,
            vy: 1 + Math.random() * 2,
            opacity: Math.random() * 0.8 + 0.2,
            fontSize: 10 + Math.random() * 4,
            life: 1.0,
            glitchPhase: Math.random() * Math.PI * 2
        };
    }
    
    animate() {
        if (!this.isActive) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.updateWords();
        this.drawWords();
        
        if (this.isDarkMode) {
            this.updateMatrixChars();
            this.drawMatrixChars();
            this.drawScanLines();
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    updateWords() {
        // 更新技术词汇
        this.words.forEach(word => {
            word.x += word.vx;
            word.scanEffect += 0.1; // 扫描效果
            
            // 检查是否完全离开屏幕
            const isOffScreen = word.direction > 0 ? 
                word.x > window.innerWidth + word.wordLength : 
                word.x < -word.wordLength;
            
            if (isOffScreen) {
                word.life = 0; // 标记为需要重新生成
            }
        });
        
        // 移除离屏的词汇并生成新的
        const initialLength = this.words.length;
        this.words = this.words.filter(word => word.life > 0);
        
        // 补充新词汇
        const removedCount = initialLength - this.words.length;
        for (let i = 0; i < removedCount; i++) {
            // 添加随机延迟，避免所有词汇同时出现
            if (Math.random() < 0.7) {
                this.words.push(this.createHorizontalWord());
            }
        }
        
        // 偶尔添加额外的词汇制造密集效果
        if (Math.random() < 0.02 && this.words.length < 12) {
            this.words.push(this.createHorizontalWord());
        }
    }
    
    updateMatrixChars() {
        if (!this.isDarkMode) return;
        
        this.matrixChars.forEach(char => {
            char.y += char.vy;
            char.glitchPhase += 0.08;
            
            // 字符离开屏幕时重置
            if (char.y > window.innerHeight + 20) {
                char.y = -20;
                char.x = Math.random() * window.innerWidth;
                char.char = this.matrixCharacters[Math.floor(Math.random() * this.matrixCharacters.length)];
            }
        });
    }
    
    drawWords() {
        this.words.forEach(word => {
            this.ctx.save();
            
            // 移动到词汇位置
            this.ctx.translate(word.x, word.y);
            
            // 设置字体
            this.ctx.font = `${word.fontSize}px 'JetBrains Mono', 'Courier New', monospace`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            if (this.isDarkMode) {
                // 黑夜模式：绿色黑客风格
                const greenIntensity = Math.sin(word.scanEffect) * 0.3 + 0.7;
                const flickerEffect = Math.sin(word.flickerPhase) * 0.2 + 0.8;
                
                this.ctx.fillStyle = `rgba(0, ${Math.floor(255 * greenIntensity * flickerEffect)}, 0, ${word.opacity})`;
                
                // 强化发光效果
                this.ctx.shadowColor = `rgba(0, 255, 0, ${word.glowIntensity})`;
                this.ctx.shadowBlur = 12;
                
                // 添加故障效果
                const glitchOffset = Math.sin(word.scanEffect * 3) * 2;
                this.ctx.fillText(word.word, glitchOffset, 0);
                
                // 绘制拖尾效果
                if (word.trailPositions.length > 0) {
                    word.trailPositions.forEach((pos, index) => {
                        const trailOpacity = (index / word.trailPositions.length) * word.opacity * 0.3;
                        this.ctx.fillStyle = `rgba(0, 255, 0, ${trailOpacity})`;
                        this.ctx.fillText(word.word, pos.x - word.x, pos.y - word.y);
                    });
                }
            } else {
                // 白天模式：保持原有风格
                this.ctx.fillStyle = `rgba(100, 149, 237, ${word.opacity})`;
                this.ctx.shadowColor = 'rgba(100, 149, 237, 0.3)';
                this.ctx.shadowBlur = 3;
                this.ctx.fillText(word.word, 0, 0);
            }
            
            this.ctx.restore();
        });
    }
    
    drawMatrixChars() {
        if (!this.isDarkMode) return;
        
        this.matrixChars.forEach(char => {
            this.ctx.save();
            
            this.ctx.translate(char.x, char.y);
            this.ctx.font = `${char.fontSize}px 'Courier New', monospace`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // 头部字符更亮
            const brightness = char.isLeading ? 255 : 150 + Math.random() * 105;
            const glitchOffset = Math.sin(char.glitchPhase) * 1;
            
            this.ctx.fillStyle = `rgba(0, ${Math.floor(brightness)}, 0, ${char.opacity})`;
            
            if (char.isLeading) {
                this.ctx.shadowColor = 'rgba(0, 255, 0, 0.8)';
                this.ctx.shadowBlur = 6;
            }
            
            this.ctx.fillText(char.char, glitchOffset, 0);
            
            this.ctx.restore();
        });
    }
    
    drawScanLines() {
        if (!this.isDarkMode) return;
        
        const time = Date.now() * 0.001;
        
        // 主扫描线
        const scanY = (Math.sin(time * 0.5) * 0.5 + 0.5) * window.innerHeight;
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.15)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, scanY);
        this.ctx.lineTo(window.innerWidth, scanY);
        this.ctx.stroke();
        
        // 次要扫描线
        const scanY2 = (Math.sin(time * 0.3 + Math.PI) * 0.5 + 0.5) * window.innerHeight;
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.08)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, scanY2);
        this.ctx.lineTo(window.innerWidth, scanY2);
        this.ctx.stroke();
        
        // 垂直网格线（微弱）
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.03)';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i < window.innerWidth; i += 100) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, window.innerHeight);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
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
    // 只在首页启用
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        // 替换原有的技术栈效果
        new HackerStyleTechEffect();
    }
});
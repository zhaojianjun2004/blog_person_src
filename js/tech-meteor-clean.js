// 全屏技术栈流星雨效果
class TechMeteorShower {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.meteors = [];
        this.techWords = [
            'JavaScript', 'React', 'Vue.js', 'Node.js', 'Python', 'Java', 'Spring Boot',
            'MySQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'Git', 'TypeScript',
            'HTML5', 'CSS3', 'Webpack', 'Redis', 'PostgreSQL', 'Express', 'Angular',
            'GraphQL', 'REST API', 'Microservices', 'DevOps', 'CI/CD', 'Linux',
            'Nginx', 'Jenkins', 'Elasticsearch', 'RabbitMQ', 'Spring Cloud',
            'JVM', 'Maven', 'Gradle', 'IntelliJ IDEA', 'VS Code', 'Postman'
        ];
        this.animationId = null;
        this.isActive = false;
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.bindEvents();
        this.start();
        console.log('🌟 技术栈流星雨效果初始化完成');
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'tech-meteor-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';
        this.canvas.style.opacity = '0.6';
        
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
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    createMeteor() {
        const word = this.techWords[Math.floor(Math.random() * this.techWords.length)];
        const x = Math.random() * window.innerWidth;
        const y = -50;
        const speed = 0.8 + Math.random() * 2.5;
        const opacity = 0.4 + Math.random() * 0.6;
        const fontSize = 10 + Math.random() * 6;
        const drift = (Math.random() - 0.5) * 0.3;
        
        return {
            word,
            x,
            y,
            speed,
            opacity,
            fontSize,
            drift,
            life: 1.0,
            maxLife: 1.0
        };
    }
    
    updateMeteors() {
        if (Math.random() < 0.03) {
            this.meteors.push(this.createMeteor());
        }
        
        this.meteors.forEach(meteor => {
            meteor.y += meteor.speed;
            meteor.x += meteor.drift;
            meteor.life -= 0.005;
            meteor.opacity = meteor.life * meteor.maxLife;
        });
        
        this.meteors = this.meteors.filter(meteor => 
            meteor.y < window.innerHeight + 50 && meteor.life > 0
        );
        
        if (this.meteors.length > 40) {
            this.meteors = this.meteors.slice(-40);
        }
    }
    
    drawMeteors() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.meteors.forEach(meteor => {
            this.ctx.save();
            
            this.ctx.font = `${meteor.fontSize}px 'JetBrains Mono', monospace`;
            this.ctx.fillStyle = `rgba(100, 149, 237, ${meteor.opacity})`;
            this.ctx.textAlign = 'center';
            
            this.ctx.shadowColor = 'rgba(100, 149, 237, 0.5)';
            this.ctx.shadowBlur = 8;
            
            this.ctx.fillText(meteor.word, meteor.x, meteor.y);
            
            this.ctx.fillStyle = `rgba(100, 149, 237, ${meteor.opacity * 0.3})`;
            this.ctx.shadowBlur = 4;
            this.ctx.fillText(meteor.word, meteor.x, meteor.y - meteor.speed * 2);
            
            this.ctx.restore();
        });
    }
    
    animate() {
        if (!this.isActive) return;
        
        this.updateMeteors();
        this.drawMeteors();
        
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
        window.removeEventListener('resize', this.resizeCanvas);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        new TechMeteorShower();
    }
});
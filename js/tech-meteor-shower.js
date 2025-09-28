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
        this.canvas.style.opacity = '0.7';
        
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
    }
    
    bindEvents() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // 页面可见性检测，优化性能
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }\n    \n    resizeCanvas() {\n        const dpr = window.devicePixelRatio || 1;\n        const rect = this.canvas.getBoundingClientRect();\n        \n        this.canvas.width = rect.width * dpr;\n        this.canvas.height = rect.height * dpr;\n        \n        this.ctx.scale(dpr, dpr);\n        this.canvas.style.width = rect.width + 'px';\n        this.canvas.style.height = rect.height + 'px';\n    }\n    \n    createMeteor() {\n        const word = this.techWords[Math.floor(Math.random() * this.techWords.length)];\n        const x = Math.random() * window.innerWidth;\n        const y = -50;\n        const speed = 0.5 + Math.random() * 2;\n        const opacity = 0.3 + Math.random() * 0.7;\n        const fontSize = 12 + Math.random() * 8;\n        const drift = (Math.random() - 0.5) * 0.5; // 轻微的水平漂移\n        \n        return {\n            word,\n            x,\n            y,\n            speed,\n            opacity,\n            fontSize,\n            drift,\n            life: 1.0,\n            maxLife: 1.0\n        };\n    }\n    \n    updateMeteors() {\n        // 创建新的流星\n        if (Math.random() < 0.02) { // 2%的概率创建新流星\n            this.meteors.push(this.createMeteor());\n        }\n        \n        // 更新现有流星\n        this.meteors.forEach(meteor => {\n            meteor.y += meteor.speed;\n            meteor.x += meteor.drift;\n            meteor.life -= 0.003; // 生命值递减\n            meteor.opacity = meteor.life * meteor.maxLife;\n        });\n        \n        // 移除超出屏幕或生命值耗尽的流星\n        this.meteors = this.meteors.filter(meteor => \n            meteor.y < window.innerHeight + 50 && meteor.life > 0\n        );\n        \n        // 限制流星数量，避免性能问题\n        if (this.meteors.length > 50) {\n            this.meteors = this.meteors.slice(-50);\n        }\n    }\n    \n    drawMeteors() {\n        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);\n        \n        this.meteors.forEach(meteor => {\n            this.ctx.save();\n            \n            // 设置字体和透明度\n            this.ctx.font = `${meteor.fontSize}px 'JetBrains Mono', monospace`;\n            this.ctx.fillStyle = `rgba(100, 149, 237, ${meteor.opacity})`; // 科技蓝色\n            this.ctx.textAlign = 'center';\n            \n            // 添加发光效果\n            this.ctx.shadowColor = 'rgba(100, 149, 237, 0.5)';\n            this.ctx.shadowBlur = 10;\n            \n            // 绘制文字\n            this.ctx.fillText(meteor.word, meteor.x, meteor.y);\n            \n            // 绘制轻微的尾迹效果\n            this.ctx.fillStyle = `rgba(100, 149, 237, ${meteor.opacity * 0.3})`;\n            this.ctx.shadowBlur = 5;\n            this.ctx.fillText(meteor.word, meteor.x, meteor.y - meteor.speed * 3);\n            \n            this.ctx.restore();\n        });\n    }\n    \n    animate() {\n        if (!this.isActive) return;\n        \n        this.updateMeteors();\n        this.drawMeteors();\n        \n        this.animationId = requestAnimationFrame(() => this.animate());\n    }\n    \n    start() {\n        this.isActive = true;\n        this.animate();\n    }\n    \n    pause() {\n        this.isActive = false;\n        if (this.animationId) {\n            cancelAnimationFrame(this.animationId);\n        }\n    }\n    \n    resume() {\n        if (!this.isActive) {\n            this.start();\n        }\n    }\n    \n    destroy() {\n        this.pause();\n        if (this.canvas && this.canvas.parentNode) {\n            this.canvas.parentNode.removeChild(this.canvas);\n        }\n        window.removeEventListener('resize', this.resizeCanvas);\n    }\n}\n\n// 等待页面加载完成后启动流星雨效果\ndocument.addEventListener('DOMContentLoaded', function() {\n    // 只在主页启动流星雨效果\n    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {\n        new TechMeteorShower();\n    }\n});
// 星空粒子效果 - 性能优化版本，支持白天/黑夜模式
class StarfieldParticles {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.particleCount = 80; // 粒子数量，控制性能
        this.animationId = null;
        this.isActive = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.currentTheme = 'dark';
        
        this.init();
    }
    
    init() {
        // 检测当前主题
        this.detectTheme();
        
        this.createCanvas();
        this.createParticles();
        this.bindEvents();
        this.start();
        console.log('⭐ 星空粒子效果初始化完成');
    }
    
    detectTheme() {
        this.currentTheme = document.body.getAttribute('data-theme') || 
                            document.documentElement.getAttribute('data-theme') || 'dark';
    }
    
    createCanvas() {
        // 删除已存在的canvas
        const existingCanvas = document.getElementById('starfield-particles-canvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }
        
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'starfield-particles-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            opacity: 0.6;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.resize();
    }
    
    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }
    
    createParticle() {
        return {
            x: Math.random() * (this.canvas ? this.canvas.width : window.innerWidth),
            y: Math.random() * (this.canvas ? this.canvas.height : window.innerHeight),
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5 + 0.3,
            baseColor: this.getRandomColor()
        };
    }
    
    getRandomColor() {
        if (this.currentTheme === 'light') {
            // 浅色模式：使用深色粒子
            const colors = [
                'rgba(99, 102, 241, ',  // 靛蓝色
                'rgba(139, 92, 246, ',  // 紫色
                'rgba(59, 130, 246, ',  // 蓝色
                'rgba(16, 185, 129, ',  // 绿色
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        } else {
            // 深色模式：使用亮色粒子
            const colors = [
                'rgba(0, 217, 255, ',   // 青色
                'rgba(0, 255, 153, ',   // 绿色
                'rgba(0, 153, 255, ',   // 蓝色
                'rgba(138, 92, 246, ',  // 紫色
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }
    }
    
    bindEvents() {
        // 窗口大小改变时重新调整
        window.addEventListener('resize', () => this.resize());
        
        // 监听主题切换，实时更新粒子颜色
        const themeObserver = new MutationObserver(() => {
            const newTheme = document.body.getAttribute('data-theme') || 
                            document.documentElement.getAttribute('data-theme') || 'dark';
            
            if (newTheme !== this.currentTheme) {
                console.log(`⭐ 主题切换: ${this.currentTheme} -> ${newTheme}`);
                this.currentTheme = newTheme;
                
                // 重新生成粒子颜色
                this.particles.forEach(particle => {
                    particle.baseColor = this.getRandomColor();
                });
                
                // 调整canvas透明度
                if (this.canvas) {
                    this.canvas.style.opacity = newTheme === 'light' ? '0.4' : '0.6';
                }
            }
        });
        
        themeObserver.observe(document.body, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
        
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
        
        // 跟踪鼠标位置（用于交互效果）
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    }
    
    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // 根据屏幕大小调整粒子数量（性能优化）
        const area = this.canvas.width * this.canvas.height;
        const baseArea = 1920 * 1080;
        const targetCount = Math.floor(80 * (area / baseArea));
        
        if (this.particles.length !== targetCount) {
            const diff = targetCount - this.particles.length;
            if (diff > 0) {
                for (let i = 0; i < diff; i++) {
                    this.particles.push(this.createParticle());
                }
            } else {
                this.particles.splice(targetCount);
            }
        }
    }
    
    update() {
        this.particles.forEach(particle => {
            // 更新位置
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // 边界检测
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx *= -1;
                particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy *= -1;
                particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
            }
            
            // 微弱的闪烁效果
            particle.opacity += (Math.random() - 0.5) * 0.02;
            particle.opacity = Math.max(0.2, Math.min(0.8, particle.opacity));
        });
    }
    
    draw() {
        if (!this.ctx) return;
        
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制粒子
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.baseColor + particle.opacity + ')';
            this.ctx.fill();
            
            // 添加微光效果
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.radius * 3
            );
            gradient.addColorStop(0, particle.baseColor + particle.opacity + ')');
            gradient.addColorStop(1, particle.baseColor + '0)');
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        });
        
        // 绘制粒子之间的连线（只连接近距离的粒子，性能优化）
        this.drawConnections();
    }
    
    drawConnections() {
        const maxDistance = 120; // 最大连接距离
        
        // 根据主题选择连线颜色
        const lineColor = this.currentTheme === 'light' 
            ? 'rgba(99, 102, 241, ' 
            : 'rgba(0, 217, 255, ';
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.3;
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = lineColor + opacity + ')';
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    animate() {
        if (!this.isActive) return;
        
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.animate();
    }
    
    stop() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    destroy() {
        this.stop();
        if (this.canvas) {
            this.canvas.remove();
            this.canvas = null;
            this.ctx = null;
        }
        this.particles = [];
    }
}

// 初始化星空粒子效果
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.starfieldParticles = new StarfieldParticles();
    });
} else {
    window.starfieldParticles = new StarfieldParticles();
}

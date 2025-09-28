// 鼠标拖尾效果
class MouseTrail {
    constructor() {
        this.particles = [];
        this.maxParticles = 15;
        this.color = '#00ffff'; // 单一蓝色
        
        this.init();
    }
    
    init() {
        // 创建容器
        this.container = document.createElement('div');
        this.container.className = 'mouse-trail-container';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(this.container);
        
        // 监听鼠标移动
        document.addEventListener('mousemove', (e) => {
            this.addParticle(e.clientX, e.clientY);
        });
        
        // 开始动画循环
        this.animate();
    }
    
    addParticle(x, y) {
        if (this.particles.length >= this.maxParticles) {
            const oldParticle = this.particles.shift();
            if (oldParticle.element && oldParticle.element.parentNode) {
                oldParticle.element.parentNode.removeChild(oldParticle.element);
            }
        }
        
        const particle = {
            x: x,
            y: y,
            life: 1,
            decay: 0.02,
            element: this.createParticleElement(x, y)
        };
        
        this.particles.push(particle);
        this.container.appendChild(particle.element);
    }
    
    createParticleElement(x, y) {
        const element = document.createElement('div');
        const size = Math.random() * 6 + 3;
        
        element.style.cssText = `
            position: absolute;
            left: ${x - size/2}px;
            top: ${y - size/2}px;
            width: ${size}px;
            height: ${size}px;
            background: ${this.color};
            border-radius: 50%;
            opacity: 1;
            box-shadow: 0 0 ${size * 2}px ${this.color};
            transition: opacity 0.1s ease;
        `;
        
        return element;
    }
    
    animate() {
        this.particles.forEach((particle, index) => {
            particle.life -= particle.decay;
            
            if (particle.life <= 0) {
                if (particle.element && particle.element.parentNode) {
                    particle.element.parentNode.removeChild(particle.element);
                }
                this.particles.splice(index, 1);
            } else {
                particle.element.style.opacity = particle.life;
                particle.element.style.transform = `scale(${particle.life})`;
            }
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// 只在非主页创建鼠标拖尾效果
document.addEventListener('DOMContentLoaded', function() {
    const isHomePage = window.location.pathname === '/' || window.location.pathname === '/index.html';
    
    if (!isHomePage) {
        new MouseTrail();
    }
});
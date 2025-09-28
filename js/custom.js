// 现代化科技感交互效果

document.addEventListener('DOMContentLoaded', function() {
    // 添加科技感装饰类
    addTechDecorators();
    
    // 添加鼠标跟随效果
    addMouseFollowEffect();
    
    // 添加打字机效果到标题
    addTypewriterEffect();
    
    // 添加粒子效果
    addParticleEffect();
    
    // 添加代码块复制成功动画
    enhanceCodeBlocks();
    
    // 添加页面加载动画
    addPageLoadAnimation();
});

// 添加科技感装饰器
function addTechDecorators() {
    // 为文章标题添加装饰
    const postTitles = document.querySelectorAll('.recent-post-item h3 a');
    postTitles.forEach(title => {
        if (!title.classList.contains('tech-decorator')) {
            title.classList.add('tech-decorator');
        }
    });
    
    // 为导航菜单添加装饰
    const navItems = document.querySelectorAll('#nav-menu .nav-item');
    navItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.textShadow = '0 0 10px rgba(0, 212, 255, 0.8)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.textShadow = 'none';
        });
    });
}

// 鼠标跟随光效
function addMouseFollowEffect() {
    const cursor = document.createElement('div');
    cursor.classList.add('tech-cursor');
    cursor.innerHTML = `
        <style>
            .tech-cursor {
                position: fixed;
                width: 20px;
                height: 20px;
                background: radial-gradient(circle, rgba(0, 212, 255, 0.8) 0%, transparent 70%);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                mix-blend-mode: screen;
                transition: transform 0.1s ease;
            }
            
            .tech-cursor::before {
                content: '';
                position: absolute;
                top: -10px;
                left: -10px;
                width: 40px;
                height: 40px;
                background: radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, transparent 70%);
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.5); opacity: 0.5; }
            }
        </style>
    `;
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
    });
    
    // 在可点击元素上改变光标效果
    const clickables = document.querySelectorAll('a, button, .btn');
    clickables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.5)';
            cursor.style.background = 'radial-gradient(circle, rgba(0, 255, 255, 1) 0%, transparent 70%)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursor.style.background = 'radial-gradient(circle, rgba(0, 212, 255, 0.8) 0%, transparent 70%)';
        });
    });
}

// 增强打字机效果
function addTypewriterEffect() {
    const subtitle = document.querySelector('#site-subtitle');
    if (subtitle) {
        subtitle.style.fontFamily = "'JetBrains Mono', 'Courier New', monospace";
        subtitle.style.borderRight = '2px solid #00d4ff';
        subtitle.style.animation = 'blink 1s infinite';
        
        // 添加终端风格样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes blink {
                0%, 50% { border-right-color: #00d4ff; }
                51%, 100% { border-right-color: transparent; }
            }
        `;
        document.head.appendChild(style);
    }
}

// 添加粒子连接效果
function addParticleEffect() {
    // 检查是否已经有 canvas-nest 效果，如果没有则添加简单粒子效果
    if (!document.querySelector('#canvas-nest')) {
        const canvas = document.createElement('canvas');
        canvas.id = 'tech-particles';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1';
        canvas.style.pointerEvents = 'none';
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        const particles = [];
        const particleCount = 50;
        
        // 创建粒子
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 绘制粒子
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // 边界检测
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
                
                // 绘制粒子
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 212, 255, ${particle.opacity})`;
                ctx.fill();
            });
            
            // 绘制连接线
            particles.forEach((particle, i) => {
                particles.slice(i + 1).forEach(otherParticle => {
                    const distance = Math.sqrt(
                        Math.pow(particle.x - otherParticle.x, 2) +
                        Math.pow(particle.y - otherParticle.y, 2)
                    );
                    
                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.strokeStyle = `rgba(0, 212, 255, ${0.3 * (1 - distance / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
            });
            
            requestAnimationFrame(animate);
        }
        
        animate();
    }
}

// 增强代码块
function enhanceCodeBlocks() {
    const codeBlocks = document.querySelectorAll('.highlight');
    codeBlocks.forEach(block => {
        block.classList.add('tech-border');
        
        // 添加复制成功动画
        const copyBtn = block.querySelector('.copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', function() {
                // 创建成功提示
                const successMsg = document.createElement('div');
                successMsg.textContent = 'Copied!';
                successMsg.style.cssText = `
                    position: absolute;
                    top: -30px;
                    right: 10px;
                    background: #00d4ff;
                    color: white;
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-family: 'JetBrains Mono', monospace;
                    animation: fadeInOut 2s forwards;
                    z-index: 1000;
                `;
                
                block.style.position = 'relative';
                block.appendChild(successMsg);
                
                setTimeout(() => {
                    successMsg.remove();
                }, 2000);
            });
        }
    });
    
    // 添加 fadeInOut 动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(10px); }
            20% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-10px); }
        }
    `;
    document.head.appendChild(style);
}

// 页面加载动画
function addPageLoadAnimation() {
    // 为页面元素添加进入动画
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    });
    
    // 观察需要动画的元素
    const animatedElements = document.querySelectorAll('.recent-post-item, .card-widget, .post-content');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
    });
    
    // 添加 fadeInUp 动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// 添加终端风格的控制台欢迎信息
console.log(`
%c╔═══════════════════════════════════════════╗
║                                           ║
║        欢迎来到 CaiCaiXiong 的博客         ║
║                                           ║
║        > 探索技术的无限可能               ║
║        > 记录成长的每一步                 ║
║        > 分享知识的快乐                   ║
║                                           ║
╚═══════════════════════════════════════════╝
`, 'color: #00d4ff; font-family: "JetBrains Mono", "Courier New", monospace;');

console.log('%c系统加载完成... 准备就绪 ✓', 'color: #00ff00; font-family: "JetBrains Mono", monospace;');
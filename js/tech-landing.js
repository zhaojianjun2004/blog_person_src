// 科技风初始页面交互脚本

document.addEventListener('DOMContentLoaded', function() {
    
    // 打字机效果配置
    const typingElement = document.getElementById('typing-element');
    const messages = [
        'System.out.println("Hello, World!");',
        'const passion = () => { return "Coding"; };',
        'public class Developer extends Human {}',
        'while(alive) { learn(); code(); grow(); }',
        '# Building the future, one line at a time',
        'async function dream() { await reality(); }',
        'SELECT * FROM knowledge WHERE curiosity = true;',
        'git commit -m "Another step forward"'
    ];
    
    let messageIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function typeWriter() {
        const currentMessage = messages[messageIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentMessage.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingElement.textContent = currentMessage.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }
        
        if (!isDeleting && charIndex === currentMessage.length) {
            isDeleting = true;
            typingSpeed = 2000; // 停留时间
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            messageIndex = (messageIndex + 1) % messages.length;
        }
        
        setTimeout(typeWriter, typingSpeed);
    }
    
    // 启动打字机效果
    setTimeout(typeWriter, 1000);
    
    // 统计数字动画
    function animateNumbers() {
        const stats = [
            { element: '.stat-number:nth-child(1)', target: 1024, suffix: '' },
            { element: '.stat-number:nth-child(2)', target: 256, suffix: '' },
            { element: '.stat-number:nth-child(3)', target: 128, suffix: '' }
        ];
        
        stats.forEach((stat, index) => {
            const element = document.querySelector(`.stat-item:nth-child(${index + 1}) .stat-number`);
            if (element) {
                let current = 0;
                const increment = stat.target / 100;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= stat.target) {
                        current = stat.target;
                        clearInterval(timer);
                    }
                    element.textContent = Math.floor(current) + stat.suffix;
                }, 50);
            }
        });
    }
    
    // 页面加载完成后启动数字动画
    setTimeout(animateNumbers, 2000);
    
    // 鼠标移动时的粒子效果
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        createParticle(mouseX, mouseY);
    });
    
    function createParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'mouse-particle';
        particle.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 4px;
            height: 4px;
            background: #00ffff;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            animation: particleFade 0.8s ease-out forwards;
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 800);
    }
    
    // 添加粒子动画样式
    if (!document.querySelector('#particle-styles')) {
        const style = document.createElement('style');
        style.id = 'particle-styles';
        style.textContent = `
            @keyframes particleFade {
                0% {
                    opacity: 1;
                    transform: scale(1) translate(0, 0);
                }
                100% {
                    opacity: 0;
                    transform: scale(0.5) translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 按钮悬停效果增强
    const techButtons = document.querySelectorAll('.tech-button');
    techButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            
            // 创建涟漪效果
            const ripple = document.createElement('div');
            ripple.className = 'button-ripple';
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(0, 255, 255, 0.3);
                animation: ripple 0.6s linear;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                width: 0;
                height: 0;
                z-index: -1;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // 添加涟漪动画样式
    if (!document.querySelector('#ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            @keyframes ripple {
                to {
                    width: 200px;
                    height: 200px;
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 技能卡片悬停效果
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.animation = 'skillPulse 0.6s ease-in-out';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.animation = '';
            }
        });
    });
    
    // 添加技能脉冲动画
    if (!document.querySelector('#skill-pulse-styles')) {
        const style = document.createElement('style');
        style.id = 'skill-pulse-styles';
        style.textContent = `
            @keyframes skillPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 滚动视差效果
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.code-line');
        
        parallaxElements.forEach((element, index) => {
            const rate = scrolled * -0.5 * (index + 1);
            element.style.transform = `translate3d(${rate}px, 0, 0)`;
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
    
    // 页面加载动画
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
        
        // 为各元素添加进入动画
        const animatedElements = [
            '.hero-text',
            '.tech-stats',
            '.hero-actions',
            '.skills-section'
        ];
        
        animatedElements.forEach((selector, index) => {
            setTimeout(() => {
                const element = document.querySelector(selector);
                if (element) {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }
            }, index * 200);
        });
    });
    
    // 初始化时隐藏动画元素
    const animatedElements = [
        '.hero-text',
        '.tech-stats', 
        '.hero-actions',
        '.skills-section'
    ];
    
    animatedElements.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'all 0.8s ease-out';
        }
    });
    
    console.log('%c🚀 Welcome to CaiCaiXiong Tech Landing!', 'color: #00ffff; font-size: 16px; font-weight: bold;');
    console.log('%c> System initialized successfully', 'color: #00ff99; font-family: monospace;');
    console.log('%c> Ready for exploration...', 'color: #0099ff; font-family: monospace;');
});
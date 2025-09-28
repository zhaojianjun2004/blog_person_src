// 现代化科技感主题交互脚本

document.addEventListener('DOMContentLoaded', function() {
    
    // 主题切换增强
    function enhanceThemeToggle() {
        const themeToggle = document.querySelector('#darkmode');
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                setTimeout(() => {
                    // 添加主题切换动画
                    document.body.style.transition = 'all 0.3s ease';
                }, 100);
            });
        }
    }
    
    // 科技感动效
    function addTechEffects() {
        // 为文章卡片添加悬停效果
        const postItems = document.querySelectorAll('.recent-post-item');
        postItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
        
        // 为侧边栏卡片添加效果
        const cardWidgets = document.querySelectorAll('#aside-content .card-widget');
        cardWidgets.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateX(-5px)';
                this.style.borderColor = 'var(--tech-primary)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateX(0)';
                this.style.borderColor = 'var(--tech-border)';
            });
        });
    }
    
    // 创建悬停粒子效果
    function createHoverParticles(element) {
        // 取消粒子效果
    }
    
    // 添加代码块复制按钮增强效果
    function enhanceCodeBlocks() {
        const codeBlocks = document.querySelectorAll('.highlight');
        codeBlocks.forEach(block => {
            block.addEventListener('mouseenter', function() {
                this.style.borderColor = 'var(--tech-primary)';
                this.style.boxShadow = 'var(--tech-glow)';
            });
            
            block.addEventListener('mouseleave', function() {
                this.style.borderColor = 'var(--tech-border)';
                this.style.boxShadow = 'var(--tech-shadow)';
            });
        });
    }
    
    // 增强滚动效果
    function enhanceScrollEffects() {
        let lastScrollTop = 0;
        const nav = document.querySelector('#nav');
        
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (nav) {
                if (scrollTop > lastScrollTop && scrollTop > 100) {
                    // 向下滚动，隐藏导航栏
                    nav.style.transform = 'translateY(-100%)';
                } else {
                    // 向上滚动，显示导航栏
                    nav.style.transform = 'translateY(0)';
                }
            }
            
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        });
        
        // 视差效果
        const parallaxElements = document.querySelectorAll('.recent-post-item');
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach((element, index) => {
                const rate = scrolled * -0.1;
                element.style.transform = `translateY(${rate}px)`;
            });
        });
    }
    
    // 打字机效果增强
    function enhanceTypingEffect() {
        const subtitleElement = document.querySelector('#site-subtitle');
        if (subtitleElement) {
            // 添加光标闪烁效果
            subtitleElement.style.borderRight = '2px solid var(--tech-primary)';
            subtitleElement.style.animation = 'blink 1s infinite';
        }
    }
    
    // 添加键盘快捷键
    function addKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ctrl + / 切换主题
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                const themeToggle = document.querySelector('#darkmode');
                if (themeToggle) {
                    themeToggle.click();
                }
            }
            
            // Esc 键关闭搜索框等
            if (e.key === 'Escape') {
                const searchInput = document.querySelector('.search-input');
                if (searchInput) {
                    searchInput.blur();
                }
            }
        });
    }
    
    // 添加鼠标轨迹效果
    function addMouseTrail() {
        let mouseTrail = [];
        const trailLength = 10;
        
        document.addEventListener('mousemove', function(e) {
            mouseTrail.push({ x: e.clientX, y: e.clientY, time: Date.now() });
            
            if (mouseTrail.length > trailLength) {
                mouseTrail.shift();
            }
            
            // 清理旧的轨迹点
            const now = Date.now();
            mouseTrail = mouseTrail.filter(point => now - point.time < 1000);
        });
    }
    
    // 添加页面加载动画
    function addLoadingAnimation() {
        const content = document.querySelector('#content-inner');
        if (content) {
            content.style.opacity = '0';
            content.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                content.style.transition = 'all 0.8s ease-out';
                content.style.opacity = '1';
                content.style.transform = 'translateY(0)';
            }, 200);
        }
    }
    
    // 添加CSS动画样式
    function addAnimationStyles() {
        if (!document.querySelector('#tech-animations')) {
            const style = document.createElement('style');
            style.id = 'tech-animations';
            style.textContent = `
                @keyframes particleFloat {
                    0% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-50px) scale(0.5);
                    }
                }
                
                @keyframes blink {
                    0%, 50% { border-color: var(--tech-primary); }
                    51%, 100% { border-color: transparent; }
                }
                
                @keyframes techPulse {
                    0%, 100% { 
                        box-shadow: 0 0 5px var(--tech-primary);
                    }
                    50% { 
                        box-shadow: 0 0 20px var(--tech-primary), 0 0 30px var(--tech-accent);
                    }
                }
                
                .tech-pulse {
                    animation: techPulse 2s infinite;
                }
                
                #nav {
                    transition: transform 0.3s ease;
                }
                
                .tech-loaded {
                    animation: slideInUp 0.8s ease-out;
                }
                
                @keyframes slideInUp {
                    0% {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // 初始化所有增强功能
    function init() {
        addAnimationStyles();
        enhanceThemeToggle();
        addTechEffects();
        enhanceCodeBlocks();
        enhanceScrollEffects();
        enhanceTypingEffect();
        addKeyboardShortcuts();
        addMouseTrail();
        addLoadingAnimation();
        
        console.log('%c🚀 Tech Theme Enhanced!', 'color: #00ffff; font-size: 16px; font-weight: bold;');
        console.log('%c> All systems operational', 'color: #00ff99; font-family: monospace;');
    }
    
    // 启动增强功能
    init();
    
    // 页面完全加载后的额外初始化
    window.addEventListener('load', function() {
        // 延迟加载的功能
        setTimeout(() => {
            const techElements = document.querySelectorAll('.recent-post-item, .card-widget');
            techElements.forEach((element, index) => {
                setTimeout(() => {
                    element.classList.add('tech-loaded');
                }, index * 100);
            });
        }, 1000);
    });
});
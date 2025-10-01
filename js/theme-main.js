// 新主题完整JavaScript功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('新主题加载成功！');
    
    // 检查页面类型
    const isHomePage = document.body.classList.contains('home-page');
    const isPageLayout = document.body.classList.contains('page-layout');
    
    // 初始化基础功能
    initThemeToggle();
    initNavigation();
    
    // 根据页面类型初始化特定功能
    if (isHomePage) {
        initHomePage();
    } else if (isPageLayout) {
        initPageLayout();
    }
});

// 主题切换功能
function initThemeToggle() {
    const themeToggle = document.getElementById('darkmode');
    if (!themeToggle) return;
    
    // 读取保存的主题设置，优先使用blog-theme
    const savedTheme = localStorage.getItem('blog-theme') || localStorage.getItem('theme') || 'dark';
    
    // 确保主题已应用（预加载脚本已经处理，这里不需要过渡效果）
    document.body.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.body.setAttribute('data-theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // 同时保存到两个key，保持兼容性
        localStorage.setItem('blog-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        
        console.log('主题切换到:', newTheme);
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#darkmode i');
    if (icon) {
        icon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// 导航功能
function initNavigation() {
    // 高亮当前页面的导航链接
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(function(link) {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '/' && href === '/')) {
            link.classList.add('active');
        }
    });
    
    console.log('导航初始化完成，当前路径:', currentPath);
}

// 首页功能
function initHomePage() {
    console.log('初始化首页功能');
    
    // 打字机效果
    initTypingEffect();
    
    // section导航切换
    initSectionNavigation();
    
    // 统计数字动画
    initStatsAnimation();
}

// 打字机效果
function initTypingEffect() {
    const typingElement = document.getElementById('typing-text');
    if (!typingElement) {
        console.warn('未找到打字机元素');
        return;
    }
    
    const texts = [
        'while(curiosity.isActive())',
        'if(learning.never.stops)', 
        'for(innovation in mind)',
        'when(code.meets.creativity)',
        'try { dreams.become(reality); }'
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function typeEffect() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }
        
        // 判断是否完成当前文本
        if (!isDeleting && charIndex === currentText.length) {
            setTimeout(() => { isDeleting = true; }, 2000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
        }
        
        // 设置下次执行的延迟时间
        const speed = isDeleting ? 50 : 100;
        setTimeout(typeEffect, speed);
    }
    
    // 启动打字机效果
    typeEffect();
    console.log('打字机效果启动');
}

// Section导航切换
function initSectionNavigation() {
    const sectionNavLinks = document.querySelectorAll('.nav-link[href^=\"#\"]');
    const sections = document.querySelectorAll('.section');
    
    sectionNavLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // 隐藏所有section
                sections.forEach(function(section) {
                    section.classList.remove('active');
                });
                
                // 显示目标section
                targetSection.classList.add('active');
                
                // 更新导航状态
                sectionNavLinks.forEach(function(navLink) {
                    navLink.classList.remove('active');
                });
                this.classList.add('active');
                
                console.log('切换到section:', targetId);
            }
        });
    });
}

// 统计数字动画
function initStatsAnimation() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    if (statNumbers.length === 0) return;
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalValue = parseInt(target.textContent) || 0;
                animateNumber(target, 0, finalValue, 2000);
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(function(num) {
        observer.observe(num);
    });
}

function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (end - start) * progress);
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// 页面布局功能（非首页）
function initPageLayout() {
    console.log('初始化页面布局功能');
    
    // 隐藏式导航栏
    initHiddenNavigation();
    
    // 返回顶部按钮
    initBackToTop();
}

// 隐藏式导航栏
function initHiddenNavigation() {
    const nav = document.querySelector('.tech-nav.hidden-nav');
    if (!nav) return;
    
    // 创建触发区域
    const trigger = document.createElement('div');
    trigger.className = 'nav-trigger';
    trigger.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 80px;
        z-index: 999;
        background: transparent;
        pointer-events: all;
    `;
    document.body.appendChild(trigger);
    
    let hideTimer;
    
    function showNavigation() {
        if (hideTimer) clearTimeout(hideTimer);
        nav.classList.add('show');
    }
    
    function hideNavigation() {
        hideTimer = setTimeout(function() {
            nav.classList.remove('show');
        }, 500);
    }
    
    // 添加事件监听器
    trigger.addEventListener('mouseenter', showNavigation);
    nav.addEventListener('mouseenter', showNavigation);
    trigger.addEventListener('mouseleave', hideNavigation);
    nav.addEventListener('mouseleave', hideNavigation);
    
    console.log('隐藏式导航栏初始化完成');
}

// 返回顶部功能
function initBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });
    
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
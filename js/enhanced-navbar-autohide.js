// 增强的导航栏自动隐藏/显示功能
class EnhancedNavbarAutoHide {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.lastScrollTop = 0;
        this.scrollThreshold = 100;
        this.isScrolling = false;
        this.scrollTimer = null;
        this.mouseY = 0;
        this.isMouseNearTop = false;
        
        this.init();
    }
    
    init() {
        if (!this.navbar) return;
        
        // 添加必要的CSS过渡效果
        this.navbar.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out';
        this.navbar.style.position = 'fixed';
        this.navbar.style.top = '0';
        this.navbar.style.left = '0';
        this.navbar.style.right = '0';
        this.navbar.style.zIndex = '1000';
        
        this.bindEvents();
        console.log('🎯 增强导航栏自动隐藏功能初始化完成');
    }
    
    bindEvents() {
        // 滚动事件监听
        let scrollTicking = false;
        window.addEventListener('scroll', () => {
            this.isScrolling = true;
            
            if (!scrollTicking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
            
            // 清除滚动停止计时器
            clearTimeout(this.scrollTimer);
            this.scrollTimer = setTimeout(() => {
                this.isScrolling = false;
                this.handleScrollStop();
            }, 150);
        });
        
        // 鼠标移动事件监听
        document.addEventListener('mousemove', (e) => {
            this.mouseY = e.clientY;
            this.isMouseNearTop = this.mouseY < 80;
            this.handleMouseMove();
        });
        
        // 鼠标离开窗口事件
        document.addEventListener('mouseleave', () => {
            this.isMouseNearTop = false;
            if (this.shouldHideNavbar()) {
                this.hideNavbar();
            }
        });
        
        // 导航栏鼠标悬停事件
        this.navbar.addEventListener('mouseenter', () => {
            this.showNavbar();
        });
        
        this.navbar.addEventListener('mouseleave', () => {
            if (this.shouldHideNavbar()) {
                setTimeout(() => {
                    if (!this.isMouseNearTop && this.shouldHideNavbar()) {
                        this.hideNavbar();
                    }
                }, 200);
            }
        });
    }
    
    handleScroll() {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 在页面顶部时始终显示
        if (currentScrollTop <= this.scrollThreshold) {
            this.showNavbar();
            this.lastScrollTop = currentScrollTop;
            return;
        }
        
        // 如果鼠标在顶部区域，不隐藏导航栏
        if (this.isMouseNearTop) {
            this.showNavbar();
            this.lastScrollTop = currentScrollTop;
            return;
        }
        
        // 滚动方向检测
        const isScrollingDown = currentScrollTop > this.lastScrollTop;
        const scrollDelta = Math.abs(currentScrollTop - this.lastScrollTop);
        
        // 只有当滚动距离足够大时才切换状态
        if (scrollDelta > 5) {
            if (isScrollingDown && currentScrollTop > this.scrollThreshold) {
                // 向下滚动 - 隐藏导航栏（除非鼠标在顶部）
                if (!this.isMouseNearTop) {
                    this.hideNavbar();
                }
            } else if (!isScrollingDown) {
                // 向上滚动 - 显示导航栏
                this.showNavbar();
            }
        }
        
        this.lastScrollTop = currentScrollTop;
    }
    
    handleScrollStop() {
        // 滚动停止后，如果鼠标不在顶部且应该隐藏，则隐藏导航栏
        if (!this.isMouseNearTop && this.shouldHideNavbar()) {
            setTimeout(() => {
                if (!this.isScrolling && !this.isMouseNearTop && this.shouldHideNavbar()) {
                    this.hideNavbar();
                }
            }, 1000); // 1秒后隐藏
        }
    }
    
    handleMouseMove() {
        if (this.isMouseNearTop) {
            this.showNavbar();
        } else if (this.mouseY > 120 && this.shouldHideNavbar()) {
            // 鼠标远离顶部区域，且满足隐藏条件
            setTimeout(() => {
                if (!this.isMouseNearTop && this.shouldHideNavbar()) {
                    this.hideNavbar();
                }
            }, 300);
        }
    }
    
    shouldHideNavbar() {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return currentScrollTop > this.scrollThreshold && !this.navbar.matches(':hover');
    }
    
    showNavbar() {
        this.navbar.style.transform = 'translateY(0)';
        this.navbar.style.opacity = '1';
        this.navbar.classList.remove('navbar-hidden');
    }
    
    hideNavbar() {
        // 只有当鼠标不在导航栏上时才隐藏
        if (!this.navbar.matches(':hover') && !this.isMouseNearTop) {
            this.navbar.style.transform = 'translateY(-100%)';
            this.navbar.style.opacity = '0';
            this.navbar.classList.add('navbar-hidden');
        }
    }
}

// 等待DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    new EnhancedNavbarAutoHide();
});
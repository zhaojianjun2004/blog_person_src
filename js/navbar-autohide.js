// 导航栏自动隐藏/显示功能
class NavbarAutoHide {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.lastScrollY = 0;
        this.ticking = false;
        this.isHidden = false;
        this.mouseY = 0;
        
        this.init();
    }
    
    init() {
        // 初始状态：导航栏隐藏
        this.hideNavbar();
        
        // 监听鼠标移动到顶部区域
        document.addEventListener('mousemove', (e) => {
            this.mouseY = e.clientY;
            if (this.mouseY < 80) { // 鼠标在顶部80px区域内
                this.showNavbar();
            } else if (this.mouseY > 120) { // 鼠标离开导航区域
                this.hideNavbar();
            }
        });
        
        // 监听鼠标离开窗口
        document.addEventListener('mouseleave', () => {
            this.hideNavbar();
        });
        
        console.log('🎯 导航栏自动隐藏功能初始化完成');
    }
    
    requestTick() {
        if (!this.ticking) {
            requestAnimationFrame(() => {
                this.updateNavbar();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }
    
    updateNavbar() {
        const currentScrollY = window.scrollY;
        
        // 在页面顶部时总是显示导航栏
        if (currentScrollY < 50) {
            this.showNavbar();
            this.lastScrollY = currentScrollY;
            return;
        }
        
        // 向上滚动时显示，向下滚动时隐藏
        if (currentScrollY < this.lastScrollY) {
            this.showNavbar();
        } else if (currentScrollY > this.lastScrollY + 10) {
            // 添加一点滚动阈值，避免小幅滚动时频繁切换
            if (this.mouseY > 80) { // 鼠标不在顶部区域时才隐藏
                this.hideNavbar();
            }
        }
        
        this.lastScrollY = currentScrollY;
    }
    
    handleMouseMove() {
        // 鼠标在顶部60px区域内时显示导航栏
        if (this.mouseY < 60 && this.isHidden) {
            this.showNavbar();
        }
    }
    
    showNavbar() {
        if (this.isHidden) {
            this.navbar.style.transform = 'translateY(0)';
            this.navbar.style.opacity = '1';
            this.isHidden = false;
        }
    }
    
    hideNavbar() {
        if (!this.isHidden) {
            this.navbar.style.transform = 'translateY(-100%)';
            this.navbar.style.opacity = '0';
            this.isHidden = true;
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 延迟初始化，确保页面完全加载
    setTimeout(() => {
        new NavbarAutoHide();
    }, 1000);
});
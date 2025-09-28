// 移动端导航菜单功能
class MobileNavManager {
    constructor() {
        this.navToggle = document.getElementById('navToggle');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        // 绑定菜单切换事件
        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => {
                this.toggleMenu();
            });
        }
        
        // 点击菜单项关闭菜单
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.isOpen) {
                    this.closeMenu();
                }
            });
        });
        
        // 点击外部区域关闭菜单
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.navToggle.contains(e.target) && !this.navMenu.contains(e.target)) {
                this.closeMenu();
            }
        });
        
        console.log('📱 移动端导航管理器初始化完成');
    }
    
    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    openMenu() {
        this.isOpen = true;
        this.navMenu.classList.add('active');
        this.animateToggleButton();
        
        // 阻止背景滚动
        document.body.style.overflow = 'hidden';
    }
    
    closeMenu() {
        this.isOpen = false;
        this.navMenu.classList.remove('active');
        this.animateToggleButton();
        
        // 恢复背景滚动
        document.body.style.overflow = 'auto';
    }
    
    animateToggleButton() {
        const spans = this.navToggle.querySelectorAll('span');
        
        if (this.isOpen) {
            // 汉堡菜单变为X
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            // X变回汉堡菜单
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    }
}

// 初始化移动端导航
document.addEventListener('DOMContentLoaded', function() {
    new MobileNavManager();
});
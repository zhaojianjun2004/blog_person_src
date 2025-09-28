// 主题切换功能
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('blog-theme') || 'dark';
        this.themeToggle = document.getElementById('themeToggle');
        this.body = document.body;
        
        this.init();
    }
    
    init() {
        // 设置初始主题
        this.applyTheme(this.currentTheme);
        
        // 绑定切换事件
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        console.log('🎨 主题管理器初始化完成');
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(this.currentTheme);
        
        // 保存到本地存储
        localStorage.setItem('blog-theme', this.currentTheme);
        
        // 添加切换动画
        this.addSwitchAnimation();
    }
    
    applyTheme(theme) {
        this.body.setAttribute('data-theme', theme);
        
        // 更新主题切换按钮图标
        if (this.themeToggle) {
            const icon = this.themeToggle.querySelector('.toggle-icon');
            if (icon) {
                icon.textContent = theme === 'dark' ? '☀️' : '🌙';
            }
        }
        
        console.log(`🎨 主题已切换到: ${theme}`);
    }
    
    addSwitchAnimation() {
        // 添加主题切换的视觉反馈
        this.body.style.transition = 'all 0.3s ease';
        
        // 按钮旋转动画
        if (this.themeToggle) {
            this.themeToggle.style.transform = 'scale(0.9) rotate(180deg)';
            setTimeout(() => {
                this.themeToggle.style.transform = 'scale(1) rotate(0deg)';
            }, 150);
        }
    }
}

// 页面加载完成后初始化主题管理器
document.addEventListener('DOMContentLoaded', function() {
    new ThemeManager();
});
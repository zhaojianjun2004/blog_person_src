// 主题切换功能
class ThemeManager {
    constructor() {
        // 从localStorage读取主题，优先使用blog-theme，保持向后兼容
        this.currentTheme = localStorage.getItem('blog-theme') || localStorage.getItem('theme') || 'dark';
        this.themeToggle = document.getElementById('themeToggle');
        this.body = document.body;
        
        this.init();
    }
    
    init() {
        // 确保主题已应用（虽然预加载脚本已经处理了，但这里再次确认）
        this.applyTheme(this.currentTheme, false);
        
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
        this.applyTheme(this.currentTheme, true);
        
        // 同时保存到两个key，保持兼容性
        localStorage.setItem('blog-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        
        // 添加切换动画
        this.addSwitchAnimation();
    }
    
    applyTheme(theme, withTransition = true) {
        // 如果不需要过渡效果，暂时禁用
        if (!withTransition) {
            this.body.style.transition = 'none';
        }
        
        this.body.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        
        // 恢复过渡效果
        if (!withTransition) {
            // 强制重排，然后恢复过渡
            this.body.offsetHeight;
            this.body.style.transition = '';
        }
        
        // 更新主题切换按钮图标
        if (this.themeToggle) {
            const icon = this.themeToggle.querySelector('.toggle-icon');
            if (icon) {
                icon.textContent = theme === 'dark' ? '🌓' : '☀️';
            }
        }
        
        if (withTransition) {
            console.log(`🎨 主题已切换到: ${theme}`);
        }
    }
    
    addSwitchAnimation() {
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
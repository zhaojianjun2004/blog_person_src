// 阅读模式管理器
class ReadingModeManager {
    constructor() {
        this.isReadingMode = false;
        this.toggleBtn = null;
        this.storageKey = 'article-reading-mode';
        
        this.init();
    }
    
    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.toggleBtn = document.getElementById('readingModeToggle');
        
        if (!this.toggleBtn) {
            console.warn('未找到阅读模式切换按钮');
            return;
        }
        
        // 恢复保存的阅读模式状态
        this.restoreReadingMode();
        
        // 绑定点击事件
        this.toggleBtn.addEventListener('click', () => this.toggle());
        
        // 监听键盘快捷键 (R键)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                // 避免在输入框中触发
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    this.toggle();
                }
            }
        });
        
        console.log('📖 阅读模式管理器初始化完成 (按 R 键切换)');
    }
    
    toggle() {
        this.isReadingMode = !this.isReadingMode;
        this.applyReadingMode();
        this.saveReadingMode();
        
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('readingModeChange', {
            detail: { isReadingMode: this.isReadingMode }
        }));
    }
    
    applyReadingMode() {
        if (this.isReadingMode) {
            document.body.classList.add('reading-mode');
            this.toggleBtn.classList.add('active');
            this.toggleBtn.title = '退出阅读模式 (R)';
            
            // 显示提示信息
            this.showNotification('已进入阅读模式');
        } else {
            document.body.classList.remove('reading-mode');
            this.toggleBtn.classList.remove('active');
            this.toggleBtn.title = '阅读模式 (R)';
            
            // 显示提示信息
            this.showNotification('已退出阅读模式');
        }
    }
    
    saveReadingMode() {
        try {
            localStorage.setItem(this.storageKey, this.isReadingMode ? '1' : '0');
        } catch (e) {
            console.warn('无法保存阅读模式状态:', e);
        }
    }
    
    restoreReadingMode() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved === '1') {
                this.isReadingMode = true;
                this.applyReadingMode();
            }
        } catch (e) {
            console.warn('无法恢复阅读模式状态:', e);
        }
    }
    
    showNotification(message) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = 'reading-mode-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 0.9rem;
            z-index: 10000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        
        // 浅色模式样式
        if (document.body.getAttribute('data-theme') === 'light') {
            notification.style.background = 'rgba(255, 255, 255, 0.95)';
            notification.style.color = '#333';
            notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }
        
        document.body.appendChild(notification);
        
        // 触发动画
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // 2秒后移除
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }
    
    // 公共API
    enable() {
        if (!this.isReadingMode) {
            this.toggle();
        }
    }
    
    disable() {
        if (this.isReadingMode) {
            this.toggle();
        }
    }
    
    isEnabled() {
        return this.isReadingMode;
    }
}

// 初始化阅读模式管理器
window.readingModeManager = new ReadingModeManager();
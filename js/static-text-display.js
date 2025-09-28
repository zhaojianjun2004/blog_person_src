// 静态文字展示效果
class StaticTextDisplay {
    constructor() {
        this.typingElement = document.getElementById('typing-element');
        this.cursor = document.querySelector('.cursor');
        
        // 固定显示的代码句子
        this.staticMessage = 'System.out.println("Hello, World!");';
        
        this.init();
    }
    
    init() {
        if (!this.typingElement) {
            console.warn('文字显示元素未找到');
            return;
        }
        
        // 完全隐藏光标
        if (this.cursor) {
            this.cursor.style.display = 'none';
        }
        
        // 设置静态文字，无任何动画效果
        this.typingElement.textContent = this.staticMessage;
        this.typingElement.style.opacity = '1';
        this.typingElement.style.transform = 'translateY(0)';
        
        console.log('📝 静态文字展示效果初始化完成');
    }
    
    destroy() {
        if (this.typingElement) {
            this.typingElement.textContent = '';
        }
        if (this.cursor) {
            this.cursor.style.display = 'block';
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    new StaticTextDisplay();
});
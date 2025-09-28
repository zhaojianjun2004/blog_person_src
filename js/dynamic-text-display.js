// 动态文字展示效果（替代打字机效果）
class DynamicTextDisplay {
    constructor() {
        this.typingElement = document.getElementById('typing-element');
        this.cursor = document.querySelector('.cursor');
        
        // 编程相关的句子
        this.messages = [
            'System.out.println("Hello, World!");',
            'const passion = () => { return "Coding"; };',
            'public class Developer extends Human {}',
            'while(alive) { learn(); code(); grow(); }',
            '# Building the future, one line at a time',
            'async function dream() { await reality(); }',
            'SELECT * FROM knowledge WHERE curiosity = true;',
            'git commit -m "Another step forward"',
            'Spring Boot makes Java development easier',
            'Docker containerize everything',
            'Redis caches the world'
        ];
        
        this.messageIndex = 0;
        this.displayInterval = null;
        
        this.init();
    }
    
    init() {
        if (!this.typingElement) {
            console.warn('文字显示元素未找到');
            return;
        }
        
        // 隐藏光标，因为不再需要打字机效果
        if (this.cursor) {
            this.cursor.style.display = 'none';
        }
        
        // 设置平滑过渡效果
        this.typingElement.style.transition = 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out';
        
        // 初始显示第一条消息
        this.displayMessage();
        
        // 开始循环显示
        this.startDisplay();
        
        console.log('🎭 动态文字展示效果初始化完成');
    }
    
    displayMessage() {
        if (!this.typingElement) return;
        
        const currentMessage = this.messages[this.messageIndex];
        
        // 淡出效果
        this.typingElement.style.opacity = '0';
        this.typingElement.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            // 更新文字内容
            this.typingElement.textContent = currentMessage;
            
            // 淡入效果
            this.typingElement.style.opacity = '1';
            this.typingElement.style.transform = 'translateY(0)';
        }, 250);
    }
    
    nextMessage() {
        this.messageIndex = (this.messageIndex + 1) % this.messages.length;
        this.displayMessage();
    }
    
    startDisplay() {
        // 每5秒切换到下一条消息
        this.displayInterval = setInterval(() => {
            this.nextMessage();
        }, 5000);
    }
    
    stopDisplay() {
        if (this.displayInterval) {
            clearInterval(this.displayInterval);
            this.displayInterval = null;
        }
    }
    
    // 页面不可见时暂停，可见时恢复
    handleVisibilityChange() {
        if (document.hidden) {
            this.stopDisplay();
        } else {
            this.startDisplay();
        }
    }
    
    destroy() {
        this.stopDisplay();
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
    const dynamicText = new DynamicTextDisplay();
    
    // 监听页面可见性变化，优化性能
    document.addEventListener('visibilitychange', () => {
        dynamicText.handleVisibilityChange();
    });
});
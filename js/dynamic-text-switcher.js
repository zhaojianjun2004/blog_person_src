// 动态文本切换效果
class DynamicTextSwitcher {
    constructor() {
        this.typingElement = document.getElementById('typing-element');
        this.cursor = document.querySelector('.cursor');
        
        // 有意义的句子集合
        this.messages = [
            'Welcome to my blog!',
            'Sharing knowledge, building the future.',
            'Code with passion, create with purpose.',
            'Learning never stops, growing never ends.',
            'From ideas to implementation.',
            'Building scalable solutions together.',
            'Exploring the world of technology.',
            'Every bug is a learning opportunity.',
            'Clean code, clean mind.',
            'Innovation through collaboration.',
            'Think different, code better.',
            'Debugging is like being a detective.',
            'Good code is its own best documentation.',
            'Simplicity is the ultimate sophistication.',
            'First, solve the problem. Then, write the code.',
            'Code is poetry written for machines.',
            'The best error message is the one that never shows up.',
            'Programming is thinking, not typing.',
            'Make it work, make it right, make it fast.',
            'Software is a great combination of artistry and engineering.'
        ];
        
        this.currentIndex = 0;
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        if (!this.typingElement) {
            console.warn('文字显示元素未找到');
            return;
        }
        
        // 隐藏光标
        if (this.cursor) {
            this.cursor.style.display = 'none';
        }
        
        // 开始文本切换动画
        this.startTextSwitching();
        
        console.log('✨ 动态文本切换效果初始化完成');
    }
    
    startTextSwitching() {
        // 首次显示第一个句子
        this.showText(this.messages[0]);
        
        // 每5秒切换一次文本
        setInterval(() => {
            this.switchToNext();
        }, 5000);
    }
    
    switchToNext() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.currentIndex = (this.currentIndex + 1) % this.messages.length;
        
        // 淡出当前文本
        this.fadeOut().then(() => {
            // 切换到新文本并淡入
            return this.showText(this.messages[this.currentIndex]);
        }).then(() => {
            this.isAnimating = false;
        });
    }
    
    fadeOut() {
        return new Promise((resolve) => {
            this.typingElement.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
            this.typingElement.style.opacity = '0';
            this.typingElement.style.transform = 'translateY(-10px)';
            
            setTimeout(resolve, 800);
        });
    }
    
    showText(text) {
        return new Promise((resolve) => {
            // 设置新文本
            this.typingElement.textContent = text;
            
            // 从下方淡入
            this.typingElement.style.transform = 'translateY(10px)';
            this.typingElement.style.opacity = '0';
            
            // 强制重绘
            this.typingElement.offsetHeight;
            
            // 淡入动画
            this.typingElement.style.transition = 'opacity 0.8s ease-in, transform 0.8s ease-in';
            this.typingElement.style.opacity = '1';
            this.typingElement.style.transform = 'translateY(0)';
            
            setTimeout(resolve, 800);
        });
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
    new DynamicTextSwitcher();
});
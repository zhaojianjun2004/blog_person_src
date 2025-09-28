// 打字机效果实现
class TypewriterEffect {
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
        this.charIndex = 0;
        this.isDeleting = false;
        this.typingSpeed = 100;
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        if (!this.typingElement) {
            console.warn('打字机元素未找到');
            return;
        }
        
        // 初始化显示
        this.typingElement.textContent = '';
        
        // 开始打字机效果
        setTimeout(() => {
            this.startTyping();
        }, 2000);
        
        console.log('⌨️ 打字机效果初始化完成');
    }
    
    startTyping() {
        this.isInitialized = true;
        this.typeWriter();
    }
    
    typeWriter() {
        if (!this.isInitialized || !this.typingElement) return;
        
        const currentMessage = this.messages[this.messageIndex];
        
        if (this.isDeleting) {
            // 删除字符
            this.typingElement.textContent = currentMessage.substring(0, this.charIndex - 1);
            this.charIndex--;
            this.typingSpeed = 30; // 删除速度更快
        } else {
            // 添加字符
            this.typingElement.textContent = currentMessage.substring(0, this.charIndex + 1);
            this.charIndex++;
            this.typingSpeed = Math.random() * 100 + 50; // 模拟真实打字速度
        }
        
        // 添加闪烁光标效果
        this.updateCursor();
        
        if (!this.isDeleting && this.charIndex === currentMessage.length) {
            // 完成打字，准备删除
            this.isDeleting = true;
            this.typingSpeed = 2000; // 停留时间
        } else if (this.isDeleting && this.charIndex === 0) {
            // 完成删除，换下一句
            this.isDeleting = false;
            this.messageIndex = (this.messageIndex + 1) % this.messages.length;
            this.typingSpeed = 500; // 换句间隔
        }
        
        setTimeout(() => this.typeWriter(), this.typingSpeed);
    }
    
    updateCursor() {
        // 隐藏光标，只显示文字
        if (this.cursor) {
            this.cursor.style.opacity = '0';
        }
    }
}

// 页面加载完成后初始化打字机效果
document.addEventListener('DOMContentLoaded', function() {
    new TypewriterEffect();
});
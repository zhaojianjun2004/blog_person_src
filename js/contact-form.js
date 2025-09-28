// 联系表单功能
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.submitButton = this.form?.querySelector('button[type="submit"]');
        
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        console.log('📧 联系表单功能初始化完成');
    }
    
    async handleSubmit() {
        const formData = new FormData(this.form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };
        
        // 显示提交状态
        this.setSubmitState(true);
        
        try {
            // 模拟提交过程
            await this.simulateSubmit(data);
            this.showSuccess();
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setSubmitState(false);
        }
    }
    
    async simulateSubmit(data) {
        // 模拟API调用
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log('表单数据:', data);
                
                // 模拟成功或失败
                if (Math.random() > 0.1) { // 90% 成功率
                    resolve('Success');
                } else {
                    reject(new Error('Network error occurred'));
                }
            }, 2000);
        });
    }
    
    setSubmitState(isSubmitting) {
        if (this.submitButton) {
            this.submitButton.disabled = isSubmitting;
            this.submitButton.textContent = isSubmitting ? 'Sending...' : 'Send Message';
        }
    }
    
    showSuccess() {
        this.showMessage('Message sent successfully! I will get back to you soon.', 'success');
        this.form.reset();
    }
    
    showError(message) {
        this.showMessage(`Failed to send message: ${message}`, 'error');
    }
    
    showMessage(text, type) {
        // 移除现有消息
        const existingMessage = this.form.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // 创建新消息
        const messageEl = document.createElement('div');
        messageEl.className = `form-message ${type}`;
        messageEl.textContent = text;
        
        // 添加样式
        messageEl.style.cssText = `
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
            text-align: center;
            font-weight: 500;
            background: ${type === 'success' ? 'rgba(0, 255, 153, 0.1)' : 'rgba(255, 69, 0, 0.1)'};
            color: ${type === 'success' ? '#00ff99' : '#ff4500'};
            border: 1px solid ${type === 'success' ? 'rgba(0, 255, 153, 0.3)' : 'rgba(255, 69, 0, 0.3)'};
        `;
        
        this.form.appendChild(messageEl);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 5000);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    new ContactForm();
});
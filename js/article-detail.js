// 文章详情页功能
class ArticleDetailManager {
    constructor() {
        this.article = null;
        this.slug = this.getSlugFromURL();
        
        this.init();
    }
    
    getSlugFromURL() {
        const path = window.location.pathname;
        const segments = path.split('/');
        return segments[segments.length - 1];
    }
    
    async init() {
        if (!this.slug) {
            this.showError();
            return;
        }
        
        try {
            await this.loadArticle();
            this.renderArticle();
            this.setupInteractions();
            this.generateTableOfContents();
            this.setupBackToTop();
            this.highlightCode();
        } catch (error) {
            console.error('❌ 加载文章失败:', error);
            this.showError();
        }
    }
    
    async loadArticle() {
        const response = await fetch(`/api/articles/${this.slug}`);
        if (!response.ok) {
            throw new Error('文章未找到');
        }
        this.article = await response.json();
        console.log('✅ 文章加载成功:', this.article.title);
    }
    
    renderArticle() {
        // 更新面包屑
        document.getElementById('breadcrumbTitle').textContent = this.article.title;
        
        // 更新文章头部
        document.getElementById('articleTitle').textContent = this.article.title;
        document.getElementById('articleExcerpt').textContent = this.article.excerpt;
        
        // 添加文章信息（创建时间、更新时间、字数、阅读时长）
        this.renderArticleInfo();
        
        // 更新分类
        document.getElementById('articleCategory').textContent = this.getCategoryDisplayName(this.article.category);
        
        // 更新标签
        const tagsContainer = document.getElementById('articleTags');
        if (this.article.tags && this.article.tags.length > 0) {
            tagsContainer.innerHTML = this.article.tags
                .map(tag => `<span class="tag">#${tag}</span>`)
                .join('');
        }
        
        // 更新文章内容
        document.getElementById('articleBody').innerHTML = this.article.htmlContent;
        
        // 更新页面标题
        document.title = `${this.article.title} - CaiCaiXiong`;
        
        // 显示文章内容
        document.getElementById('articleLoading').style.display = 'none';
        document.getElementById('articleContent').style.display = 'block';
    }
    
    getCategoryDisplayName(category) {
        const categoryMap = {
            'java': 'Java',
            'spring': 'Spring',
            'database': 'Database',
            'uncategorized': '未分类'
        };
        return categoryMap[category] || category;
    }
    
    renderArticleInfo() {
        const infoSection = document.querySelector('.article-info-section');
        if (!infoSection) return;
        
        const wordCount = this.calculateWordCount(this.article.content);
        const readTime = this.calculateReadTime(this.article.content);
        const createdTime = this.formatDate(this.article.date);
        const updatedTime = this.article.updated ? this.formatDate(this.article.updated) : createdTime;
        
        infoSection.innerHTML = `
            <div class="article-info">
                <div class="article-info-item article-created-time">创建时间: ${createdTime}</div>
                <div class="article-info-item article-updated-time">更新时间: ${updatedTime}</div>
                <div class="article-info-item article-word-count">全文字数: ${wordCount} 字</div>
                <div class="article-info-item article-read-time">阅读时长: ${readTime}</div>
            </div>
        `;
    }
    
    calculateWordCount(content) {
        // 移除 HTML 标签和 markdown 语法，计算中文字符数
        const textContent = content.replace(/<[^>]*>/g, '')
                                  .replace(/```[\s\S]*?```/g, '')
                                  .replace(/`[^`]*`/g, '')
                                  .replace(/[#*_\-\[\]()]/g, '');
        
        // 计算中文字符数（包括中文标点）
        const chineseChars = (textContent.match(/[\u4e00-\u9fa5\u3000-\u303f]/g) || []).length;
        // 计算英文单词数
        const englishWords = (textContent.match(/[a-zA-Z]+/g) || []).length;
        
        return chineseChars + englishWords;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    calculateReadTime(content) {
        const wordsPerMinute = 200;
        const words = content.split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return `${minutes} 分钟阅读`;
    }
    
    generateTableOfContents() {
        const headings = document.querySelectorAll('#articleBody h1, #articleBody h2, #articleBody h3, #articleBody h4');
        const tocList = document.getElementById('tocList');
        const tocContainer = document.getElementById('tableOfContents');
        
        if (headings.length === 0) {
            tocContainer.style.display = 'none';
            return;
        }
        
        tocList.innerHTML = '';
        
        headings.forEach((heading, index) => {
            const id = `heading-${index}`;
            heading.id = id;
            
            const li = document.createElement('li');
            li.style.paddingLeft = `${(parseInt(heading.tagName.substring(1)) - 1) * 1}rem`;
            
            const a = document.createElement('a');
            a.href = `#${id}`;
            a.textContent = heading.textContent;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                heading.scrollIntoView({ behavior: 'smooth' });
            });
            
            li.appendChild(a);
            tocList.appendChild(li);
        });
        
        // 滚动监听，高亮当前章节
        this.setupTOCHighlight();
    }
    
    setupTOCHighlight() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        document.querySelectorAll('#tocList a').forEach(link => {
                            link.classList.remove('active');
                        });
                        const activeLink = document.querySelector(`#tocList a[href="#${id}"]`);
                        if (activeLink) {
                            activeLink.classList.add('active');
                        }
                    }
                });
            },
            { rootMargin: '-100px 0px -50% 0px' }
        );
        
        document.querySelectorAll('#articleBody h1, #articleBody h2, #articleBody h3, #articleBody h4').forEach(heading => {
            observer.observe(heading);
        });
    }
    
    setupInteractions() {
        // 分享按钮 - 复制链接
        const shareBtn = document.getElementById('shareBtn');
        shareBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(window.location.href);
                // 显示成功提示
                this.showToast('链接复制成功！', 'success');
            } catch (err) {
                console.error('复制失败:', err);
                // 降级处理
                const textArea = document.createElement('textarea');
                textArea.value = window.location.href;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    this.showToast('链接复制成功！', 'success');
                } catch (fallbackErr) {
                    this.showToast('复制失败，请手动复制链接', 'error');
                }
                document.body.removeChild(textArea);
            }
        });
        
        // 点赞按钮
        const likeBtn = document.getElementById('likeBtn');
        let isLiked = localStorage.getItem(`liked-${this.slug}`) === 'true';
        let likeCount = parseInt(localStorage.getItem(`likes-${this.slug}`) || '0');
        
        this.updateLikeButton(likeBtn, isLiked, likeCount);
        
        likeBtn.addEventListener('click', () => {
            isLiked = !isLiked;
            likeCount += isLiked ? 1 : -1;
            
            localStorage.setItem(`liked-${this.slug}`, isLiked);
            localStorage.setItem(`likes-${this.slug}`, likeCount);
            
            this.updateLikeButton(likeBtn, isLiked, likeCount);
        });
    }
    
    updateLikeButton(button, isLiked, count) {
        button.classList.toggle('liked', isLiked);
        button.querySelector('.like-count').textContent = count;
        button.querySelector('.icon').textContent = isLiked ? '💖' : '❤️';
    }
    
    setupBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
        
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    showToast(message, type = 'success') {
        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // 添加样式
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: type === 'success' ? '#10b981' : '#ef4444',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            zIndex: '9999',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateY(-20px)',
            opacity: '0',
            transition: 'all 0.3s ease'
        });
        
        document.body.appendChild(toast);
        
        // 显示动画
        setTimeout(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        }, 100);
        
        // 3秒后移除
        setTimeout(() => {
            toast.style.transform = 'translateY(-20px)';
            toast.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    highlightCode() {
        // 如果hljs可用，高亮代码
        if (typeof hljs !== 'undefined') {
            document.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
        }
    }
    
    showError() {
        document.getElementById('articleLoading').style.display = 'none';
        document.getElementById('articleError').style.display = 'block';
        document.title = '文章未找到 - CaiCaiXiong';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    new ArticleDetailManager();
});
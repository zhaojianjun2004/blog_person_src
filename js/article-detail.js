// 文章详情页功能
class ArticleDetailManager {
    constructor() {
        this.article = null;
        this.slug = this.getSlugFromURL();
        
        this.init();
    }
    
    getSlugFromURL() {
        // 尝试从路径获取slug: /articles/slug-name
        const path = window.location.pathname;
        const segments = path.split('/').filter(segment => segment);
        
        // 如果路径是 /articles/slug-name 格式
        if (segments.length >= 2 && segments[0] === 'articles') {
            return segments[1];
        }
        
        // 如果路径是 /slug-name.html 格式
        if (segments.length >= 1) {
            const lastSegment = segments[segments.length - 1];
            // 移除.html后缀如果存在
            return lastSegment.replace(/\.html$/, '');
        }
        
        // 尝试从查询参数获取: ?article=slug-name
        const urlParams = new URLSearchParams(window.location.search);
        const articleParam = urlParams.get('article');
        if (articleParam) {
            return articleParam.replace(/\.md$/, ''); // 移除.md后缀如果存在
        }
        
        return null;
    }
    
    async init() {
        if (!this.slug) {
            this.showError();
            return;
        }

        try {
            // 首先加载文章内容
            await this.loadArticle();
            this.renderArticle();
            
            // 使用 requestIdleCallback 延迟执行非关键功能
            this.scheduleNonCriticalTasks();
            
        } catch (error) {
            console.error('❌ 加载文章失败:', error);
            this.showError();
        }
    }
    
    scheduleNonCriticalTasks() {
        // 使用 requestIdleCallback 或 setTimeout 延迟执行
        const scheduleTask = (task, delay = 0) => {
            if (window.requestIdleCallback) {
                requestIdleCallback(task, { timeout: 1000 });
            } else {
                setTimeout(task, delay);
            }
        };
        
        // 分批执行任务，减少阻塞
        scheduleTask(() => this.setupInteractions(), 100);
        scheduleTask(() => this.generateTableOfContents(), 200);
        scheduleTask(() => this.generateLatestArticles(), 300);
        scheduleTask(() => this.setupBackToTop(), 400);
        scheduleTask(() => this.highlightCode(), 500);
        scheduleTask(() => this.initImageViewer(), 600);
    }    async loadArticle() {
        // 检查缓存
        const cacheKey = `article_${this.slug}`;
        if (window.cacheManager && window.cacheManager.has(cacheKey)) {
            this.article = window.cacheManager.get(cacheKey);
            console.log('✅ 从缓存加载文章:', this.article.title);
            return;
        }
        
        const response = await fetch(`/api/articles/${this.slug}`);
        if (!response.ok) {
            throw new Error('文章未找到');
        }
        this.article = await response.json();
        
        // 存入缓存
        if (window.cacheManager) {
            window.cacheManager.set(cacheKey, this.article);
        }
        
        console.log('✅ 文章加载成功:', this.article.title);
    }
    
    renderArticle() {
        // 优先渲染关键内容，提升感知性能
        
        // 1. 首先更新页面标题和面包屑（最重要）
        document.title = `${this.article.title} - CaiCaiXiong`;
        document.getElementById('breadcrumbTitle').textContent = this.article.title;
        
        // 2. 更新文章头部信息（用户最先看到的内容）
        document.getElementById('articleTitle').textContent = this.article.title;
        document.getElementById('articleExcerpt').textContent = this.article.excerpt;
        
        // 3. 立即显示文章内容区域（提升感知速度）
        document.getElementById('articleLoading').style.display = 'none';
        document.getElementById('articleContent').style.display = 'block';
        
        // 4. 使用 requestAnimationFrame 异步填充其他内容
        requestAnimationFrame(() => {
            // 填充文章正文
            document.getElementById('articleBody').innerHTML = this.article.htmlContent;
            
            // 填充其他信息
            this.renderArticleInfo();
            document.getElementById('articleCategory').textContent = this.getCategoryDisplayName(this.article.category);
            
            // 填充标签
            const tagsContainer = document.getElementById('articleTags');
            if (this.article.tags && this.article.tags.length > 0) {
                tagsContainer.innerHTML = this.article.tags
                    .map(tag => `<span class="tag">#${tag}</span>`)
                    .join('');
            }
            
            // 处理表格，添加横向滚动支持
            this.setupTableScrolling();
        });
    }
    
    getCategoryDisplayName(category) {
        const categoryMap = {
            'java': 'Java',
            'spring': 'Spring',
            'database': 'Database',
            'daily': 'daily',
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
        return `${minutes} 分钟`;
    }
    
    setupTableScrolling() {
        // 为所有表格添加滚动容器
        const tables = document.querySelectorAll('#articleBody table');
        tables.forEach(table => {
            // 检查表格是否已经被包装
            if (!table.parentElement.classList.contains('table-container')) {
                const container = document.createElement('div');
                container.className = 'table-container';
                
                // 将表格移动到容器中
                table.parentNode.insertBefore(container, table);
                container.appendChild(table);
                
                console.log('✅ 为表格添加横向滚动支持');
            }
        });
    }
    
    generateTableOfContents() {
        const headings = document.querySelectorAll('#articleBody h1, #articleBody h2, #articleBody h3, #articleBody h4');
        const tocList = document.getElementById('tocList');
        const tocContainer = document.getElementById('tableOfContents');
        
        // 生成左侧目录
        this.generateLeftTOC(headings);
        
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
    
    generateLeftTOC(headings) {
        const leftTocList = document.getElementById('leftTocList');
        const leftTocContainer = document.getElementById('articleLeftToc');
        
        if (headings.length === 0) {
            leftTocContainer.style.display = 'none';
            return;
        }
        
        leftTocList.innerHTML = '';
        
        headings.forEach((heading, index) => {
            const id = `heading-${index}`;
            if (!heading.id) {
                heading.id = id;
            }
            
            const li = document.createElement('li');
            li.className = 'left-toc-item';
            
            const a = document.createElement('a');
            a.href = `#${id}`;
            a.textContent = heading.textContent;
            a.className = `left-toc-link level-${heading.tagName.substring(1)}`;
            
            a.addEventListener('click', (e) => {
                e.preventDefault();
                heading.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            });
            
            li.appendChild(a);
            leftTocList.appendChild(li);
        });
        
        // 显示左侧目录
        leftTocContainer.classList.add('show');
    }
    
    async generateLatestArticles() {
        const listEl = document.getElementById('latestArticlesList');
        const containerEl = document.getElementById('latestArticlesSidebar');

        if (!listEl || !containerEl) return;

        try {
            // 检查缓存
            const cacheKey = 'latest_articles_10';
            let articles;
            
            if (window.cacheManager && window.cacheManager.has(cacheKey)) {
                articles = window.cacheManager.get(cacheKey);
                console.log('✅ 从缓存加载最新文章列表');
            } else {
                // 获取全部文章并取最新的10篇
                const resp = await fetch('/api/articles?limit=10&page=1');
                if (!resp.ok) throw new Error('Failed to fetch latest articles');
                const data = await resp.json();
                articles = data.articles || [];
                
                // 存入缓存
                if (window.cacheManager) {
                    window.cacheManager.set(cacheKey, articles);
                }
            }
            
            // 过滤掉当前文章
            const filteredArticles = articles.filter(a => a.slug !== this.slug);

            if (!filteredArticles.length) {
                containerEl.style.display = 'none';
                return;
            }

            // 使用DocumentFragment提高性能
            const fragment = document.createDocumentFragment();
            filteredArticles.slice(0, 10).forEach(article => {
                const li = document.createElement('li');
                li.className = 'latest-articles-item';

                const a = document.createElement('a');
                a.href = `/articles/${article.slug}`;
                a.textContent = article.title;
                a.className = 'latest-articles-link';
                a.title = article.title;

                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = a.href;
                });

                li.appendChild(a);
                fragment.appendChild(li);
            });

            // 一次性更新DOM
            listEl.innerHTML = '';
            listEl.appendChild(fragment);

            // 显示右侧最新文章栏
            containerEl.classList.add('show');
        } catch (error) {
            console.error('Failed to load latest articles:', error);
            const containerEl = document.getElementById('latestArticlesSidebar');
            if (containerEl) containerEl.style.display = 'none';
        }
    }
    
    setupTOCHighlight() {
        // 缓存DOM元素，避免重复查询
        const tocLinks = document.querySelectorAll('#tocList a');
        const leftTocLinks = document.querySelectorAll('.left-toc-link');
        
        // 如果没有目录链接，直接返回
        if (tocLinks.length === 0 && leftTocLinks.length === 0) return;
        
        let currentActiveId = null;
        let updateTimeout = null;
        
        const observer = new IntersectionObserver(
            (entries) => {
                // 只处理进入视口的元素
                const intersectingEntries = entries.filter(entry => entry.isIntersecting);
                if (intersectingEntries.length === 0) return;
                
                // 获取第一个进入视口的元素
                const entry = intersectingEntries[0];
                const id = entry.target.id;
                
                // 避免重复更新相同的元素
                if (currentActiveId === id) return;
                currentActiveId = id;
                
                // 防抖更新，避免频繁操作
                if (updateTimeout) {
                    clearTimeout(updateTimeout);
                }
                
                updateTimeout = setTimeout(() => {
                    // 使用更高效的方式更新高亮状态
                    const activeSelector = `[href="#${id}"]`;
                    
                    // 批量移除高亮
                    tocLinks.forEach(link => link.classList.remove('active'));
                    leftTocLinks.forEach(link => link.classList.remove('active'));
                    
                    // 添加新的高亮
                    const activeLink = document.querySelector(`#tocList a${activeSelector}`);
                    const leftActiveLink = document.querySelector(`.left-toc-link${activeSelector}`);
                    
                    if (activeLink) activeLink.classList.add('active');
                    if (leftActiveLink) leftActiveLink.classList.add('active');
                }, 50); // 50ms防抖
            },
            { 
                rootMargin: '-100px 0px -50% 0px',
                threshold: 0.1
            }
        );
        
        const headings = document.querySelectorAll('#articleBody h1, #articleBody h2, #articleBody h3, #articleBody h4');
        if (headings.length > 0) {
            headings.forEach(heading => {
                observer.observe(heading);
            });
        }
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
        let scrollTimeout = null;
        
        // 节流滚动事件监听
        const handleScroll = () => {
            if (scrollTimeout) return;
            
            scrollTimeout = setTimeout(() => {
                if (window.scrollY > 300) {
                    backToTopBtn.classList.add('show');
                } else {
                    backToTopBtn.classList.remove('show');
                }
                scrollTimeout = null;
            }, 100); // 100ms节流
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        
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
    
    // 简化的图片查看器功能（优化版）
    initImageViewer() {
        // 创建简单的图片查看器模态框
        if (document.querySelector('.image-viewer-modal')) return; // 避免重复创建
        
        const modal = document.createElement('div');
        modal.className = 'image-viewer-modal';
        modal.innerHTML = `
            <span class="image-viewer-close">&times;</span>
            <img class="image-viewer-content" src="" alt="">
        `;
        document.body.appendChild(modal);
        
        // 使用事件委托，减少事件监听器数量
        const articleBody = document.querySelector('.article-body');
        if (articleBody) {
            articleBody.addEventListener('click', (e) => {
                if (e.target.tagName === 'IMG') {
                    const modalImg = modal.querySelector('.image-viewer-content');
                    modal.classList.add('show');
                    modalImg.src = e.target.src;
                    modalImg.alt = e.target.alt;
                    document.body.style.overflow = 'hidden';
                }
            });
        }
        
        // 统一的关闭事件处理
        const closeModal = () => {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        };
        
        // 点击模态框关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal || 
                e.target.classList.contains('image-viewer-close') ||
                e.target.classList.contains('image-viewer-content')) {
                closeModal();
            }
        });
        
        // ESC键关闭（仅在模态框显示时监听）
        const handleEscape = (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                closeModal();
            }
        };
        
        // 动态添加/移除ESC监听器
        modal.addEventListener('transitionend', () => {
            if (modal.classList.contains('show')) {
                document.addEventListener('keydown', handleEscape);
            } else {
                document.removeEventListener('keydown', handleEscape);
            }
        });
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
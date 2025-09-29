// 改进的文章目录导航系统
class ArticleTocNavigator {
    constructor() {
        this.tocSidebar = null;
        this.tocList = null;
        this.immersiveBtn = null;
        this.isImmersive = false;
        this.currentActiveItem = null;
        this.observer = null;
        this.headings = [];
        
        this.init();
    }
    
    init() {
        this.createTocSidebar();
        this.createImmersiveButton();
        this.generateToc();
        this.bindEvents();
        this.setupScrollSpy();
        console.log('📖 改进的文章目录导航初始化完成');
    }
    
    createTocSidebar() {
        // 创建右侧固定目录侧边栏
        this.tocSidebar = document.createElement('div');
        this.tocSidebar.id = 'article-toc-sidebar';
        this.tocSidebar.className = 'article-toc-sidebar';
        this.tocSidebar.innerHTML = `
            <div class="toc-sidebar-header">
                <h3 class="toc-sidebar-title">
                    <span class="toc-icon">📖</span>
                    文章目录
                </h3>
                <div class="toc-progress-bar">
                    <div class="toc-progress-fill" id="tocProgressFill"></div>
                </div>
            </div>
            <nav class="toc-sidebar-nav" id="tocSidebarNav">
                <ul class="toc-sidebar-list" id="tocSidebarList"></ul>
            </nav>
            <div class="toc-sidebar-footer">
                <div class="reading-time" id="readingTime">
                    <span class="time-icon">⏱️</span>
                    <span class="time-text">预计阅读时间：5分钟</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.tocSidebar);
        this.tocList = document.getElementById('tocSidebarList');
    }
    
    createImmersiveButton() {
        // 创建沉浸式阅读按钮
        this.immersiveBtn = document.createElement('button');
        this.immersiveBtn.id = 'immersiveToggle';
        this.immersiveBtn.className = 'immersive-toggle-btn';
        this.immersiveBtn.innerHTML = `
            <span class="immersive-icon">🎯</span>
            <span class="immersive-text">沉浸阅读</span>
        `;
        this.immersiveBtn.title = '切换沉浸式阅读模式';
        
        document.body.appendChild(this.immersiveBtn);
    }
    
    generateToc() {
        const articleBody = document.getElementById('articleBody') || document.querySelector('.article-content');
        if (!articleBody) return;
        
        // 获取所有标题元素
        this.headings = Array.from(articleBody.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        
        if (this.headings.length === 0) {
            this.tocSidebar.style.display = 'none';
            return;
        }
        
        // 生成目录HTML
        let tocHTML = '';
        let currentLevel = 1;
        
        this.headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            const text = heading.textContent.trim();
            const id = `heading-${index}`;
            
            // 为标题添加ID，方便跳转
            if (!heading.id) {
                heading.id = id;
            }
            
            // 计算缩进级别
            const indent = Math.max(0, level - 2); // h2为基础级别
            
            tocHTML += `
                <li class="toc-item toc-level-${level}" data-level="${level}">
                    <a href="#${heading.id}" 
                       class="toc-link" 
                       data-target="${heading.id}"
                       style="padding-left: ${indent * 16}px;">
                        <span class="toc-bullet">•</span>
                        <span class="toc-title-text">${text}</span>
                    </a>
                </li>
            `;
        });
        
        this.tocList.innerHTML = tocHTML;
        this.calculateReadingTime();
    }
    
    calculateReadingTime() {
        const articleBody = document.getElementById('articleBody') || document.querySelector('.article-content');
        if (!articleBody) return;
        
        const text = articleBody.textContent || '';
        const wordsCount = text.trim().split(/\s+/).length;
        const readingTime = Math.ceil(wordsCount / 200); // 假设每分钟200词
        
        const readingTimeElement = document.getElementById('readingTime');
        if (readingTimeElement) {
            readingTimeElement.querySelector('.time-text').textContent = `预计阅读时间：${readingTime}分钟`;
        }
    }
    
    setupScrollSpy() {
        // 设置滚动监听，高亮当前章节
        const options = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                const tocLink = this.tocList.querySelector(`[data-target="${id}"]`);
                
                if (entry.isIntersecting) {
                    // 移除之前的活跃状态
                    if (this.currentActiveItem) {
                        this.currentActiveItem.classList.remove('active');
                    }
                    
                    // 设置新的活跃状态
                    if (tocLink) {
                        tocLink.classList.add('active');
                        this.currentActiveItem = tocLink;
                        
                        // 滚动目录到可见区域
                        tocLink.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest'
                        });
                    }
                    
                    // 更新进度条
                    this.updateReadingProgress();
                }
            });
        }, options);
        
        // 观察所有标题元素
        this.headings.forEach(heading => {
            this.observer.observe(heading);
        });
    }
    
    updateReadingProgress() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.min(scrollTop / scrollHeight * 100, 100);
        
        const progressFill = document.getElementById('tocProgressFill');
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
    }
    
    bindEvents() {
        // 目录链接点击事件
        this.tocList.addEventListener('click', (e) => {
            e.preventDefault();
            const link = e.target.closest('.toc-link');
            if (!link) return;
            
            const targetId = link.dataset.target;
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                // 平滑滚动到目标位置
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // 添加点击动画效果
                link.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    link.style.transform = '';
                }, 150);
            }
        });
        
        // 沉浸式阅读按钮事件
        this.immersiveBtn.addEventListener('click', () => {
            this.toggleImmersiveMode();
        });
        
        // 滚动更新进度条
        window.addEventListener('scroll', () => {
            this.updateReadingProgress();
        });
        
        // 响应式处理
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // 键盘快捷键支持
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isImmersive) {
                this.toggleImmersiveMode();
            }
            
            // 目录导航快捷键 (Ctrl + ↑/↓)
            if (e.ctrlKey && !this.isImmersive) {
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.navigateToAdjacentHeading(-1);
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.navigateToAdjacentHeading(1);
                }
            }
            
            // 切换目录显示 (Ctrl + T)
            if (e.ctrlKey && e.key === 't') {
                e.preventDefault();
                this.toggleTocVisibility();
            }
            
            // 切换沉浸模式 (F11 或 Ctrl + I)
            if (e.key === 'F11' || (e.ctrlKey && e.key === 'i')) {
                e.preventDefault();
                this.toggleImmersiveMode();
            }
        });
    }
    
    // 导航到相邻的标题
    navigateToAdjacentHeading(direction) {
        if (!this.currentActiveItem) return;
        
        const currentIndex = this.headings.findIndex(h => h.id === this.currentActiveItem.dataset.target);
        const nextIndex = currentIndex + direction;
        
        if (nextIndex >= 0 && nextIndex < this.headings.length) {
            this.scrollToHeading(nextIndex);
        }
    }
    
    // 切换目录可见性
    toggleTocVisibility() {
        const isVisible = this.tocSidebar.style.display !== 'none';
        this.tocSidebar.style.display = isVisible ? 'none' : 'block';
        
        // 添加提示信息
        this.showToast(isVisible ? '目录已隐藏' : '目录已显示');
    }
    
    // 显示提示信息
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toc-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--card-bg);
            color: var(--text-primary);
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            border: 1px solid var(--tech-border);
            z-index: 1000;
            animation: fadeInOut 2s ease-out forwards;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 2000);
    }
    }
    
    toggleImmersiveMode() {
        this.isImmersive = !this.isImmersive;
        document.body.classList.toggle('immersive-reading', this.isImmersive);
        
        // 更新按钮状态
        if (this.isImmersive) {
            this.immersiveBtn.innerHTML = `
                <span class="immersive-icon">👁️</span>
                <span class="immersive-text">退出沉浸</span>
            `;
            this.immersiveBtn.classList.add('active');
        } else {
            this.immersiveBtn.innerHTML = `
                <span class="immersive-icon">🎯</span>
                <span class="immersive-text">沉浸阅读</span>
            `;
            this.immersiveBtn.classList.remove('active');
        }
        
        // 触发自定义事件
        document.dispatchEvent(new CustomEvent('immersiveModeToggle', {
            detail: { isImmersive: this.isImmersive }
        }));
    }
    
    handleResize() {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            this.tocSidebar.classList.add('mobile-hidden');
        } else {
            this.tocSidebar.classList.remove('mobile-hidden');
        }
    }
    
    // 公共方法：显示/隐藏目录
    toggleToc(show) {
        if (this.tocSidebar) {
            this.tocSidebar.style.display = show ? 'block' : 'none';
        }
    }
    
    // 公共方法：跳转到指定标题
    scrollToHeading(index) {
        if (this.headings[index]) {
            this.headings[index].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        
        if (this.tocSidebar) {
            this.tocSidebar.remove();
        }
        
        if (this.immersiveBtn) {
            this.immersiveBtn.remove();
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 只在文章详情页初始化
    if (window.location.pathname.includes('article') || document.getElementById('articleBody')) {
        setTimeout(() => {
            window.articleTocNavigator = new ArticleTocNavigator();
        }, 500); // 延迟初始化，确保文章内容已加载
    }
});
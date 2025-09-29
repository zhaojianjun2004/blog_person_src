// Categories页面交互管理
class CategoriesPageManager {
    constructor() {
        this.categoriesContainer = document.querySelector('.categories-grid');
        this.categoryCards = [];
        this.searchInput = null;
        this.filterButtons = [];
        this.sortBy = 'name'; // 排序方式: name, count, recent
        this.isLoading = false;
        this.dynamicCategoriesManager = null; // 与现有系统集成
        
        this.init();
    }
    
    init() {
        this.waitForExistingManager();
        // 取消搜索和筛选功能
        // this.createSearchAndFilter();
        this.bindCategoryCardEvents();
        this.createSortingControls();
        this.updateCategoryStats();
        this.bindIntegrationEvents();
        console.log('📋 Categories页面管理器初始化完成');
    }
    
    // 等待现有的动态分类管理器加载完成
    waitForExistingManager() {
        const checkExisting = () => {
            if (window.DynamicCategoriesManager) {
                // 如果存在现有管理器，进行集成
                console.log('🔗 发现现有分类管理器，进行集成');
                this.integrateWithExisting();
            } else {
                setTimeout(checkExisting, 100);
            }
        };
        checkExisting();
    }
    
    integrateWithExisting() {
        // 与现有的动态分类管理器集成
        // 这里可以添加集成逻辑
    }
    
    bindIntegrationEvents() {
        // 监听分类数据加载完成事件
        document.addEventListener('categoriesLoaded', () => {
            setTimeout(() => {
                this.updateCategoryStats();
                this.bindCategoryCardEvents();
            }, 500);
        });
        
        // 监听标签云加载完成事件
        document.addEventListener('tagsLoaded', () => {
            setTimeout(() => {
                this.enhanceTagCloud();
                this.updateCategoryStats(); // 标签加载完成后重新更新统计
            }, 300);
        });
        
        // 监听DOM变化，自动更新统计
        const observer = new MutationObserver(() => {
            // 防抖处理，避免频繁更新
            clearTimeout(this.updateTimeout);
            this.updateTimeout = setTimeout(() => {
                this.updateCategoryStats();
            }, 1000);
        });
        
        if (this.categoriesContainer) {
            observer.observe(this.categoriesContainer, {
                childList: true,
                subtree: true
            });
        }
    }
    
    enhanceTagCloud() {
        const tagCloudItems = document.querySelectorAll('.tag-cloud-item');
        tagCloudItems.forEach((item, index) => {
            // 添加延迟动画
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.add('tag-fade-in');
            
            // 增强点击效果
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // 添加点击动画
                item.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    item.style.transform = '';
                    // 执行原有的跳转逻辑
                    if (item.onclick) {
                        item.onclick();
                    }
                }, 150);
            });
        });
    }
    
    createSearchAndFilter() {
        const pageHeader = document.querySelector('.page-header');
        if (!pageHeader) return;
        
        // 只创建筛选和排序控件，不包含搜索栏
        const controlsHTML = `
            <div class="categories-controls">
                <div class="filter-buttons">
                    <button class="filter-btn active" data-filter="all">全部</button>
                    <button class="filter-btn" data-filter="popular">热门</button>
                    <button class="filter-btn" data-filter="recent">最新</button>
                </div>
                <div class="sort-dropdown">
                    <select id="sortCategories" class="sort-select">
                        <option value="name">按名称排序</option>
                        <option value="count">按文章数排序</option>
                        <option value="recent">按最新更新</option>
                    </select>
                </div>
            </div>
        `;
        
        pageHeader.insertAdjacentHTML('afterend', controlsHTML);
        this.bindControlEvents();
    }
    
    bindControlEvents() {
        // 移除搜索功能，只保留筛选和排序
        
        // 筛选按钮
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveFilter(e.target);
                this.applyFilter(e.target.dataset.filter);
            });
        });
        
        // 排序下拉框
        const sortSelect = document.getElementById('sortCategories');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortCategories(e.target.value);
            });
        }
    }
    
    bindCategoryCardEvents() {
        if (!this.categoriesContainer) return;
        
        // 为每个分类卡片添加交互事件
        const categoryCards = this.categoriesContainer.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            // 悬停效果
            card.addEventListener('mouseenter', this.onCardHover.bind(this));
            card.addEventListener('mouseleave', this.onCardLeave.bind(this));
            
            // 点击效果
            card.addEventListener('click', this.onCardClick.bind(this));
            
            // 标签点击阻止冒泡
            const tags = card.querySelectorAll('.mini-tag');
            tags.forEach(tag => {
                tag.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.onTagClick(tag.textContent);
                });
            });
        });
    }
    
    onCardHover(e) {
        const card = e.currentTarget;
        card.classList.add('card-hover');
        
        // 添加渐入动画效果
        const icon = card.querySelector('.category-icon');
        const tags = card.querySelectorAll('.mini-tag');
        
        if (icon) {
            icon.style.transform = 'scale(1.1) rotateY(10deg)';
        }
        
        tags.forEach((tag, index) => {
            setTimeout(() => {
                tag.style.transform = 'translateY(-2px)';
                tag.style.boxShadow = '0 4px 12px rgba(0, 255, 255, 0.3)';
            }, index * 50);
        });
    }
    
    onCardLeave(e) {
        const card = e.currentTarget;
        card.classList.remove('card-hover');
        
        // 恢复动画效果
        const icon = card.querySelector('.category-icon');
        const tags = card.querySelectorAll('.mini-tag');
        
        if (icon) {
            icon.style.transform = '';
        }
        
        tags.forEach(tag => {
            tag.style.transform = '';
            tag.style.boxShadow = '';
        });
    }
    
    onCardClick(e) {
        const card = e.currentTarget;
        const category = card.dataset.category;
        
        // 添加点击动画
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);
        
        // 跳转到分类页面
        if (category) {
            window.location.href = `/articles?category=${category}`;
        }
    }
    
    onTagClick(tagName) {
        // 添加标签点击动画效果
        const event = new CustomEvent('tagClick', { detail: { tag: tagName } });
        document.dispatchEvent(event);
        
        setTimeout(() => {
            window.location.href = `/articles?tag=${encodeURIComponent(tagName)}`;
        }, 200);
    }
    
    filterCategories(searchTerm) {
        const categoryCards = this.categoriesContainer.querySelectorAll('.category-card');
        const normalizedSearch = searchTerm.toLowerCase().trim();
        
        let visibleCount = 0;
        categoryCards.forEach(card => {
            const title = card.querySelector('.category-title')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.category-description')?.textContent.toLowerCase() || '';
            const tags = Array.from(card.querySelectorAll('.mini-tag')).map(tag => tag.textContent.toLowerCase());
            
            const isVisible = title.includes(normalizedSearch) || 
                            description.includes(normalizedSearch) ||
                            tags.some(tag => tag.includes(normalizedSearch));
            
            if (isVisible) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.3s ease-out';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        this.updateSearchResults(visibleCount, searchTerm);
    }
    
    updateSearchResults(count, searchTerm) {
        // 更新搜索结果提示
        let resultsIndicator = document.querySelector('.search-results-indicator');
        if (!resultsIndicator) {
            resultsIndicator = document.createElement('div');
            resultsIndicator.className = 'search-results-indicator';
            document.querySelector('.categories-controls').appendChild(resultsIndicator);
        }
        
        if (searchTerm) {
            resultsIndicator.textContent = `找到 ${count} 个相关分类`;
            resultsIndicator.style.display = 'block';
        } else {
            resultsIndicator.style.display = 'none';
        }
    }
    
    setActiveFilter(activeBtn) {
        // 更新筛选按钮状态
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }
    
    applyFilter(filterType) {
        const categoryCards = this.categoriesContainer.querySelectorAll('.category-card');
        
        categoryCards.forEach(card => {
            let shouldShow = true;
            
            switch (filterType) {
                case 'popular':
                    const articleCount = parseInt(card.querySelector('.article-count')?.textContent.match(/\d+/)?.[0] || '0');
                    shouldShow = articleCount >= 3;
                    break;
                case 'recent':
                    // 模拟最近更新的分类（可以根据实际数据调整）
                    const recentCategories = ['java', 'spring', 'database'];
                    shouldShow = recentCategories.includes(card.dataset.category);
                    break;
                case 'all':
                default:
                    shouldShow = true;
                    break;
            }
            
            if (shouldShow) {
                card.style.display = 'block';
                card.style.animation = 'slideInDown 0.4s ease-out';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    sortCategories(sortType) {
        const categoryCards = Array.from(this.categoriesContainer.querySelectorAll('.category-card'));
        
        categoryCards.sort((a, b) => {
            switch (sortType) {
                case 'count':
                    const countA = parseInt(a.querySelector('.article-count')?.textContent.match(/\d+/)?.[0] || '0');
                    const countB = parseInt(b.querySelector('.article-count')?.textContent.match(/\d+/)?.[0] || '0');
                    return countB - countA;
                    
                case 'name':
                    const nameA = a.querySelector('.category-title')?.textContent || '';
                    const nameB = b.querySelector('.category-title')?.textContent || '';
                    return nameA.localeCompare(nameB);
                    
                case 'recent':
                    // 模拟最近更新排序（可以根据实际数据调整）
                    const recentOrder = ['java', 'spring', 'database', 'devops', 'architecture', 'tools'];
                    const indexA = recentOrder.indexOf(a.dataset.category) || 999;
                    const indexB = recentOrder.indexOf(b.dataset.category) || 999;
                    return indexA - indexB;
                    
                default:
                    return 0;
            }
        });
        
        // 重新排列DOM元素
        categoryCards.forEach((card, index) => {
            card.style.animation = `fadeInUp 0.3s ease-out ${index * 0.1}s both`;
            this.categoriesContainer.appendChild(card);
        });
    }
    
    updateCategoryStats() {
        // 更新分类统计信息并添加动画效果
        const categoryCards = document.querySelectorAll('.category-card:not([style*="display: none"])');
        const totalArticles = Array.from(categoryCards).reduce((sum, card) => {
            const count = parseInt(card.querySelector('.article-count')?.textContent.match(/\d+/)?.[0] || '0');
            return sum + count;
        }, 0);
        
        // 计算标签总数
        const allTags = new Set();
        categoryCards.forEach(card => {
            const tags = card.querySelectorAll('.mini-tag');
            tags.forEach(tag => {
                allTags.add(tag.textContent.trim());
            });
        });
        
        // 更新统计卡片并添加数字动画
        const statItems = document.querySelectorAll('.categories-stats .stat-item');
        if (statItems.length >= 3) {
            // 总文章数
            const totalArticlesElement = statItems[0].querySelector('.stat-number');
            if (totalArticlesElement) {
                this.animateNumber(totalArticlesElement, totalArticles);
            }
            
            // 分类数
            const categoriesElement = statItems[1].querySelector('.stat-number');
            if (categoriesElement) {
                this.animateNumber(categoriesElement, categoryCards.length);
            }
            
            // 标签数
            const tagsElement = statItems[2].querySelector('.stat-number');
            if (tagsElement) {
                // 检查是否有标签云中的标签
                const tagCloudItems = document.querySelectorAll('.tag-cloud-item');
                const tagCount = tagCloudItems.length > 0 ? tagCloudItems.length : allTags.size;
                this.animateNumber(tagsElement, tagCount);
            }
        }
        
        console.log(`📊 统计更新: ${totalArticles}篇文章, ${categoryCards.length}个分类, ${allTags.size}个标签`);
    }
    
    // 数字动画效果
    animateNumber(element, targetNumber) {
        const startNumber = 0;
        const duration = 1500; // 1.5秒
        const startTime = performance.now();
        
        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用easeOutCubic缓动函数
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const currentNumber = Math.floor(startNumber + (targetNumber - startNumber) * easeOutCubic);
            
            element.textContent = currentNumber;
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                element.textContent = targetNumber;
            }
        };
        
        requestAnimationFrame(updateNumber);
    }
    
    createSortingControls() {
        // 为分类卡片添加CSS样式类用于排序动画
        const style = document.createElement('style');
        style.textContent = `
            .category-card {
                transition: all 0.3s ease;
            }
            
            .card-hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 25px rgba(0, 255, 255, 0.2);
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes slideInDown {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .search-results-indicator {
                margin-top: 10px;
                padding: 5px 10px;
                background: rgba(0, 255, 255, 0.1);
                border: 1px solid rgba(0, 255, 255, 0.3);
                border-radius: 4px;
                font-size: 0.9rem;
                color: var(--text-secondary);
            }
        `;
        document.head.appendChild(style);
    }
    
    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 延迟初始化，确保其他脚本已加载
    setTimeout(() => {
        new CategoriesPageManager();
    }, 100);
});
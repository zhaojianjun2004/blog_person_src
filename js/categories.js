// 动态加载分类数据
async function loadCategoriesData() {
    try {
        // 获取分类统计
        const categoriesResponse = await fetch('/api/categories');
        const categories = await categoriesResponse.json();
        
        // 获取标签统计
        const tagsResponse = await fetch('/api/tags');
        const tagsData = await tagsResponse.json();
        
        // 获取博客统计
        const statsResponse = await fetch('/api/stats');
        const stats = await statsResponse.json();

        // 更新统计数据
        const statNumbers = document.querySelectorAll('.categories-stats .stat-number');
        if (statNumbers.length >= 3) {
            statNumbers[0].textContent = stats.totalArticles;
            statNumbers[1].textContent = stats.totalCategories;
            statNumbers[2].textContent = stats.totalTags;
        }

        // 更新分类卡片
        updateCategoriesGrid(categories);
        
        // 更新热门标签
        updatePopularTags(tagsData.popularTags);

        console.log('✅ 分类数据加载成功');
    } catch (error) {
        console.error('❌ 加载分类数据失败:', error);
    }
}

function updateCategoriesGrid(categories) {
    const categoriesGrid = document.querySelector('.categories-grid');
    if (!categoriesGrid) return;
    
    categoriesGrid.innerHTML = '';

    Object.entries(categories).forEach(([key, category]) => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.dataset.category = key;
        card.innerHTML = `
            <div class="category-icon">${category.icon}</div>
            <h3 class="category-title">${category.name}</h3>
            <p class="category-description">${category.description}</p>
            <div class="category-stats">
                <span class="article-count">${category.count} articles</span>
            </div>
        `;
        
        // 添加点击事件
        card.addEventListener('click', () => {
            window.location.href = `/articles?category=${encodeURIComponent(key)}`;
        });
        
        categoriesGrid.appendChild(card);
    });
}

function updatePopularTags(popularTags) {
    const tagsCloud = document.querySelector('.tags-cloud');
    if (!tagsCloud || !popularTags) return;
    
    tagsCloud.innerHTML = '';
    
    popularTags.forEach((tagData, index) => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag-cloud-item';
        tagElement.textContent = tagData.tag;
        
        // 根据使用频率设置字体大小
        const fontSize = Math.max(0.8, Math.min(1.4, 0.8 + tagData.count * 0.1));
        tagElement.style.fontSize = `${fontSize}em`;
        
        // 添加动画延迟
        tagElement.style.animationDelay = `${index * 0.1}s`;
        tagElement.classList.add('tag-fade-in');
        
        // 添加点击事件
        tagElement.addEventListener('click', () => {
            // 跳转到文章页面并搜索指定标签
            window.location.href = `/articles?search=${encodeURIComponent(tagData.tag)}`;
        });
        
        tagsCloud.appendChild(tagElement);
    });
}

// 分类页面交互功能
class CategoriesInteraction {
    constructor() {
        this.categoryCards = document.querySelectorAll('.category-card');
        this.tagCloudItems = document.querySelectorAll('.tag-cloud-item');
        
        this.init();
    }
    
    init() {
        // 分类卡片点击事件
        this.categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.goToArticlesWithCategory(category);
            });
        });
        
        // 标签云点击事件
        this.tagCloudItems.forEach(item => {
            item.addEventListener('click', () => {
                const tag = item.textContent.trim();
                this.goToArticlesWithTag(tag);
            });
        });
        
        console.log('📂 分类页面交互功能初始化完成');
    }
    
    goToArticlesWithCategory(category) {
        // 跳转到文章页面并筛选指定分类
        window.location.href = `/articles?category=${encodeURIComponent(category)}`;
    }
    
    goToArticlesWithTag(tag) {
        // 跳转到文章页面并搜索指定标签 - 使用tags参数避免无限加载
        window.location.href = `/articles?tags=${encodeURIComponent(tag)}`;
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    loadCategoriesData();
    new CategoriesInteraction();
});
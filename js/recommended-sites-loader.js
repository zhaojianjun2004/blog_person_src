// 推荐网站数据加载器
class RecommendedSitesLoader {
    constructor() {
        this.recommendedData = [];
        this.recommendedContainer = document.getElementById('recommendedGrid');
        this.init();
    }

    init() {
        this.loadRecommendedData();
    }

    // 加载推荐网站数据
    async loadRecommendedData() {
        try {
            // 尝试从本地JSON文件加载推荐网站数据
            const response = await fetch('/data/recommended-sites.json');
            if (response.ok) {
                this.recommendedData = await response.json();
            } else {
                // 如果文件不存在，使用默认示例数据
                this.recommendedData = this.getDefaultRecommended();
            }
            this.renderRecommended();
        } catch (error) {
            console.log('推荐网站数据文件未找到，使用默认数据');
            this.recommendedData = this.getDefaultRecommended();
            this.renderRecommended();
        }
    }

    // 获取默认示例推荐网站数据
    getDefaultRecommended() {
        return [
            {
                name: "GitHub",
                url: "https://github.com",
                avatar: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
                description: "全球最大的代码托管平台"
            },
            {
                name: "Stack Overflow",
                url: "https://stackoverflow.com",
                avatar: "https://cdn.sstatic.net/Sites/stackoverflow/Img/apple-touch-icon.png",
                description: "程序员问答社区"
            },
            {
                name: "MDN Web Docs",
                url: "https://developer.mozilla.org",
                avatar: "https://developer.mozilla.org/favicon-48x48.97046865.png",
                description: "Web开发文档"
            },
            {
                name: "LeetCode",
                url: "https://leetcode.com",
                avatar: "https://leetcode.com/favicon.ico",
                description: "算法练习平台"
            }
        ];
    }

    // 渲染推荐网站
    renderRecommended() {
        if (!this.recommendedContainer) {
            console.warn('推荐网站容器未找到');
            return;
        }

        this.recommendedContainer.innerHTML = '';
        this.recommendedData.forEach(site => {
            const siteItem = document.createElement('a');
            siteItem.className = 'recommended-link';
            siteItem.href = site.url;
            siteItem.target = '_blank';
            siteItem.innerHTML = `
                <img src="${site.avatar}" alt="${site.name}" class="recommended-avatar" />
                <div class="recommended-info">
                    <div class="recommended-name">${site.name}</div>
                    <div class="recommended-description-text">${site.description}</div>
                </div>
            `;
            this.recommendedContainer.appendChild(siteItem);
        });
    }

    // 添加新的推荐网站
    addRecommendedSite(site) {
        this.recommendedData.push(site);
        this.renderRecommended();
    }

    // 删除推荐网站
    removeRecommendedSite(index) {
        if (index >= 0 && index < this.recommendedData.length) {
            this.recommendedData.splice(index, 1);
            this.renderRecommended();
        }
    }

    // 获取所有推荐网站数据
    getRecommendedData() {
        return this.recommendedData;
    }
}

// 当DOM加载完成后初始化推荐网站加载器
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('recommendedGrid')) {
        window.recommendedSitesLoader = new RecommendedSitesLoader();
    }
});
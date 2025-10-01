// 优质博客数据加载器
class QualityBlogsLoader {
    constructor() {
        this.blogsData = [];
        this.blogsContainer = document.getElementById('blogsGrid');
        this.init();
    }

    init() {
        this.loadBlogsData();
    }

    // 加载优质博客数据
    async loadBlogsData() {
        try {
            // 尝试从本地JSON文件加载优质博客数据
            const response = await fetch('/data/quality-blogs.json');
            if (response.ok) {
                this.blogsData = await response.json();
            } else {
                // 如果文件不存在，使用默认示例数据
                this.blogsData = this.getDefaultBlogs();
            }
            this.renderBlogs();
        } catch (error) {
            console.log('优质博客数据文件未找到，使用默认数据');
            this.blogsData = this.getDefaultBlogs();
            this.renderBlogs();
        }
    }

    // 获取默认示例优质博客数据
    getDefaultBlogs() {
        return [
            {
                name: "阮一峰的网络日志",
                url: "https://www.ruanyifeng.com/blog/",
                avatar: "https://www.ruanyifeng.com/favicon.ico",
                description: "技术科普大师，每周科技爱好者周刊",
                category: "blog",
                tags: ["前端", "科技", "周刊"]
            },
            {
                name: "酷壳 CoolShell",
                url: "https://coolshell.cn/",
                avatar: "https://coolshell.cn/favicon.ico", 
                description: "陈皓的技术博客，深度技术文章",
                category: "blog",
                tags: ["技术", "深度", "思考"]
            }
        ];
    }

    // 渲染优质博客
    renderBlogs() {
        if (!this.blogsContainer) {
            console.warn('优质博客容器未找到');
            return;
        }

        this.blogsContainer.innerHTML = '';
        this.blogsData.forEach(blog => {
            const blogItem = document.createElement('a');
            blogItem.className = 'blog-link';
            blogItem.href = blog.url;
            blogItem.target = '_blank';
            
            // 生成标签HTML
            const tagsHtml = blog.tags ? 
                blog.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('') : '';
            
            blogItem.innerHTML = `
                <img src="${blog.avatar}" alt="${blog.name}" class="blog-avatar" />
                <div class="blog-info">
                    <div class="blog-name">${blog.name}</div>
                    <div class="blog-description-text">${blog.description}</div>
                    ${tagsHtml ? `<div class="blog-tags">${tagsHtml}</div>` : ''}
                </div>
            `;
            this.blogsContainer.appendChild(blogItem);
        });
    }

    // 添加新的优质博客
    addBlog(blog) {
        this.blogsData.push(blog);
        this.renderBlogs();
    }

    // 删除优质博客
    removeBlog(index) {
        if (index >= 0 && index < this.blogsData.length) {
            this.blogsData.splice(index, 1);
            this.renderBlogs();
        }
    }

    // 获取所有优质博客数据
    getBlogsData() {
        return this.blogsData;
    }
}

// 当DOM加载完成后初始化优质博客加载器
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('blogsGrid')) {
        window.qualityBlogsLoader = new QualityBlogsLoader();
    }
});
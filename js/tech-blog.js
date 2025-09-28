// 科技博客页面交互脚本

document.addEventListener('DOMContentLoaded', function() {
    console.log('Tech Blog JS Loaded');
    
    // 文章卡片加载动画
    const postCards = document.querySelectorAll('.post-card');
    postCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.5s ease-out ${index * 0.1}s`;
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100);
    });
    
    // 分类列表交互
    const categoryItems = document.querySelectorAll('.category-item a');
    categoryItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const count = this.querySelector('.category-count');
            if (count) {
                count.style.color = 'var(--tech-blog-primary)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const count = this.querySelector('.category-count');
            if (count) {
                count.style.color = 'var(--tech-blog-text-muted)';
            }
        });
    });
});
// 基础功能 - 解决加载动画和初始化
document.addEventListener('DOMContentLoaded', function() {
    // 隐藏加载屏幕 - 缩短时间避免闪烁
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }
    }, 300); // 缩短到300ms避免与页面渲染冲突
    
    // 初始化基础功能
    initializeBasicFeatures();
});

function initializeBasicFeatures() {
    // 品牌点击回首页功能
    const brandText = document.querySelector('.brand-text');
    if (brandText) {
        brandText.addEventListener('click', function() {
            window.location.href = '/';
        });
    }
    
    // 平滑滚动导航
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // 如果是页面内锚点
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // 更新活动导航项
                    navLinks.forEach(nl => nl.classList.remove('active'));
                    this.classList.add('active');
                }
            }
            // 其他链接正常跳转
        });
    });
    
    console.log('✅ 基础功能初始化完成');
}
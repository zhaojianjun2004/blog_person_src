// 主题预加载脚本 - 防止页面闪烁
// 这个脚本应该在HTML的<head>中内联或作为第一个脚本加载
(function() {
    // 立即从localStorage读取并应用主题
    const savedTheme = localStorage.getItem('blog-theme') || localStorage.getItem('theme') || 'dark';
    const htmlEl = document.documentElement;
    
    // 立即设置html元素的属性和样式
    htmlEl.setAttribute('data-theme', savedTheme);
    htmlEl.style.backgroundColor = savedTheme === 'dark' ? '#050505' : '#ffffff';
    
    // 设置body主题的函数
    const setBodyTheme = function() {
        if (document.body) {
            document.body.setAttribute('data-theme', savedTheme);
            document.body.style.backgroundColor = savedTheme === 'dark' ? '#050505' : '#ffffff';
            document.body.style.color = savedTheme === 'dark' ? '#ffffff' : '#333333';
        } else {
            // 如果body还不存在，使用MutationObserver监听
            const observer = new MutationObserver(function() {
                if (document.body) {
                    document.body.setAttribute('data-theme', savedTheme);
                    document.body.style.backgroundColor = savedTheme === 'dark' ? '#050505' : '#ffffff';
                    document.body.style.color = savedTheme === 'dark' ? '#ffffff' : '#333333';
                    observer.disconnect();
                }
            });
            observer.observe(htmlEl, { childList: true });
        }
    };
    
    // 立即尝试设置
    setBodyTheme();
    
    // 确保DOMContentLoaded时也设置（双重保险）
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setBodyTheme);
    }
})();

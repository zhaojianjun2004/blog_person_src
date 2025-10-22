/**
 * 数学公式渲染器
 * 使用 KaTeX 和 auto-render 实现数学公式渲染
 * 支持行内公式 $...$ 和块级公式 $$...$$
 * 特别处理矩阵和方程组的换行问题
 */

class MathRenderer {
    constructor() {
        this.isKatexLoaded = false;
        this.isAutoRenderLoaded = false;
        this.renderQueue = [];
    }

    /**
     * 检查 KaTeX 和 auto-render 是否已加载
     */
    checkLibrariesLoaded() {
        this.isKatexLoaded = typeof katex !== 'undefined';
        this.isAutoRenderLoaded = typeof renderMathInElement !== 'undefined';
        return this.isKatexLoaded && this.isAutoRenderLoaded;
    }

    /**
     * 等待库加载完成
     */
    waitForLibraries() {
        return new Promise((resolve, reject) => {
            if (this.checkLibrariesLoaded()) {
                resolve();
                return;
            }

            let attempts = 0;
            const maxAttempts = 50; // 最多等待5秒
            const checkInterval = setInterval(() => {
                attempts++;
                if (this.checkLibrariesLoaded()) {
                    clearInterval(checkInterval);
                    resolve();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    reject(new Error('KaTeX 或 auto-render 加载超时'));
                }
            }, 100);
        });
    }

    /**
     * 渲染指定容器内的数学公式
     * @param {HTMLElement|string} container - 容器元素或选择器
     */
    async render(container) {
        try {
            // 等待库加载完成
            await this.waitForLibraries();

            const element = typeof container === 'string' 
                ? document.querySelector(container)
                : container;

            if (!element) {
                console.warn('⚠️ 数学渲染：找不到容器元素');
                return;
            }

            // 使用 auto-render 扩展进行渲染
            renderMathInElement(element, {
                // 定界符配置
                delimiters: [
                    { left: '$$', right: '$$', display: true },   // 块级公式
                    { left: '$', right: '$', display: false },     // 行内公式
                    { left: '\\[', right: '\\]', display: true },  // 备用块级
                    { left: '\\(', right: '\\)', display: false }  // 备用行内
                ],
                // 遇到错误时抛出异常
                throwOnError: false,
                // 错误颜色
                errorColor: '#cc0000',
                // 忽略的标签
                ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
                // 忽略的类
                ignoredClasses: ['no-math'],
                // 预处理函数 - 处理换行问题
                preProcess: (text) => {
                    // 处理矩阵环境中的换行
                    // 将 \\ 替换为 \\，确保 KaTeX 能正确解析
                    return text
                        .replace(/\\\\/g, '\\\\')  // 保留双反斜杠
                        .trim();
                },
                // 信任模式 - 允许某些命令
                trust: true,
                // 宏定义 - 可以添加常用的数学宏
                macros: {
                    "\\R": "\\mathbb{R}",
                    "\\N": "\\mathbb{N}",
                    "\\Z": "\\mathbb{Z}",
                    "\\Q": "\\mathbb{Q}",
                    "\\C": "\\mathbb{C}",
                }
            });

            console.log('✅ 数学公式渲染完成');
        } catch (error) {
            console.error('❌ 数学公式渲染失败:', error);
        }
    }

    /**
     * 渲染单个数学表达式
     * @param {string} expression - 数学表达式
     * @param {boolean} displayMode - 是否为块级显示
     * @returns {string} 渲染后的 HTML
     */
    renderExpression(expression, displayMode = false) {
        try {
            if (!this.checkLibrariesLoaded()) {
                console.warn('⚠️ KaTeX 尚未加载');
                return expression;
            }

            return katex.renderToString(expression, {
                displayMode: displayMode,
                throwOnError: false,
                errorColor: '#cc0000',
                trust: true,
                macros: {
                    "\\R": "\\mathbb{R}",
                    "\\N": "\\mathbb{N}",
                    "\\Z": "\\mathbb{Z}",
                    "\\Q": "\\mathbb{Q}",
                    "\\C": "\\mathbb{C}",
                }
            });
        } catch (error) {
            console.error('❌ 渲染数学表达式失败:', error);
            return expression;
        }
    }

    /**
     * 初始化 - 添加必要的样式修复
     */
    init() {
        // 添加样式修复，确保公式正确显示
        const style = document.createElement('style');
        style.textContent = `
            /* 确保 KaTeX 公式正确换行和显示 */
            .katex-display {
                overflow-x: auto;
                overflow-y: hidden;
                padding: 1rem 0;
            }
            
            /* 矩阵和数组环境的换行支持 */
            .katex .arraycolsep {
                width: 0.5em;
            }
            
            /* 确保行内公式不破坏行高 */
            .katex {
                font-size: 1.05em;
                line-height: 1.2;
            }
        `;
        document.head.appendChild(style);
    }
}

// 创建全局实例
window.mathRenderer = new MathRenderer();

// 初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mathRenderer.init();
    });
} else {
    window.mathRenderer.init();
}

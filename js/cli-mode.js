class BlogCLI {
    constructor() {
        this.isActive = false;
        this.history = [];
        this.historyIndex = -1;

        this.commands = {
            'help': {
                description: 'Show all available commands.',
                execute: () => this.showHelp()
            },
            'articles': {
                description: 'List all articles.',
                execute: (args) => this.listArticles(args)
            },

            'categories': {
                description: 'List all categories.',
                execute: () => this.listCategories()
            },
            'tags': {
                description: 'List all tags.',
                execute: () => this.listTags()
            },
            'search': {
                description: 'Search articles. Usage: search <keyword>',
                execute: (args) => this.searchArticles(args)
            },
            'category': {
                description: 'Show articles in a category. Usage: category <name>',
                execute: (args) => this.showCategory(args)
            },
            'stats': {
                description: 'Show blog statistics.',
                execute: () => this.showStats()
            },
            'about': {
                description: 'Display information about this blog.',
                execute: () => this.showAbout()
            },
            'clear': {
                description: 'Clear the terminal screen.',
                execute: () => this.clearScreen()
            },
            'exit': {
                description: 'Exit the CLI mode.',
                execute: () => this.toggle()
            }
        };

        this.initDOM();
        this.bindEvents();
        this.welcomeMessage();
    }

    initDOM() {
        // CLI Toggle Button
        this.toggleButton = document.createElement('div');
        this.toggleButton.className = 'cli-toggle-button';
        this.toggleButton.innerHTML = `
            <div class="cli-toggle-icon">&gt;_</div>
            <div class="cli-tooltip">Try CLI Mode! 🚀</div>
        `;
        document.body.appendChild(this.toggleButton);

        // CLI Container
        this.container = document.createElement('div');
        this.container.className = 'cli-container';
        this.container.innerHTML = `
            <div class="cli-window">
                <div class="cli-header">
                    <span class="cli-title">CaiCaiXiong's Blog - CLI Mode</span>
                    <button class="cli-close-button">&times;</button>
                </div>
                <div class="cli-output"></div>
                <div class="cli-input-container">
                    <span class="cli-prompt" style="color: white;">guest@caicaixiong.space:~$</span>
                    <input type="text" class="cli-input" autofocus />
                </div>
            </div>
        `;
        document.body.appendChild(this.container);

        this.outputElement = this.container.querySelector('.cli-output');
        this.inputElement = this.container.querySelector('.cli-input');
        this.closeButton = this.container.querySelector('.cli-close-button');

        // 添加首次访问提示
        this.showIntroHint();
    }

    bindEvents() {
        this.toggleButton.addEventListener('click', () => this.toggle());
        this.closeButton.addEventListener('click', () => this.toggle());
        this.inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleInput();
            } else if (e.key === 'ArrowUp') {
                this.navigateHistory(1);
            } else if (e.key === 'ArrowDown') {
                this.navigateHistory(-1);
            }
        });
        this.container.addEventListener('click', () => this.inputElement.focus());
    }

    toggle() {
        this.isActive = !this.isActive;
        this.container.classList.toggle('active');
        if (this.isActive) {
            this.inputElement.focus();
            // 激活时滚动到底部
            this.scrollToBottom();
        }
    }

    welcomeMessage() {
        this.printOutput(`Welcome to CaiCaiXiong's Blog CLI!`);
        this.printOutput(`Type 'help' to see a list of available commands.`);
        this.printOutput(`Click on article titles to read them directly.`);
        this.printOutput(`-------------------------------------------------`);
        // 欢迎消息后滚动到底部
        this.scrollToBottom();
    }

    handleInput() {
        const inputText = this.inputElement.value.trim();
        if (inputText === '') return;

        this.printOutput(`<span class="command">guest@caicaixiong.space:~$ ${inputText}</span>`);
        this.history.push(inputText);
        this.historyIndex = this.history.length;

        const [command, ...args] = inputText.split(' ');

        if (this.commands[command]) {
            this.commands[command].execute(args);
        } else {
            this.printOutput(`<span class="error">Command not found: ${command}. Type 'help' for a list of commands.</span>`);
        }

        this.inputElement.value = '';
        // 确保滚动到底部显示最新内容
        this.scrollToBottom();
    }
    
    printOutput(html) {
        this.outputElement.innerHTML += `<div class="cli-output-line">${html}</div>`;
        // 自动滚动到底部
        this.scrollToBottom();
    }

    scrollToBottom() {
        // 使用setTimeout确保DOM更新后再滚动
        setTimeout(() => {
            this.outputElement.scrollTop = this.outputElement.scrollHeight;
        }, 10);
    }

    navigateHistory(direction) {
        if (this.history.length === 0) return;
        this.historyIndex -= direction;

        if (this.historyIndex < 0) {
            this.historyIndex = -1;
            this.inputElement.value = '';
        } else if (this.historyIndex >= this.history.length) {
            this.historyIndex = this.history.length;
            this.inputElement.value = '';
        } else {
            this.inputElement.value = this.history[this.historyIndex];
        }
    }

    // --- Command Implementations ---

    showHelp() {
        this.printOutput('Available commands:');
        for (const cmd in this.commands) {
            this.printOutput(`<span class="help-command">${cmd}</span> <span class="help-description">${this.commands[cmd].description}</span>`);
        }
    }

    async listArticles(args) {
        try {
            this.printOutput('<span class="output">Loading articles...</span>');
            const articles = await blogDataManager.getArticles();
            
            if (args && args.length > 0) {
                // 如果有参数，按分类过滤
                const category = args[0];
                const filteredArticles = articles.filter(article => 
                    article.category.toLowerCase() === category.toLowerCase()
                );
                
                if (filteredArticles.length === 0) {
                    this.printOutput(`<span class="error">No articles found in category "${category}"</span>`);
                    return;
                }
                
                this.printOutput(`Articles in category "${category}":`);
                filteredArticles.forEach((article, index) => {
                    const articleUrl = `/articles/${article.slug}`;
                    this.printOutput(`${index + 1}. <a href="${articleUrl}">${article.title}</a>`);
                    this.printOutput(`   <span style="color: #888">Category: ${article.category} | Tags: ${(article.tags || []).join(', ')}</span>`);
                });
            } else {
                // 显示所有文章
                this.printOutput(`Total articles: ${articles.length}`);
                this.printOutput('');
                articles.forEach((article, index) => {
                    // 使用正确的文章路径格式
                    const articleUrl = `/articles/${article.slug}`;
                    this.printOutput(`${index + 1}. <a href="${articleUrl}">${article.title}</a>`);
                    this.printOutput(`   <span style="color: #888">Category: ${article.category} | Date: ${article.date || 'N/A'}</span>`);
                });
                this.printOutput('');
                this.printOutput('Click on article titles to read them, or use "articles &lt;category&gt;" to filter by category.');
            }
        } catch (error) {
            this.printOutput(`<span class="error">Could not fetch articles: ${error.message}</span>`);
        }
    }

    async listCategories() {
        try {
            this.printOutput('<span class="output">Loading categories...</span>');
            const categories = await blogDataManager.getCategories();
            
            if (!Array.isArray(categories) || categories.length === 0) {
                this.printOutput('No categories found.');
                return;
            }
            
            this.printOutput(`Found ${categories.length} categories:`);
            this.printOutput('');
            categories.forEach((category, index) => {
                const categoryName = category.name || category;
                const categoryCount = category.count || 0;
                this.printOutput(`${index + 1}. <a href="#" onclick="cli.showCategory(['${categoryName}'])">${categoryName}</a> (${categoryCount} articles)`);
            });
            this.printOutput('');
            this.printOutput('Use "category &lt;name&gt;" to see articles in a specific category.');
        } catch (error) {
            this.printOutput(`<span class="error">Could not fetch categories: ${error.message}</span>`);
        }
    }

    async searchArticles(args) {
        if (args.length === 0) {
            this.printOutput(`<span class="error">Usage: search &lt;keyword&gt;</span>`);
            return;
        }
        
        const query = args.join(' ');
        try {
            this.printOutput(`<span class="output">Searching for "${query}"...</span>`);
            const results = await blogDataManager.searchArticles(query);
            
            if (results.length === 0) {
                this.printOutput(`<span class="error">No articles found matching "${query}"</span>`);
            } else {
                this.printOutput(`Found ${results.length} articles matching "${query}":`);
                this.printOutput('');
                results.forEach((article, index) => {
                    const articleUrl = `/articles/${article.slug}`;
                    this.printOutput(`${index + 1}. <a href="${articleUrl}">${article.title}</a>`);
                    this.printOutput(`   <span style="color: #888">Category: ${article.category} | Tags: ${(article.tags || []).join(', ')}</span>`);
                });
            }
        } catch (error) {
            this.printOutput(`<span class="error">Search failed: ${error.message}</span>`);
        }
    }

    async showCategory(args) {
        if (args.length === 0) {
            this.printOutput(`<span class="error">Usage: category &lt;name&gt;</span>`);
            this.printOutput('Use "categories" to see available categories.');
            return;
        }
        
        const categoryName = args[0];
        try {
            const articles = await blogDataManager.findArticlesByCategory(categoryName);
            
            if (articles.length === 0) {
                this.printOutput(`<span class="error">No articles found in category "${categoryName}"</span>`);
                this.printOutput('Use "categories" to see available categories.');
            } else {
                this.printOutput(`Articles in "${categoryName}" category (${articles.length} total):`);
                this.printOutput('');
                articles.forEach((article, index) => {
                    const articleUrl = `/articles/${article.slug}`;
                    this.printOutput(`${index + 1}. <a href="${articleUrl}">${article.title}</a>`);
                    this.printOutput(`   <span style="color: #888">Tags: ${(article.tags || []).join(', ')} | Date: ${article.date || 'N/A'}</span>`);
                });
            }
        } catch (error) {
            this.printOutput(`<span class="error">Error loading category: ${error.message}</span>`);
        }
    }

    async listTags() {
        try {
            this.printOutput('<span class="output">Loading tags...</span>');
            const articles = await blogDataManager.getArticles();
            
            // 统计所有标签
            const tagMap = new Map();
            articles.forEach(article => {
                const tags = article.tags || [];
                if (Array.isArray(tags)) {
                    tags.forEach(tag => {
                        if (tag && typeof tag === 'string') {
                            if (tagMap.has(tag)) {
                                tagMap.set(tag, tagMap.get(tag) + 1);
                            } else {
                                tagMap.set(tag, 1);
                            }
                        }
                    });
                }
            });

            const tags = Array.from(tagMap.entries())
                .sort((a, b) => b[1] - a[1]); // 按使用频率排序

            if (tags.length === 0) {
                this.printOutput('No tags found.');
                return;
            }

            this.printOutput(`Found ${tags.length} tags:`);
            this.printOutput('');
            tags.forEach(([tag, count], index) => {
                this.printOutput(`${index + 1}. <a href="#" onclick="cli.searchArticles(['${tag}'])">${tag}</a> (${count} articles)`);
            });
            this.printOutput('');
            this.printOutput('Click on a tag to search for related articles.');
        } catch (error) {
            this.printOutput(`<span class="error">Could not fetch tags: ${error.message}</span>`);
        }
    }

    async showStats() {
        try {
            this.printOutput('<span class="output">Loading blog statistics...</span>');
            
            // 尝试从API获取统计数据
            const stats = await blogDataManager.getStats();
            const [articles, categories] = await Promise.all([
                blogDataManager.getArticles(),
                blogDataManager.getCategories()
            ]);
            
            const allTags = [...new Set(articles.flatMap(a => a.tags || []))];
            const mostRecentArticle = articles.length > 0 ? 
                articles.sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null;
            
            this.printOutput('📊 Blog Statistics:');
            this.printOutput('');
            this.printOutput(`📝 Total Articles: ${articles.length}`);
            this.printOutput(`📂 Categories: ${categories.length}`);
            this.printOutput(`🏷️  Unique Tags: ${allTags.length}`);
            
            if (mostRecentArticle) {
                this.printOutput(`📅 Latest Article: "${mostRecentArticle.title}"`);
                if (mostRecentArticle.date) {
                    this.printOutput(`   Published: ${mostRecentArticle.date}`);
                }
            }
            
            this.printOutput('');
            this.printOutput('Most active categories:');
            categories
                .sort((a, b) => b.count - a.count)
                .slice(0, 3)
                .forEach((cat, index) => {
                    this.printOutput(`${index + 1}. ${cat.name}: ${cat.count} articles`);
                });
                
            this.printOutput('');
            this.printOutput('Use "articles", "categories", or "tags" to explore content.');
        } catch (error) {
            this.printOutput(`<span class="error">Could not load statistics: ${error.message}</span>`);
        }
    }

    showAbout() {
        this.printOutput('Navigating to the About page...');
        window.location.href = '/about.html';
    }

    clearScreen() {
        this.outputElement.innerHTML = '';
        this.welcomeMessage();
        // 清屏后确保滚动到正确位置
        this.scrollToBottom();
    }

    showIntroHint() {
        // 检查是否已经显示过提示（使用 localStorage）
        if (localStorage.getItem('cli-hint-shown') === 'true') {
            return;
        }

        // 创建提示元素
        const hint = document.createElement('div');
        hint.className = 'cli-intro-hint';
        hint.innerHTML = `
            <button class="hint-close">&times;</button>
            <div class="hint-title">
                🚀 Try CLI Mode!
            </div>
            <div class="hint-text">
                Click the terminal icon to experience a unique way to navigate this blog!
            </div>
        `;
        document.body.appendChild(hint);

        // 延迟显示动画
        setTimeout(() => {
            hint.classList.add('show');
        }, 2000);

        // 关闭按钮事件
        const closeBtn = hint.querySelector('.hint-close');
        closeBtn.addEventListener('click', () => {
            hint.classList.remove('show');
            setTimeout(() => {
                if (hint.parentNode) {
                    hint.parentNode.removeChild(hint);
                }
            }, 500);
            localStorage.setItem('cli-hint-shown', 'true');
        });

        // 点击CLI按钮时也隐藏提示
        this.toggleButton.addEventListener('click', () => {
            if (hint.parentNode) {
                hint.classList.remove('show');
                setTimeout(() => {
                    if (hint.parentNode) {
                        hint.parentNode.removeChild(hint);
                    }
                }, 500);
                localStorage.setItem('cli-hint-shown', 'true');
            }
        });

        // 5秒后自动隐藏
        setTimeout(() => {
            if (hint.parentNode) {
                hint.classList.remove('show');
                setTimeout(() => {
                    if (hint.parentNode) {
                        hint.parentNode.removeChild(hint);
                    }
                }, 500);
                localStorage.setItem('cli-hint-shown', 'true');
            }
        }, 8000);
    }
}

// Expose a global instance for inline event handlers
const cli = new BlogCLI();

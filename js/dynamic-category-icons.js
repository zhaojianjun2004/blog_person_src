// 动态分类图标管理器
class DynamicCategoryIcons {
    constructor() {
        // 预设的分类图标映射
        this.iconMappings = {
            // 编程语言
            'java': '☕',
            'javascript': '🟨',
            'python': '🐍',
            'typescript': '🔷',
            'golang': '🐹',
            'rust': '🦀',
            'php': '🐘',
            'c++': '⚡',
            'c#': '🔵',
            'kotlin': '🏛️',
            'swift': '🍎',
            'ruby': '💎',
            
            // 数据库
            'database': '🗄️',
            'mysql': '🐬',
            'postgresql': '🐘',
            'mongodb': '🍃',
            'redis': '🔴',
            'elasticsearch': '🔍',
            'oracle': '🏛️',
            'sqlite': '💾',
            
            // 框架技术
            'spring': '🌱',
            'springboot': '🚀',
            'react': '⚛️',
            'vue': '💚',
            'angular': '🔺',
            'nodejs': '💚',
            'express': '⚡',
            'nestjs': '🐱',
            'django': '🎸',
            'flask': '🍶',
            'laravel': '🎨',
            
            // 云服务与运维
            'docker': '🐳',
            'kubernetes': '☸️',
            'aws': '☁️',
            'azure': '☁️',
            'gcp': '☁️',
            'linux': '🐧',
            'nginx': '🚀',
            'jenkins': '👷',
            'devops': '⚙️',
            'cicd': '🔄',
            
            // 前端技术
            'html': '📄',
            'css': '🎨',
            'sass': '💖',
            'webpack': '📦',
            'vite': '⚡',
            'tailwind': '🌊',
            'bootstrap': '🅱️',
            
            // 数据科学与AI
            'ai': '🤖',
            'machinelearning': '🧠',
            'datascience': '📊',
            'tensorflow': '🧠',
            'pytorch': '🔥',
            'pandas': '🐼',
            'numpy': '🔢',
            
            // 工具与其他
            'git': '📝',
            'github': '🐙',
            'vscode': '💙',
            'api': '🔌',
            'graphql': '📊',
            'rest': '🌐',
            'microservices': '🏗️',
            'blockchain': '⛓️',
            'security': '🔒',
            'testing': '🧪',
            'performance': '📈',
            'mobile': '📱',
            'iot': '📡',
            'gamedev': '🎮',
            'tutorial': '📚',
            'tips': '💡',
            'career': '🚀',
            'lifestyle': '🌟',
            'thoughts': '💭',
            'review': '📝'
        };
        
        this.defaultIcon = '📄'; // 默认图标
    }
    
    /**
     * 根据分类名称获取对应图标
     * @param {string} categoryName - 分类名称
     * @returns {string} 对应的emoji图标
     */
    getIconForCategory(categoryName) {
        if (!categoryName) return this.defaultIcon;
        
        // 转换为小写并去除特殊字符进行匹配
        const normalizedName = categoryName.toLowerCase()
            .replace(/[\s\-_\.]/g, '') // 移除空格、连字符、下划线、点
            .replace(/[^\w]/g, ''); // 移除非字母数字字符
        
        // 尝试精确匹配
        if (this.iconMappings[normalizedName]) {
            return this.iconMappings[normalizedName];
        }
        
        // 尝试模糊匹配（包含关键词）
        for (const [key, icon] of Object.entries(this.iconMappings)) {
            if (normalizedName.includes(key) || key.includes(normalizedName)) {
                return icon;
            }
        }
        
        // 根据常见关键词进行智能推断
        return this.inferIconFromKeywords(normalizedName, categoryName);
    }
    
    /**
     * 根据关键词智能推断图标
     * @param {string} normalizedName - 标准化的分类名
     * @param {string} originalName - 原始分类名
     * @returns {string} 推断的图标
     */
    inferIconFromKeywords(normalizedName, originalName) {
        const keywordMappings = {
            // 编程相关
            'code|programming|development|dev': '💻',
            'web|website|frontend|backend': '🌐',
            'mobile|android|ios': '📱',
            'game|gaming': '🎮',
            
            // 学习相关
            'learn|learning|study|tutorial|guide': '📚',
            'tip|tips|trick|best': '💡',
            'interview|career|job': '💼',
            
            // 技术相关
            'tech|technology|technical': '⚙️',
            'tool|tools|software': '🔧',
            'system|architecture|design': '🏗️',
            'algorithm|data': '📊',
            
            // 生活相关
            'life|lifestyle|personal': '🌟',
            'thought|thinking|opinion': '💭',
            'news|update|announcement': '📢',
            'review|analysis': '📝'
        };
        
        for (const [keywords, icon] of Object.entries(keywordMappings)) {
            const keywordList = keywords.split('|');
            if (keywordList.some(keyword => 
                normalizedName.includes(keyword) || 
                originalName.toLowerCase().includes(keyword)
            )) {
                return icon;
            }
        }
        
        return this.defaultIcon;
    }
    
    /**
     * 批量为分类对象添加图标
     * @param {Object} categories - 分类对象
     * @returns {Object} 添加了图标的分类对象
     */
    addIconsToCategories(categories) {
        const result = { ...categories };
        
        Object.keys(result).forEach(categoryKey => {
            if (!result[categoryKey].icon) {
                result[categoryKey].icon = this.getIconForCategory(categoryKey);
            }
        });
        
        return result;
    }
    
    /**
     * 添加新的图标映射
     * @param {string} categoryName - 分类名称
     * @param {string} icon - 对应图标
     */
    addIconMapping(categoryName, icon) {
        const normalizedName = categoryName.toLowerCase().replace(/[\s\-_\.]/g, '');
        this.iconMappings[normalizedName] = icon;
    }
    
    /**
     * 获取所有可用的图标映射
     * @returns {Object} 图标映射对象
     */
    getAllIconMappings() {
        return { ...this.iconMappings };
    }
}

// 创建全局实例
window.DynamicCategoryIcons = new DynamicCategoryIcons();

console.log('🎨 动态分类图标管理器初始化完成');
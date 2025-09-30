// 缓存管理器 - 提升页面加载性能
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存过期
        this.init();
    }
    
    init() {
        // 清理过期缓存
        setInterval(() => {
            this.cleanExpiredCache();
        }, 60 * 1000); // 每分钟清理一次
        
        console.log('💾 缓存管理器初始化完成');
    }
    
    // 设置缓存
    set(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }
    
    // 获取缓存
    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        // 检查是否过期
        if (Date.now() - cached.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }
    
    // 检查是否有有效缓存
    has(key) {
        return this.get(key) !== null;
    }
    
    // 删除缓存
    delete(key) {
        this.cache.delete(key);
    }
    
    // 清理过期缓存
    cleanExpiredCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                this.cache.delete(key);
            }
        }
    }
    
    // 清空所有缓存
    clear() {
        this.cache.clear();
    }
    
    // 获取缓存统计信息
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// 创建全局缓存管理器实例
window.cacheManager = new CacheManager();
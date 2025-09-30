// 性能监控和优化工具
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            loadTime: 0,
            renderTime: 0,
            cacheHits: 0,
            cacheMisses: 0,
            domOperations: 0
        };
        
        this.startTime = performance.now();
        this.init();
    }
    
    init() {
        // 监控页面加载完成时间
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.metrics.loadTime = performance.now() - this.startTime;
                this.logMetric('DOM加载时间', this.metrics.loadTime + 'ms');
            });
        }
        
        // 监控页面完全加载时间
        window.addEventListener('load', () => {
            this.metrics.loadTime = performance.now() - this.startTime;
            this.logMetric('页面完全加载时间', this.metrics.loadTime + 'ms');
            this.reportPerformance();
        });
        
        // 重写常用DOM方法以监控操作次数
        this.monitorDOMOperations();
        
        console.log('🎯 性能监控器已启动');
    }
    
    // 监控DOM操作
    monitorDOMOperations() {
        const originalQuerySelector = document.querySelector;
        const originalQuerySelectorAll = document.querySelectorAll;
        const originalGetElementById = document.getElementById;
        
        document.querySelector = (...args) => {
            this.metrics.domOperations++;
            return originalQuerySelector.apply(document, args);
        };
        
        document.querySelectorAll = (...args) => {
            this.metrics.domOperations++;
            return originalQuerySelectorAll.apply(document, args);
        };
        
        document.getElementById = (...args) => {
            this.metrics.domOperations++;
            return originalGetElementById.apply(document, args);
        };
    }
    
    // 记录缓存命中
    recordCacheHit() {
        this.metrics.cacheHits++;
    }
    
    // 记录缓存未命中
    recordCacheMiss() {
        this.metrics.cacheMisses++;
    }
    
    // 记录渲染时间
    recordRenderTime(time) {
        this.metrics.renderTime = time;
        this.logMetric('渲染时间', time + 'ms');
    }
    
    // 记录指标
    logMetric(name, value) {
        console.log(`📊 ${name}: ${value}`);
    }
    
    // 生成性能报告
    reportPerformance() {
        const cacheHitRate = this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100;
        
        console.group('📈 性能报告');
        console.log('🕐 页面加载时间:', this.metrics.loadTime.toFixed(2) + 'ms');
        console.log('🎨 渲染时间:', this.metrics.renderTime.toFixed(2) + 'ms');
        console.log('💾 缓存命中率:', cacheHitRate.toFixed(1) + '%');
        console.log('🔍 DOM操作次数:', this.metrics.domOperations);
        console.log('📦 缓存统计:', {
            命中: this.metrics.cacheHits,
            未命中: this.metrics.cacheMisses
        });
        
        // 性能建议
        this.generateRecommendations();
        console.groupEnd();
    }
    
    // 生成性能建议
    generateRecommendations() {
        const recommendations = [];
        
        if (this.metrics.loadTime > 2000) {
            recommendations.push('页面加载时间较长，建议优化资源加载');
        }
        
        if (this.metrics.renderTime > 100) {
            recommendations.push('渲染时间较长，建议减少DOM操作');
        }
        
        const cacheHitRate = this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100;
        if (cacheHitRate < 50) {
            recommendations.push('缓存命中率较低，建议增加缓存策略');
        }
        
        if (this.metrics.domOperations > 100) {
            recommendations.push('DOM操作过于频繁，建议批量处理');
        }
        
        if (recommendations.length > 0) {
            console.group('💡 性能建议');
            recommendations.forEach(rec => console.log('⚠️', rec));
            console.groupEnd();
        } else {
            console.log('✅ 页面性能良好');
        }
    }
    
    // 获取当前性能指标
    getMetrics() {
        return { ...this.metrics };
    }
}

// 创建全局性能监控器实例（仅在开发环境）
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.performanceMonitor = new PerformanceMonitor();
    
    // 扩展缓存管理器以记录指标
    if (window.cacheManager) {
        const originalGet = window.cacheManager.get;
        const originalSet = window.cacheManager.set;
        
        window.cacheManager.get = function(key) {
            const result = originalGet.call(this, key);
            if (window.performanceMonitor) {
                if (result !== null) {
                    window.performanceMonitor.recordCacheHit();
                } else {
                    window.performanceMonitor.recordCacheMiss();
                }
            }
            return result;
        };
    }
}
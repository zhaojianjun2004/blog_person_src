# 推荐网站配置指南

推荐网站功能已经实现了类似友链的JSON配置方式，您可以通过编辑 `data/recommended-sites.json` 文件来管理推荐网站。

## 文件位置
```
data/recommended-sites.json
```

## 配置格式
```json
[
  {
    "name": "网站名称",
    "url": "网站链接",
    "avatar": "头像图片链接",
    "description": "网站描述"
  }
]
```

## 示例配置
```json
[
  {
    "name": "GitHub",
    "url": "https://github.com",
    "avatar": "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    "description": "全球最大的代码托管平台"
  },
  {
    "name": "掘金",
    "url": "https://juejin.cn",
    "avatar": "https://lf3-cdn-tos.bytescm.com/obj/static/xitu_juejin_web/static/favicons/favicon-32x32.png",
    "description": "中文技术社区"
  }
]
```

## 使用说明

1. **添加新网站**：在JSON数组中添加新的对象
2. **修改网站信息**：直接编辑对应字段
3. **删除网站**：从JSON数组中移除对应对象
4. **重新排序**：调整JSON数组中对象的顺序

## 字段说明

- `name`: 显示的网站名称
- `url`: 网站链接地址（点击时跳转）
- `avatar`: 网站图标/头像的图片链接
- `description`: 网站的简短描述

## 注意事项

- 确保JSON格式正确
- 图片链接建议使用HTTPS
- 描述文字建议简洁明了
- 如果JSON文件不存在或格式错误，系统会使用默认配置

## 技术实现

推荐网站使用 `RecommendedSitesLoader` 类进行管理：
- 自动从JSON文件加载数据
- 支持动态渲染
- 提供加载失败的备选方案
- 样式与友链保持一致
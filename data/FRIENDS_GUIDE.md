# 友链管理指南

## 📋 友链数据格式

友链数据存储在 `data/friends.json` 文件中，格式如下：

```json
[
  {
    "name": "友链名称",
    "url": "友链网址", 
    "avatar": "头像URL",
    "description": "友链描述"
  }
]
```

## 📝 字段说明

- **name**: 友链的显示名称（必填）
- **url**: 友链的完整网址，需包含 `http://` 或 `https://`（必填）
- **avatar**: 头像图片的URL地址（必填）
- **description**: 友链的简短描述（必填）

## 🔧 如何添加友链

### 方法1：直接编辑JSON文件

1. 打开 `data/friends.json` 文件
2. 在数组中添加新的友链对象
3. 保存文件

示例：
```json
[
  {
    "name": "张三的博客",
    "url": "https://zhangsan.example.com",
    "avatar": "https://zhangsan.example.com/avatar.jpg",
    "description": "专注前端技术分享"
  },
  {
    "name": "李四的技术站",
    "url": "https://lisi.tech",
    "avatar": "https://lisi.tech/images/avatar.png", 
    "description": "后端开发经验总结"
  }
]
```

### 方法2：使用在线头像生成器

如果没有头像图片，可以使用以下格式生成占位头像：

```
https://via.placeholder.com/40x40/颜色代码/文字颜色?text=文字
```

示例：
- `https://via.placeholder.com/40x40/00ffff/000000?text=ZS` （青色背景，黑色文字）
- `https://via.placeholder.com/40x40/0099ff/ffffff?text=LS` （蓝色背景，白色文字）

## 🎨 头像建议

- **尺寸**: 建议 40x40 像素或更高分辨率的正方形图片
- **格式**: 支持 JPG、PNG、WebP 等常见格式
- **样式**: 建议使用圆形或方形头像，与页面风格协调

## 🔍 友链显示规则

- 友链按照在JSON文件中的顺序显示
- 支持响应式布局，自动适应不同屏幕尺寸
- 鼠标悬停时有动画效果
- 点击友链会在新标签页打开

## ⚠️ 注意事项

1. **JSON格式**: 确保JSON文件格式正确，所有字符串都用双引号包围
2. **URL有效性**: 确保友链URL可以正常访问
3. **头像加载**: 如果头像无法加载，会自动显示备用图片
4. **文件编码**: 确保文件保存为UTF-8编码以支持中文

## 🚀 高级功能

### 批量导入
如果需要批量添加友链，可以：
1. 准备CSV格式数据
2. 转换为JSON格式
3. 替换或合并到现有的 `friends.json` 文件

### 备份友链数据
建议定期备份 `friends.json` 文件，防止数据丢失。

## 💡 友链交换建议

在交换友链时，建议：
- 选择内容相关、质量较高的站点
- 确认对方站点稳定运行
- 定期检查友链的有效性
- 保持友链数量适中，避免页面过于拥挤

## 📞 技术支持

如果在使用过程中遇到问题，可以：
- 检查浏览器开发者工具的控制台错误信息
- 验证JSON格式的正确性
- 确认图片URL的可访问性
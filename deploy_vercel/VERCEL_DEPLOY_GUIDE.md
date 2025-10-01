# 🚀 Vercel 部署完整教程

## 📋 前提条件

- ✅ GitHub 账号
- ✅ 项目已推送到 GitHub 仓库
- ✅ 项目可以在本地正常运行

---

## 🎯 部署步骤

### 第 1 步：准备 GitHub 仓库

1. **确保代码已提交并推送到 GitHub**
   ```bash
   git add .
   git commit -m "准备部署到 Vercel"
   git push origin main
   ```

2. **确认仓库信息**
   - 仓库名：`blog_person_src`
   - 所有者：`zhaojianjun2004`
   - 分支：`main`

---

### 第 2 步：注册/登录 Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 点击右上角 **"Sign Up"** 或 **"Log In"**
3. 选择 **"Continue with GitHub"**
4. 授权 Vercel 访问你的 GitHub 账号

---

### 第 3 步：导入项目

#### 方式一：通过 Vercel Dashboard（推荐）

1. 登录后，点击 **"Add New..."** → **"Project"**
2. 在 **"Import Git Repository"** 中找到 `blog_person_src`
3. 点击 **"Import"** 按钮

#### 方式二：通过命令行

```bash
# 全局安装 Vercel CLI
npm i -g vercel

# 在项目目录下运行
cd d:\personal_blog\blog_person
vercel

# 按提示操作：
# - 登录 Vercel 账号
# - 确认项目设置
# - 等待部署完成
```

---

### 第 4 步：配置项目设置

在 Vercel 导入页面，你会看到以下配置：

#### **项目名称**
- 默认：`blog-person-src`
- 可以修改为你喜欢的名称，如：`caicaixiong-blog`

#### **Framework Preset**
- 选择：**Other** 或 **Node.js**

#### **Root Directory**
- 保持默认：`./`

#### **Build and Output Settings**

**Build Command**（留空或使用）：
```bash
npm install
```

**Output Directory**（留空）：
```bash
.
```

**Install Command**：
```bash
npm install
```

#### **Environment Variables**（可选）
如果你有环境变量，可以添加：
```
PORT=3001
NODE_ENV=production
```

---

### 第 5 步：部署

1. 检查所有设置后，点击 **"Deploy"** 按钮
2. Vercel 会自动：
   - 克隆你的代码
   - 安装依赖
   - 构建项目
   - 部署到全球 CDN

3. **等待 2-3 分钟**，部署完成后你会看到：
   ```
   ✅ Deployment Ready
   ```

4. 你会获得一个域名，类似：
   ```
   https://blog-person-src.vercel.app
   或
   https://blog-person-src-zhaojianjun2004.vercel.app
   ```

---

## 🌐 第 6 步：访问你的博客

点击 Vercel 提供的域名链接，你的博客就上线了！

**示例域名格式**：
- `https://[项目名].vercel.app`
- `https://[项目名]-[用户名].vercel.app`

---

## 🎨 第 7 步：自定义域名（可选）

### 使用 Vercel 提供的域名
- 免费且自动配置 HTTPS
- 格式：`your-project.vercel.app`

### 绑定自己的域名（域名备案后）

1. 在 Vercel Dashboard 中，进入你的项目
2. 点击 **"Settings"** → **"Domains"**
3. 输入你的域名，如：`caicaixiong.space`
4. 按提示在域名服务商添加 DNS 记录：
   ```
   类型: CNAME
   名称: @（或 www）
   值: cname.vercel-dns.com
   ```
5. 等待 DNS 生效（可能需要几分钟到几小时）

---

## 🔄 第 8 步：自动部署

Vercel 已自动配置 CI/CD！

以后每次你推送代码到 GitHub：
```bash
git add .
git commit -m "更新博客内容"
git push origin main
```

Vercel 会**自动检测并重新部署**你的网站！

---

## 🛠️ 常见问题

### Q1: 部署失败怎么办？

**检查部署日志**：
1. 在 Vercel Dashboard 中点击失败的部署
2. 查看 **"Build Logs"**
3. 根据错误信息修复代码

**常见错误**：
- 依赖安装失败 → 检查 `package.json`
- 文件路径错误 → 确保路径区分大小写
- 端口配置问题 → Vercel 会自动分配端口

### Q2: 如何查看部署日志？

1. 进入项目 Dashboard
2. 点击最近的部署记录
3. 查看 **"Building"** 和 **"Deployment"** 日志

### Q3: 如何回滚到之前的版本？

1. 在 **"Deployments"** 标签中查看历史部署
2. 点击任意历史版本
3. 点击 **"Promote to Production"**

### Q4: 静态资源加载失败？

检查 `vercel.json` 的路由配置是否正确。

### Q5: API 请求失败？

确保：
- `server.js` 导出为 `module.exports = app`
- API 路由正确配置在 `vercel.json` 中

---

## 📊 性能优化建议

### 1. 启用 Vercel Analytics（可选）
```bash
npm install @vercel/analytics
```

在你的 HTML 中添加：
```html
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="https://cdn.vercel-insights.com/v1/script.js"></script>
```

### 2. 配置缓存策略

在 `vercel.json` 中添加：
```json
{
  "headers": [
    {
      "source": "/css/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 🎉 完成！

现在你的博客已经成功部署到 Vercel，并且：

✅ 不暴露服务器 IP
✅ 免费 HTTPS 加密
✅ 全球 CDN 加速
✅ 自动部署更新
✅ 可以绑定自定义域名

---

## 📞 需要帮助？

- Vercel 文档：https://vercel.com/docs
- Vercel 社区：https://github.com/vercel/vercel/discussions

---

## 🔗 相关链接

- **Vercel Dashboard**: https://vercel.com/dashboard
- **你的 GitHub 仓库**: https://github.com/zhaojianjun2004/blog_person_src
- **Vercel CLI 文档**: https://vercel.com/docs/cli

---

*最后更新：2025年10月1日*

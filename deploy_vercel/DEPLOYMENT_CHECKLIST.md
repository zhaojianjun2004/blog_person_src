# ✅ Vercel 部署检查清单

在部署到 Vercel 之前，请确保完成以下步骤：

## 📋 部署前检查

### 1. 文件配置 ✅
- [x] `vercel.json` - Vercel 配置文件（已创建）
- [x] `.vercelignore` - 忽略文件配置（已创建）
- [x] `server.js` - 导出 app 模块（已修改）
- [x] `package.json` - 依赖配置完整

### 2. Git 仓库 ⚠️
- [ ] 代码已提交到本地
- [ ] 代码已推送到 GitHub
- [ ] 分支名称：`main`
- [ ] 仓库可访问

### 3. 账号准备 ⚠️
- [ ] 已有 GitHub 账号
- [ ] 已注册 Vercel 账号（或准备用 GitHub 登录）

---

## 🚀 开始部署

### 步骤 1：提交代码

**运行部署脚本（推荐）：**
```bash
deploy.bat
```

**或手动执行：**
```bash
git status                           # 检查状态
git add .                            # 添加所有更改
git commit -m "准备部署到 Vercel"    # 提交
git push origin main                 # 推送到 GitHub
```

✅ 完成后打勾：[ ]

---

### 步骤 2：在 Vercel 导入项目

1. 访问：https://vercel.com/new
2. 选择 "Continue with GitHub" 登录
3. 找到 `blog_person_src` 仓库
4. 点击 "Import" 按钮

✅ 完成后打勾：[ ]

---

### 步骤 3：配置项目设置

在 Vercel 导入页面：

**项目名称**（可选修改）：
```
blog-person-src
或
caicaixiong-blog
```

**Framework Preset**：
```
Other 或 Node.js
```

**Build Settings**：
- Build Command: 留空或 `npm install`
- Output Directory: 留空
- Install Command: `npm install`

**Environment Variables**（可选）：
```
NODE_ENV=production
```

✅ 完成后打勾：[ ]

---

### 步骤 4：点击部署

1. 检查所有设置
2. 点击 **"Deploy"** 按钮
3. 等待 2-3 分钟

✅ 完成后打勾：[ ]

---

### 步骤 5：验证部署

部署成功后：

1. 获得域名：`https://[项目名].vercel.app`
2. 点击访问链接
3. 检查以下功能：
   - [ ] 首页正常显示
   - [ ] 文章列表加载
   - [ ] 文章详情页可访问
   - [ ] 分类功能正常
   - [ ] CLI 模式可用
   - [ ] 样式加载正确

✅ 完成后打勾：[ ]

---

## 🎉 部署完成！

恭喜！你的博客已成功部署到 Vercel。

**你的博客地址：**
```
https://______________________.vercel.app
```

---

## 📝 后续操作

### 自动部署
每次推送代码到 GitHub，Vercel 会自动重新部署：
```bash
git add .
git commit -m "更新内容"
git push origin main
```

### 自定义域名（可选）
域名备案完成后：
1. Vercel Dashboard → Settings → Domains
2. 添加你的域名
3. 配置 DNS 记录

### 查看部署日志
- Vercel Dashboard → 你的项目 → Deployments
- 点击任意部署查看详细日志

---

## ❓ 遇到问题？

### 部署失败
1. 检查 Vercel 的 Build Logs
2. 确保 `package.json` 依赖完整
3. 查看 [VERCEL_DEPLOY_GUIDE.md](./VERCEL_DEPLOY_GUIDE.md)

### 404 错误
1. 检查 `vercel.json` 路由配置
2. 确保静态文件路径正确

### API 请求失败
1. 确认 `server.js` 已正确导出 app
2. 检查 API 路由配置

---

## 📞 获取帮助

- **详细教程**: [VERCEL_DEPLOY_GUIDE.md](./VERCEL_DEPLOY_GUIDE.md)
- **快速开始**: [QUICK_START.md](./QUICK_START.md)
- **Vercel 文档**: https://vercel.com/docs
- **GitHub Issues**: https://github.com/zhaojianjun2004/blog_person_src/issues

---

*祝部署顺利！* 🚀

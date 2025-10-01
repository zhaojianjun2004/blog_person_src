# 🚀 5分钟快速部署到 Vercel

## ⚡ 超快速部署（3个步骤）

### 1️⃣ 提交代码到 GitHub

在项目目录下运行（已为你准备好脚本）：

**Windows:**
```bash
deploy.bat
```

**或手动执行：**
```bash
git add .
git commit -m "准备部署到 Vercel"
git push origin main
```

---

### 2️⃣ 在 Vercel 导入项目

1. 访问：**https://vercel.com/new**
2. 用 GitHub 登录
3. 找到 `blog_person_src` 仓库，点击 **Import**
4. 保持默认设置，点击 **Deploy**

---

### 3️⃣ 等待部署完成 ✅

2-3分钟后，你会获得一个域名：
```
https://blog-person-src.vercel.app
```

**就这么简单！🎉**

---

## 📋 部署检查清单

部署前确保：

- ✅ `vercel.json` 已创建（已完成）
- ✅ `server.js` 已导出 `module.exports = app`（已完成）
- ✅ 代码已推送到 GitHub
- ✅ 有 Vercel/GitHub 账号

---

## 🔧 可选配置

### 方法 1：通过 Web 界面（推荐新手）

登录 https://vercel.com → 导入项目 → 点击部署

### 方法 2：通过命令行（推荐开发者）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 部署到生产环境
vercel --prod
```

---

## 🌐 自定义域名（可选）

等域名备案完成后：

1. Vercel Dashboard → 你的项目 → Settings → Domains
2. 输入域名：`caicaixiong.space`
3. 在阿里云添加 DNS 记录：
   ```
   类型: CNAME
   主机记录: @
   记录值: cname.vercel-dns.com
   ```

---

## 🔄 后续更新

每次修改代码后：

```bash
git add .
git commit -m "更新内容"
git push
```

Vercel 会自动重新部署！

---

## ❓ 遇到问题？

查看完整教程：`VERCEL_DEPLOY_GUIDE.md`

---

*准备好了？运行 `deploy.bat` 开始部署吧！* 🚀

# CaiCaiXiong's Personal Blog

个人技术博客项目，基于 Node.js + Express 构建。

## 🚀 快速部署

### 方式 1：Vercel 部署（推荐）⭐
**常规部署方式**

1. 🚀 现在开始部署（3个步骤）
- 第 1 步：提交代码到 GitHub
在你的项目目录打开终端（PowerShell 或 CMD），运行：
```shell
# 手动执行
git add .
git commit -m "准备部署到 Vercel"
git push origin main
```
- 第 2 步：在 Vercel 部署
方式 A：通过网页（最简单）

 访问：https://vercel.com/new
 用 GitHub 账号登录
 找到 blog_person_src 仓库，点击 Import
 保持默认设置（可以修改域名，不使用默认的blog_person_src,改为你自己的名字之类的），点击 Deploy
 等待 2-3 分钟完成部署

方式 B：通过命令行
```shell
# 安装 Vercel CLI
npm i -g vercel

# 登录并部署
vercel
```
第 3 步：获取你的博客地址
部署成功后，你会获得一个域名：
```shell
https://zhaojianjun.vercel.app
```
**📚 参考文档**

快速开始：打开 QUICK_START.md
完整教程：打开 VERCEL_DEPLOY_GUIDE.md
检查清单：打开 DEPLOYMENT_CHECKLIST.md

**❓ 常见问题**

Q: 部署需要付费吗？
A: 个人项目免费！Vercel 的 Hobby 计划对个人开发者完全免费。

Q: 部署后如何更新？
A: 只需 git push，Vercel 会自动检测并重新部署。

Q: 域名备案前能访问吗？
A: 能！Vercel 提供的 .vercel.app 域名国内外都能访问（速度可能稍慢）。

🎯 现在就开始吧！
运行 deploy.bat 提交代码
访问 https://vercel.com/new 开始部署


**最简单的部署方式，3 步完成：**

1. **提交代码到 GitHub**
   ```bash
   # Windows 用户直接运行
   deploy.bat
   
   # 或手动执行
   git add .
   git commit -m "准备部署到 Vercel"
   git push origin main
   ```

2. **在 Vercel 导入项目**
   - 访问 https://vercel.com/new
   - 用 GitHub 登录
   - 导入 `blog_person_src` 仓库
   - 点击 Deploy

3. **获得在线地址**
   - 部署完成后获得域名：`https://your-project.vercel.app`
   - 自动 HTTPS，全球 CDN 加速
   - 每次 push 代码自动部署

**优势：**
- ✅ 不暴露服务器 IP
- ✅ 免费 HTTPS + CDN
- ✅ 自动部署
- ✅ 可绑定自定义域名

📖 **详细教程**：查看 [QUICK_START.md](./QUICK_START.md) 或 [VERCEL_DEPLOY_GUIDE.md](./VERCEL_DEPLOY_GUIDE.md)

---

### 方式 2：传统服务器部署

#### 作者使用环境：aliyun centos7
##### 1. 服务器初始化
1. 更新系统软件包
```shell
yum update -y
```
2. 安装必要工具
```shell
yum install -y git
yum install -y nodejs
yum install -y nginx
```
3. 配置防火墙
```shell
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```
> 注意：这个地方就可以开启你的端口了
> 比如8081:
```shell
sudo firewall-cmd --permanent --add-port=8081/tcp
sudo firewall-cmd --reload
```
##### 2. 部署博客
前置条件：
创建博客文件夹：`mkdir /blog`
进入文件夹：`cd /blog`
1. 克隆链接：
```shell
git clone https://github.com/zhaojianjun2004/blog_person_src.git
cd blog_person_src
```
2. 安装项目依赖
```shell
npm install
```
> 这里如果没有npm，执行以下代码：
> 1.先检查是否nodejs下载完整
> `node -v`
> 前面没问题就执行：
> `yum install -y npm`
> 验证方式：`npm -v`
3. 启动nodejs服务
- 使用pm2管理
```shell
npm install -g pm2
pm2 start server.js --name blog_person
pm2 startup
pm2 save
```
##### 3. 配置反向代理
1. 编辑文件
```shell
sudo vi /etc/nginx/conf.d/blog_person.conf
```
添加以下内容：
```
server {
    listen 80; // 建议改一个，比如8081，对应前面我们开启的端口
    server_name <你的域名或服务器IP>;

    location / {
        proxy_pass http://127.0.0.1:3001; // 这里是因为我的代码里面配置的3001 
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
2. 启动并测试nginx
```shell
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx
```

##### 4. 维护和更新
拉取最新代码并更新
```shell
git pull origin main
pm2 restart blog_person
```

---

## 💻 本地开发

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm start
# 或
node server.js
```

访问：http://localhost:3001

### 开发模式（自动重启）
```bash
npm run dev
```

---

## 📁 项目结构

```
blog_person/
├── css/                # 样式文件
├── js/                 # 前端 JavaScript
├── posts/              # Markdown 博客文章
├── data/               # 数据文件（friends.json）
├── utils/              # 工具类（ArticleManager）
├── server.js           # Express 服务器
├── vercel.json         # Vercel 部署配置
├── package.json        # 项目依赖
├── *.html              # 页面模板
└── README.md           # 项目说明
```

---

## 📝 添加新文章

1. 在 `posts/` 目录创建 Markdown 文件
2. 添加文章元数据（Front Matter）：

```markdown
---
title: 文章标题
date: 2025-10-01
category: 技术分类
tags: [标签1, 标签2]
description: 文章描述
---

# 文章内容...
```

3. 提交并推送（如果使用 Vercel，会自动部署）

---

## 🔗 相关链接

- **GitHub 仓库**: https://github.com/zhaojianjun2004/blog_person_src
- **Vercel 部署指南**: [VERCEL_DEPLOY_GUIDE.md](./VERCEL_DEPLOY_GUIDE.md)
- **快速开始**: [QUICK_START.md](./QUICK_START.md)

---

## 📄 License

MIT License

---

*Created by CaiCaiXiong* 🚀

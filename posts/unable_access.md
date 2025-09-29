---
title: Failed to connect to github.com port 443 after 21133 ms问题解决
date: 
update: 
tags:
  - "hexo"
  - "解决方案"
category: devops
---

## 前言

在使用 Hexo 搭建个人博客的过程中，部署到 GitHub Pages 是最常见的方式。然而，许多人在执行 `hexo deploy` 时，常常遇到各种网络问题，比如：

```
fatal: unable to access 'https://github.com/xxx/xxx.github.io.git/': 
Failed to connect to github.com port 443 after 21133 ms: Couldn't connect to server
```

这篇文章将带你**彻底理解问题根源**，并提供**长期有效的解决方案**，让你告别部署失败的烦恼。

------

## 一、问题背景

我们通常使用 `hexo-deployer-git` 插件，通过 HTTPS 协议将生成的静态文件推送到 GitHub 仓库。配置如下：

```
# _config.yml
deploy:
  type: git
  repo: 'https://username:personal-access-token@github.com/username/username.github.io.git'
  branch: main
```

这种方式看似简单，但**依赖 HTTPS 网络的稳定性**。一旦网络环境不佳（如公司防火墙、校园网限制、国内网络波动），就会出现连接超时或失败。

------

## 二、为什么 HTTPS 部署容易失败？

### 1. GitHub 的 HTTPS 服务常被干扰

- 国内网络环境下，`github.com` 的 443 端口（HTTPS）可能被限速或中断。
- 即使你能访问 GitHub 网页，Git 的 push/pull 操作仍可能失败。

### 2. 代理配置复杂

- 如果你使用 Clash、V2Ray 等代理工具，需要额外配置 Git 的代理：

```
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890
```

- 一旦代理关闭，部署立即失败。

### 3. Token 泄露风险

- 在配置文件中明文写入 Personal Access Token，存在安全风险。

------

## 三、终极解决方案：使用 SSH 部署

SSH 协议更稳定，不受 HTTPS 干扰，且只需配置一次，终身受益。

### ✅ 步骤 1：生成 SSH 密钥

打开终端（Windows 用户可用 Git Bash），运行：

```
ssh-keygen -t ed25519 -C "your_email@example.com"
# ed25519可以修改为自己想要的文件名
```

按回车使用默认路径，可设置密码（可选）。

------

### ✅ 步骤 2：添加公钥到 GitHub

1. 复制公钥内容：

   ```
   # Linux/macOS
   cat ~/.ssh/id_ed25519.pub
   
   # Windows
   type C:\Users\你的用户名\.ssh\id_ed25519.pub
   ```

2. 登录 GitHub，进入：

   > **Settings → SSH and GPG keys → New SSH key**

3. 粘贴公钥，保存。

------

### ✅ 步骤 3：修改 Hexo 部署配置

将 `_config.yml` 中的 `deploy` 配置改为 SSH 地址：

```
deploy:
  type: git
  repo: git@github.com:your-username/your-username.github.io.git
  branch: main
```

> ⚠️ 注意：
>
> - 使用 `git@github.com:` 而不是 `https://`
> - 使用 `:` 分隔用户名和仓库名，不是 `/`

------

### ✅ 步骤 4：测试 SSH 连接

```
ssh -T git@github.com
```

如果看到：

```
Hi your-username! You've successfully authenticated...
```

恭喜！SSH 配置成功。

------

### ✅ 步骤 5：重新部署

```
hexo clean && && hexo g && hexo deploy
```

你会发现，部署速度更快，且**不再受网络波动影响**。

------

## 四、其他临时解决方案（备用）

如果你暂时无法使用 SSH，可以尝试以下方法：

### 1. 更换网络环境

- 使用手机热点、家用宽带等更开放的网络。
- 避免使用公司或校园网。

### 2. 配置 Git 代理

```
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890
```

### 3. 修改 Hosts 文件（解决 DNS 污染）

编辑 `C:\Windows\System32\drivers\etc\hosts`，添加：

```
140.82.113.4    github.com
140.82.114.4    api.github.com
```

然后刷新 DNS：

```
ipconfig /flushdns
```

------

## 五、最佳实践建议

| 建议                 | 说明                                                  |
| :------------------- | :---------------------------------------------------- |
| ✅ 使用 SSH 部署      | 稳定、安全、一劳永逸                                  |
| ✅ 本地写作           | 不要在服务器上写文章，用本地电脑 + VS Code            |
| ✅ 源码与静态文件分离 | 源码存 `blog-source` 仓库，静态文件存 `xxx.github.io` |
| ❌ 不要提交 `public/` | `.gitignore` 中排除 `public/` 和 `.deploy_git/`       |
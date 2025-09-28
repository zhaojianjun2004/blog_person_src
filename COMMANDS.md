# 博客管理快捷命令手册

## 🎯 命令总览

这是一套为您的博客项目设计的快捷命令系统，让复杂的开发和部署操作变得简单高效。

### 📋 命令速查表

| 命令 | 功能 | 说明 | 示例 |
|------|------|------|------|
| **本地开发** |
| `cc s` | 启动本地服务器 | 等同于 `node server.js` | `cc s` |
| `cc dev` | 开发模式启动 | 使用nodemon热重载 | `cc dev` |
| `cc stop` | 停止本地服务 | 结束所有node进程 | `cc stop` |
| `cc test` | 运行测试 | 执行npm test脚本 | `cc test` |
| **部署命令** |
| `cc d` | 快速部署 | 推送代码并更新服务器 | `cc d` |
| `cc full` | 完整部署 | 带备份的安全部署 | `cc full` |
| `cc push` | 推送代码 | 推送到GitHub仓库 | `cc push` |
| `cc sync` | 同步部署 | 提交→推送→部署一条龙 | `cc sync` |
| **服务器管理** |
| `cc status` | 检查服务器状态 | PM2、端口、Nginx状态 | `cc status` |
| `cc logs` | 查看服务器日志 | PM2和Nginx日志 | `cc logs` |
| `cc backup` | 创建服务器备份 | 备份整个项目 | `cc backup` |
| `cc install` | 安装部署脚本 | 首次安装到服务器 | `cc install` |
| **Git管理** |
| `cc git` | Git管理界面 | 交互式Git管理 | `cc git` |
| `cc branch` | 分支管理 | 查看和切换分支 | `cc branch` |
| `cc commit` | 快速提交 | 快速提交更改 | `cc commit` |
| **帮助** |
| `cc help` | 显示帮助 | 查看所有命令说明 | `cc help` |

## 🚀 快速开始

### 1. 基本使用
```bash
# Windows用户 (直接使用)
cc s                    # 启动本地服务

# 或使用npm命令
npm start              # 启动本地服务
npm run deploy         # 快速部署
```

### 2. 设置永久别名 (推荐)

#### Windows PowerShell
```powershell
# 编辑PowerShell配置文件
notepad $PROFILE

# 添加以下内容 (修改路径为您的项目路径)
function cc { 
    param($command)
    & "D:\personal_blog\blog_person\cc.bat" $command 
}

function blog { Set-Location "D:\personal_blog\blog_person" }
```

#### Linux/Mac Bash
```bash
# 编辑bash配置文件
nano ~/.bashrc

# 添加以下内容 (修改路径为您的项目路径)
alias cc='bash /path/to/your/blog/cc'
alias blog='cd /path/to/your/blog'
```

### 3. 重启终端或执行
```bash
# PowerShell
. $PROFILE

# Bash
source ~/.bashrc
```

## 💡 典型使用场景

### 场景1: 本地开发测试
```bash
# 启动开发模式 (自动重载)
cc dev

# 修改代码后，代码会自动重载
# 测试完成后停止服务
cc stop
```

### 场景2: 快速部署更新
```bash
# 修改完代码后一键部署
cc sync                # 自动: 提交→推送→部署

# 或者分步操作
cc commit              # 先提交
cc d                   # 再部署
```

### 场景3: 服务器维护
```bash
# 检查服务器状态
cc status

# 查看运行日志
cc logs

# 创建备份
cc backup
```

### 场景4: 分支管理
```bash
# 查看和切换分支
cc branch

# 或使用Git管理界面
cc git
```

## 📊 效率对比

| 操作 | 传统方式 | 快捷命令 | 命令数量 | 时间节省 |
|------|----------|----------|----------|----------|
| 启动本地服务 | `node server.js` | `cc s` | 1→1 | 60% ⚡ |
| 开发模式 | `nodemon server.js` | `cc dev` | 1→1 | 50% ⚡ |
| 快速部署 | `git add . && git commit -m "xxx" && git push origin main && ssh root@ip "cd /blog/blog_person_src && git pull origin main && pm2 restart blog_person"` | `cc d` | 4→1 | 90% 🚀 |
| 检查服务器 | `ssh root@ip "pm2 status && netstat -tuln \| grep 3001 && systemctl status nginx"` | `cc status` | 3→1 | 85% 🚀 |
| 查看日志 | `ssh root@ip "pm2 logs blog_person && tail /var/log/nginx/access.log"` | `cc logs` | 2→1 | 80% 🚀 |

## 🛠️ 详细命令说明

### 本地开发命令

#### `cc s` - 启动本地服务器
```bash
cc s
# 自动检测是否有npm start脚本，优先使用npm start
# 否则使用 node server.js
# 服务启动后可通过 http://localhost:3000 访问
```

#### `cc dev` - 开发模式启动
```bash
cc dev
# 使用nodemon启动，代码修改后自动重载
# 如果未安装nodemon，会提示安装并降级为普通模式
```

#### `cc stop` - 停止本地服务
```bash
cc stop
# Windows: 结束所有node.exe进程
# Linux/Mac: 结束匹配的node进程
```

### 部署命令

#### `cc d` - 快速部署
```bash
cc d
# 1. 检查是否有未提交的更改，询问是否提交
# 2. 推送代码到GitHub
# 3. SSH到服务器执行: git pull + pm2 restart
# 4. 显示访问地址
```

#### `cc full` - 完整部署
```bash
cc full
# 1. 检查部署脚本是否存在
# 2. 处理未提交的更改
# 3. 推送代码到GitHub  
# 4. 服务器端执行完整部署脚本 (带备份)
# 5. 自动回滚机制
```

#### `cc sync` - 同步部署
```bash
cc sync
# 相当于: cc push + cc d
# 一键完成从提交到部署的全流程
```

### 服务器管理命令

#### `cc status` - 检查服务器状态
```bash
cc status
# 显示:
# - PM2服务状态
# - 端口占用情况 (3001, 8081)
# - Nginx服务状态
# - 磁盘使用情况
```

#### `cc logs` - 查看服务器日志
```bash
cc logs
# 显示:
# - PM2应用日志 (最近20条)
# - Nginx访问日志 (最近10条)
# - Nginx错误日志 (最近5条)
```

#### `cc backup` - 创建服务器备份
```bash
cc backup
# 1. 在服务器 /blog/backups/ 目录创建备份
# 2. 备份文件名: blog_backup_YYYYMMDD_HHMMSS.tar.gz
# 3. 显示现有备份文件列表
```

### Git管理命令

#### `cc commit` - 快速提交
```bash
cc commit
# 1. 显示文件更改状态
# 2. 询问提交信息 (可使用默认信息)
# 3. 执行 git add . && git commit
```

#### `cc branch` - 分支管理
```bash
cc branch
# 1. 显示当前分支
# 2. 列出所有分支
# 3. 可输入分支名切换分支
```

## 🔧 自定义配置

### 修改服务器信息
编辑 `cc` 或 `cc.bat` 文件中的服务器配置:
```bash
# 修改服务器IP
ssh root@YOUR_SERVER_IP

# 修改项目路径
cd /YOUR/PROJECT/PATH
```

### 添加新命令
在 `cc` 文件中添加新的case分支:
```bash
"newcommand")
    echo "执行新命令..."
    # 添加您的命令逻辑
    ;;
```

### 修改快捷键
可以为常用命令设置更短的别名:
```bash
# 例如: cc s -> cc run
"run"|"r")
    start_local
    ;;
```

## ❗ 常见问题

### Q: 命令执行失败怎么办？
A: 
1. 检查是否在项目根目录 (有server.js和package.json)
2. 检查网络连接和SSH密钥配置
3. 运行 `cc status` 检查服务器状态

### Q: 如何查看详细错误信息？
A:
```bash
cc logs          # 查看服务器日志
cc status        # 查看服务状态
```

### Q: 部署失败如何回滚？
A: 使用完整部署 `cc full` 有自动回滚功能，或手动:
```bash
cc backup        # 先创建当前备份
# 然后SSH到服务器手动恢复
```

### Q: 如何更新快捷命令脚本？
A:
```bash
# 从GitHub拉取最新脚本
git pull origin main

# 重新设置执行权限 (Linux/Mac)
chmod +x cc
```

## 🎉 使用技巧

### 技巧1: 组合使用命令
```bash
cc backup && cc d    # 先备份再部署
cc status; cc logs   # 查看状态和日志
```

### 技巧2: 设置命令历史
```bash
# 添加到 ~/.bash_history 快速重用
cc d
cc status
cc logs
```

### 技巧3: 批量操作
```bash
# 创建批处理脚本
echo "cc backup" > quick_deploy.bat
echo "cc d" >> quick_deploy.bat
echo "cc status" >> quick_deploy.bat
```

---

## 📚 相关文档

- [完整部署指南](deploy/README.md)
- [安装说明](deploy/INSTALL-GUIDE.md)
- [快捷命令设置](deploy/SHORTCUTS-GUIDE.md)

## 🆘 获取帮助

如果遇到问题，请：
1. 运行 `cc help` 查看帮助
2. 检查 [troubleshooting 部分](#常见问题)
3. 查看详细日志: `cc logs`
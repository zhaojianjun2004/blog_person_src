# 快捷命令设置指南

## 🎯 设置永久别名

### Windows用户
在您的用户目录下创建或编辑 `Microsoft.PowerShell_profile.ps1` 文件：

```powershell
# 打开PowerShell配置文件
notepad $PROFILE

# 如果文件不存在，先创建
if (!(Test-Path -Path $PROFILE)) {
    New-Item -ItemType File -Path $PROFILE -Force
}
```

在配置文件中添加：
```powershell
# 博客管理别名
function cc { 
    param($command)
    if ($command) {
        & "D:\personal_blog\blog_person\cc.bat" $command
    } else {
        & "D:\personal_blog\blog_person\cc.bat"
    }
}

# 快速导航
function blog { Set-Location "D:\personal_blog\blog_person" }
```

### Linux/Mac用户
在 `~/.bashrc` 或 `~/.zshrc` 中添加：
```bash
# 博客管理别名
alias cc='bash /path/to/your/blog/cc'
alias blog='cd /path/to/your/blog'

# 或者设置函数，支持参数
cc() {
    bash /path/to/your/blog/cc "$@"
}
```

## 🚀 快捷命令使用方法

### 本地开发
```bash
cc s        # 启动本地服务器 (等同 node server.js)
cc dev      # 开发模式启动 (等同 nodemon server.js)
cc stop     # 停止本地服务
```

### 快速部署
```bash
cc d        # 快速部署 (git push + 服务器更新)
cc sync     # 同步所有 (提交 + 推送 + 部署)
cc full     # 完整部署 (带备份和安全检查)
```

### 日常管理
```bash
cc status   # 检查服务器状态
cc logs     # 查看服务器日志
cc backup   # 创建服务器备份
```

### Git管理
```bash
cc commit   # 快速提交
cc push     # 推送代码
cc branch   # 分支管理
```

## 📦 NPM脚本命令

您也可以使用npm命令：
```bash
npm start           # 启动本地服务
npm run dev         # 开发模式
npm run deploy      # 快速部署
npm run sync        # 同步部署
npm run status      # 服务器状态
npm run logs        # 服务器日志
```

## 💡 使用示例

### 典型开发流程
```bash
# 1. 进入项目目录
blog

# 2. 启动本地开发
cc dev

# 3. 修改代码后快速部署
cc sync

# 4. 查看服务器状态
cc status
```

### 紧急更新流程
```bash
# 1. 快速提交
cc commit

# 2. 立即部署
cc d

# 3. 检查状态
cc status
```

## 🔧 自定义配置

您可以根据需要修改 `cc` 和 `cc.bat` 文件来：
- 添加新的命令
- 修改服务器地址
- 自定义输出格式
- 添加更多安全检查

## ⚡ 性能对比

| 操作 | 传统方式 | 快捷命令 | 节省时间 |
|------|----------|----------|----------|
| 启动服务 | `node server.js` | `cc s` | ~60% |
| 快速部署 | 6-8个命令 | `cc d` | ~90% |
| 查看状态 | 多个SSH命令 | `cc status` | ~85% |
| 提交推送 | 3-4个Git命令 | `cc sync` | ~80% |

## 📝 命令速查表

```
📦 本地开发          🚀 部署命令          🔧 管理命令
cc s     启动服务    cc d     快速部署    cc status  状态检查  
cc dev   开发模式    cc full  完整部署    cc logs    查看日志
cc stop  停止服务    cc push  推送代码    cc backup  创建备份
cc test  运行测试    cc sync  同步部署    cc install 安装脚本

📝 Git管理
cc git     Git界面
cc branch  分支管理  
cc commit  快速提交
```

设置完成后，您就可以用最简洁的方式管理博客了！
# 博客开发部署完整工作流

## 🚀 一次性配置 (仅需执行一次)

### 1. 服务器端安装部署脚本
```bash
# 在本地项目目录执行
scp deploy/install-to-server.sh root@8.156.66.127:/tmp/

# SSH到服务器执行安装
ssh root@8.156.66.127
bash /tmp/install-to-server.sh
```

安装完成后，服务器将具备：
- 自动备份功能
- 完整部署脚本
- 快速更新脚本
- 状态检查脚本

### 2. 本地快捷命令设置 (可选但推荐)
```powershell
# Windows PowerShell - 编辑配置文件
notepad $PROFILE

# 添加别名 (修改为您的实际路径)
function cc { 
    param($command)
    & "D:\personal_blog\blog_person\cc.bat" $command 
}
```

## 💻 日常开发工作流

### 流程1: 本地开发测试
```bash
# 1. 启动本地开发服务器
cc dev

# 2. 在浏览器打开 http://localhost:3000 进行开发
# 3. 代码修改会自动重载

# 4. 测试完成后停止服务
cc stop
```

### 流程2: 快速部署 (最常用)
```bash
# 修改代码后，一键部署
cc d

# 或者使用npm命令
npm run deploy
```

**这个命令会自动完成：**
1. 检查未提交的更改并询问是否提交
2. 推送代码到GitHub
3. SSH到服务器拉取最新代码
4. 重启PM2服务
5. 显示访问地址

### 流程3: 完整安全部署 (重要更新时)
```bash
# 带备份的安全部署
cc full

# 或者使用npm命令  
npm run deploy-full
```

**比快速部署多了：**
- 服务器端自动备份
- 依赖检查和更新
- 更详细的错误处理
- 失败自动回滚

### 流程4: 服务器状态监控
```bash
# 检查服务器状态
cc status

# 查看运行日志
cc logs

# 创建手动备份
cc backup
```

## 📋 典型的一天工作流程

### 早上开始开发
```bash
# 1. 进入项目目录
cd D:\personal_blog\blog_person

# 2. 启动开发模式
cc dev

# 3. 开始编写代码...
```

### 中午快速部署测试
```bash
# 1. 停止本地服务
cc stop

# 2. 快速部署到服务器测试
cc d

# 3. 检查服务器状态
cc status
```

### 晚上完成工作
```bash
# 1. 最终安全部署
cc full

# 2. 确认部署成功
cc status

# 3. 查看访问日志
cc logs
```

## 🔧 命令选择指南

| 场景 | 推荐命令 | 说明 |
|------|----------|------|
| 本地开发 | `cc dev` | 自动重载，提高开发效率 |
| 小改动部署 | `cc d` | 快速部署，适合频繁更新 |
| 重要更新 | `cc full` | 完整部署，更安全可靠 |
| 紧急修复 | `cc sync` | 一键从提交到部署 |
| 状态检查 | `cc status` | 定期检查服务健康状态 |
| 问题排查 | `cc logs` | 查看详细运行日志 |

## ⚡ 效率对比

### 传统方式 vs 快捷命令

**部署一次更新：**
```bash
# 传统方式 (6-8个命令, ~2-3分钟)
git add .
git commit -m "更新内容"
git push origin main
ssh root@8.156.66.127
cd /blog/blog_person_src
git pull origin main
pm2 restart blog_person
exit

# 快捷命令方式 (1个命令, ~30秒)
cc d
```

**启动本地开发：**
```bash
# 传统方式
nodemon server.js

# 快捷命令方式  
cc dev
```

## 🛡️ 安全最佳实践

### 1. 分支管理
```bash
# 开发新功能时创建分支
cc branch

# 功能完成后合并到main
cc git  # 使用Git管理界面
```

### 2. 备份策略
```bash
# 重要更新前手动备份
cc backup

# 使用完整部署保证安全
cc full
```

### 3. 状态监控
```bash
# 部署后检查状态
cc status

# 定期查看日志
cc logs
```

## ❗ 常见问题快速解决

### 问题1: 本地服务启动失败
```bash
# 检查端口占用
cc stop

# 重新启动
cc s
```

### 问题2: 部署失败
```bash
# 查看服务器状态
cc status

# 查看错误日志
cc logs

# 使用完整部署重试
cc full
```

### 问题3: 服务器连接问题
```bash
# 检查SSH连接
ssh root@8.156.66.127 "echo 'connection test'"

# 检查服务器状态
cc status
```

## 🎯 推荐的开发节奏

### 开发阶段
- 使用 `cc dev` 本地开发
- 每个小功能完成后用 `cc d` 快速部署测试

### 测试阶段  
- 使用 `cc status` 监控服务状态
- 使用 `cc logs` 查看运行情况

### 发布阶段
- 使用 `cc full` 进行完整安全部署
- 部署后用 `cc status` 确认服务正常

---

## 🚀 立即开始

1. **安装脚本到服务器**: `scp deploy/install-to-server.sh root@8.156.66.127:/tmp/ && ssh root@8.156.66.127 "bash /tmp/install-to-server.sh"`

2. **开始开发**: `cc dev`

3. **快速部署**: `cc d`

4. **检查状态**: `cc status`

就这么简单！从复杂的多步骤操作变成了单个命令，大幅提升开发和部署效率。
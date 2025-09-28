# 部署脚本测试和验证清单

## 🔍 安装前检查清单

在运行安装脚本之前，请确认以下状态：

### ✅ 服务器当前状态
- [ ] 博客服务正在运行 (`pm2 status` 显示 blog_person 在线)
- [ ] 可以正常访问 http://8.156.66.127:8081
- [ ] 项目位于 `/blog/blog_person_src` 目录
- [ ] Git仓库状态正常
- [ ] 有root权限

### ✅ 备份确认
- [ ] 重要数据已备份（文章、配置等）
- [ ] 数据库备份（如果有）
- [ ] 当前运行版本确认可以回滚

## 🚀 安全安装步骤

### 步骤1: 上传安装脚本
```bash
# 在本地项目目录执行
scp deploy/install-to-server.sh root@8.156.66.127:/tmp/
```

### 步骤2: 运行环境检测
```bash
# 登录服务器
ssh root@8.156.66.127

# 运行安装脚本
chmod +x /tmp/install-to-server.sh
bash /tmp/install-to-server.sh
```

**安装脚本会检查：**
- PM2服务状态
- 端口占用情况
- Git仓库状态
- Nginx配置状态
- 并自动备份现有更改

### 步骤3: 验证安装
```bash
# 检查脚本是否安装成功
cd /blog/blog_person_src
ls -la deploy/

# 运行状态检查
bash deploy/status-check.sh
```

### 步骤4: 测试部署脚本
```bash
# 首次测试（建议先用快速更新）
bash deploy/quick-update.sh

# 确认服务正常后，可以使用完整部署
bash deploy/server-deploy.sh
```

## 🛡️ 安全保障机制

### 自动检测和保护
1. **服务保护**: 检测现有PM2服务，避免冲突
2. **Git保护**: 自动stash未提交的更改
3. **备份机制**: 自动创建项目备份
4. **回滚准备**: 保留多个版本备份

### 错误处理
- 任何步骤失败都会停止执行
- 提供详细的错误信息
- 保留现有服务运行状态

### 验证方式
- 端口检查确保服务运行
- PM2状态检查
- Nginx配置验证
- 健康检查URL访问测试

## ⚡ 脚本功能对比

| 脚本名称 | 功能 | 安全性 | 速度 | 推荐场景 |
|---------|------|--------|------|----------|
| `server-deploy.sh` | 完整部署+备份 | 🔒🔒🔒 | ⚡⚡ | 正式部署 |
| `quick-update.sh` | 快速更新 | 🔒🔒 | ⚡⚡⚡ | 紧急更新 |
| `status-check.sh` | 状态检查 | 🔒 | ⚡⚡⚡ | 日常监控 |

## 📝 部署日志示例

### 成功部署日志
```bash
======================================
     阿里云服务器自动部署脚本
======================================
[信息] 创建备份...
[成功] 备份已创建: /blog/backups/blog_backup_20250928_120000.tar.gz
[信息] 当前分支: main
[信息] 拉取main分支的最新代码...
[信息] 重启现有服务...
[成功] 服务运行正常，端口 3001 已开启
[信息] 重新加载Nginx配置...
======================================
          部署完成!
======================================
```

### 常见问题和解决方案

**问题1: PM2服务冲突**
```bash
# 解决方案：查看现有服务
pm2 status
pm2 describe blog_person
```

**问题2: Git状态异常**
```bash
# 解决方案：手动处理Git状态
git status
git stash  # 暂存更改
git pull origin main
```

**问题3: 端口被占用**
```bash
# 解决方案：检查端口占用
netstat -tuln | grep 3001
lsof -i :3001
```

## 🔧 故障恢复

### 快速恢复命令
```bash
# 恢复到最新备份
cd /blog
ls -la backups/
tar -xzf backups/blog_backup_YYYYMMDD_HHMMSS.tar.gz

# 重启服务
cd /blog/blog_person_src  
pm2 restart blog_person
```

### 联系方式
如果遇到问题，请提供：
1. 错误日志截图
2. `pm2 status` 输出
3. `bash deploy/status-check.sh` 输出
# 自动化部署脚本使用说明

本目录包含了一套完整的自动化部署脚本，让您可以安全快速地将博客更新部署到阿里云服务器。

## 脚本文件说明

### 1. `local-deploy.bat` (Windows本地部署脚本)
- **用途**: 在Windows本地运行，自动提交代码到GitHub并部署到服务器
- **新增功能**: 
  - **选择性文件提交**: 可以选择只提交部分文件
  - **分支管理**: 支持开发分支和主分支的安全合并流程
  - **风险控制**: 多重确认机制，避免误操作
  - **自动备份**: 部署前自动创建服务器备份

### 2. `quick-deploy.sh` (快速部署脚本)
- **用途**: 在Linux/Mac本地运行，一键部署
- **功能**: 与Windows版本相同，包含所有安全控制功能

### 3. `server-deploy.sh` (服务器端部署脚本)
- **用途**: 在阿里云服务器上运行
- **功能**: 
  - 自动备份当前版本
  - **智能分支处理**: 自动切换到main分支拉取
  - **服务热重启**: 使用 `pm2 restart` 而非停止再启动
  - 失败时自动回滚
  - **路径适配**: 使用您的实际路径 `/blog/blog_person_src`

### 4. `server-setup.sh` (服务器环境配置脚本)
- **用途**: 初次配置阿里云服务器环境
- **更新**: 适配新的项目路径结构

### 5. `git-helper.sh` (Git分支管理辅助工具) **[新增]**
- **用途**: 提供友好的Git分支管理界面
- **功能**: 
  - 查看Git状态和分支信息
  - 创建新开发分支
  - 安全的分支切换（处理未提交更改）
  - 智能分支合并（避免冲突）

## 使用方法

### 🚀 阿里云现有环境安装（推荐）
如果您的阿里云服务器已经在运行博客，使用以下安全方式安装脚本：

```bash
# 1. 上传安装脚本到服务器
scp deploy/install-to-server.sh root@8.156.66.127:/tmp/

# 2. 在服务器上运行安装脚本
ssh root@8.156.66.127
chmod +x /tmp/install-to-server.sh
bash /tmp/install-to-server.sh
```

**安装脚本会：**
- ✅ 检测现有环境状态
- ✅ 备份当前Git更改
- ✅ 安全安装部署脚本
- ✅ 不影响正在运行的服务

### ⚠️ 重要提示

#### 现有环境兼容性
- ✅ **完全兼容**: 脚本设计为与现有部署完全兼容
- ✅ **无服务中断**: 使用 `pm2 restart` 而非 `stop/start`，确保服务连续性
- ✅ **自动备份**: 每次操作前自动备份，安全无风险
- ✅ **路径适配**: 使用您的实际路径 `/blog/blog_person_src`

#### 脚本选择建议
- **首次使用**: 运行 `install-to-server.sh` 安装脚本
- **日常更新**: 使用 `server-deploy.sh` 完整部署
- **紧急更新**: 使用 `quick-update.sh` 快速更新
- **状态检查**: 使用 `status-check.sh` 检查服务状态

### 首次配置服务器
```bash
# 在阿里云服务器上运行
wget https://raw.githubusercontent.com/zhaojianjun2004/blog_person_src/main/deploy/server-setup.sh
chmod +x server-setup.sh
./server-setup.sh
```

### 🎯 日常部署更新

#### 1. 服务器端部署（推荐）
```bash
# 在阿里云服务器上运行
cd /blog/blog_person_src

# 完整部署（带备份和安全检查）
bash deploy/server-deploy.sh

# 或者快速更新（仅pull和restart）
bash deploy/quick-update.sh

# 检查服务状态
bash deploy/status-check.sh
```

#### 1. 服务器端部署（推荐）
```bash
# 在阿里云服务器上运行
cd /blog/blog_person_src

# 完整部署（带备份和安全检查）
bash deploy/server-deploy.sh

# 或者快速更新（仅pull和restart）
bash deploy/quick-update.sh
```

#### 2. 本地一键部署

##### Windows用户
```cmd
# 在本地项目目录下运行
deploy\local-deploy.bat
```

#### Linux/Mac用户
```bash
# 在本地项目目录下运行
chmod +x deploy/quick-deploy.sh
./deploy/quick-deploy.sh
```

### Git分支管理（推荐工作流程）

#### 使用分支管理工具
```bash
# 启动Git管理界面
chmod +x deploy/git-helper.sh
./deploy/git-helper.sh
```

#### 推荐的开发流程
1. **创建开发分支**: 使用git-helper创建新的feature分支
2. **开发和测试**: 在开发分支上进行修改
3. **合并到主分支**: 使用脚本安全合并到main分支
4. **部署**: 运行部署脚本将main分支部署到服务器

### 手动服务器部署
```bash
# 在服务器上运行（路径已更新为 /blog/blog_person_src）
cd /blog/blog_person_src
bash deploy/server-deploy.sh
```

## ⚠️ 重要提示

### 现有环境兼容性
- ✅ **完全兼容**: 脚本设计为与现有部署完全兼容
- ✅ **无服务中断**: 使用 `pm2 restart` 而非 `stop/start`，确保服务连续性
- ✅ **自动备份**: 每次操作前自动备份，安全无风险
- ✅ **路径适配**: 使用您的实际路径 `/blog/blog_person_src`

### 脚本选择建议
- **首次使用**: 运行 `install-to-server.sh` 安装脚本
- **日常更新**: 使用 `server-deploy.sh` 完整部署
- **紧急更新**: 使用 `quick-update.sh` 快速更新
- **状态检查**: 使用 `status-check.sh` 检查服务状态



### 🛡️ **风险控制机制**
1. **选择性文件提交**: 可以选择只提交特定文件，避免误提交
2. **分支安全管理**: 开发分支与主分支分离，避免直接污染主分支
3. **多重确认**: 关键操作都需要用户确认
4. **自动检测冲突**: 合并前自动检测并处理分支冲突

### 🔄 **部署安全保障**
1. **多重备份保护**: 自动备份，保留最新5个版本
2. **失败回滚**: 部署过程中任何步骤失败都会自动回滚
3. **健康检查**: 确保服务正常运行才算部署成功
4. **详细日志**: 每个步骤都有清晰的状态提示

### 📝 **智能分支处理**
1. **自动分支检测**: 脚本会自动检测当前分支状态
2. **安全合并流程**: 提供安全的分支合并选项
3. **未提交更改保护**: 自动处理未提交的更改（stash/commit）
4. **远程同步**: 确保本地和远程分支同步

## 配置说明

在使用脚本前，请确保以下配置正确：

### SSH配置
确保本地可以通过SSH密钥登录服务器：
```bash
ssh root@8.156.66.127
```

如果无法免密登录，请配置SSH密钥：
```bash
# 在本地生成密钥（如果没有）
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 将公钥复制到服务器
ssh-copy-id root@8.156.66.127
```

### 服务器信息
如果服务器IP地址有变化，请修改以下文件中的IP地址：
- `local-deploy.bat`
- `quick-deploy.sh`
- `server-setup.sh`

## 常见问题

### 1. SSH连接失败
- 检查服务器IP是否正确
- 确保SSH密钥配置正确
- 检查阿里云安全组是否开放22端口

### 2. 部署失败
- 查看部署日志获取详细错误信息
- 脚本会自动回滚到上一个版本
- 可以手动运行 `pm2 logs blog_person` 查看应用日志

### 3. 服务无法访问
- 检查防火墙设置
- 确认阿里云安全组开放了8081端口
- 检查Nginx配置是否正确

## 高级功能

### 自定义部署
您可以根据需要修改脚本中的配置变量：
- 服务器地址
- 端口号
- 项目路径
- 备份保留数量

### 添加部署钩子
在 `server-deploy.sh` 中可以添加自定义的部署前后钩子：
```bash
# 部署前钩子
pre_deploy_hook() {
    # 在这里添加部署前需要执行的命令
}

# 部署后钩子
post_deploy_hook() {
    # 在这里添加部署后需要执行的命令
}
```

## 监控和日志

### 查看服务状态
```bash
pm2 status
pm2 logs blog_person
```

### 查看Nginx状态
```bash
systemctl status nginx
tail -f /var/log/nginx/error.log
```

### 查看备份
```bash
ls -la /root/backups/
```
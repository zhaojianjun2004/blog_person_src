#!/bin/bash

# 服务器端部署脚本
# 用于在阿里云服务器上自动拉取代码并重新部署博客

set -e  # 出错时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_DIR="/blog/blog_person_src"
BACKUP_DIR="/blog/backups"
SERVICE_NAME="blog_person"
NODE_PORT="3001"
MAX_BACKUPS=5

# 日志函数
log_info() {
    echo -e "${BLUE}[信息]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[成功]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[警告]${NC} $1"
}

log_error() {
    echo -e "${RED}[错误]${NC} $1"
}

# 检查服务状态
check_service_status() {
    if pm2 describe $SERVICE_NAME > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# 检查端口占用
check_port() {
    if netstat -tuln | grep ":$NODE_PORT " > /dev/null; then
        return 0
    else
        return 1
    fi
}

# 创建备份
create_backup() {
    log_info "创建备份..."
    
    # 创建备份目录
    mkdir -p $BACKUP_DIR
    
    # 创建时间戳
    timestamp=$(date +"%Y%m%d_%H%M%S")
    backup_file="$BACKUP_DIR/blog_backup_$timestamp.tar.gz"
    
    # 创建备份
    if [ -d "$PROJECT_DIR" ]; then
        cd $(dirname $PROJECT_DIR)
        tar -czf $backup_file $(basename $PROJECT_DIR) 2>/dev/null || {
            log_error "备份创建失败"
            return 1
        }
        log_success "备份已创建: $backup_file"
        
        # 清理旧备份（保留最新的MAX_BACKUPS个）
        cleanup_old_backups
    else
        log_warning "项目目录不存在，跳过备份"
    fi
}

# 清理旧备份
cleanup_old_backups() {
    backup_count=$(ls -1 $BACKUP_DIR/blog_backup_*.tar.gz 2>/dev/null | wc -l)
    if [ $backup_count -gt $MAX_BACKUPS ]; then
        log_info "清理旧备份文件..."
        ls -1t $BACKUP_DIR/blog_backup_*.tar.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f
        log_success "旧备份文件已清理"
    fi
}

# 恢复备份
restore_backup() {
    log_warning "尝试恢复最新备份..."
    latest_backup=$(ls -1t $BACKUP_DIR/blog_backup_*.tar.gz 2>/dev/null | head -n 1)
    
    if [ -n "$latest_backup" ]; then
        # 停止服务
        if check_service_status; then
            pm2 stop $SERVICE_NAME
        fi
        
        # 删除当前项目目录
        rm -rf $PROJECT_DIR
        
        # 恢复备份
        cd $(dirname $PROJECT_DIR)
        tar -xzf $latest_backup
        
        # 重新安装依赖并启动
        cd $PROJECT_DIR
        npm install --production
        pm2 start server.js --name $SERVICE_NAME
        
        log_success "备份恢复完成"
        return 0
    else
        log_error "没有找到备份文件"
        return 1
    fi
}

# 主部署流程
main_deploy() {
    echo "======================================"
    echo "     阿里云服务器自动部署脚本"
    echo "======================================"
    echo
    
    # 检查项目目录
    if [ ! -d "$PROJECT_DIR" ]; then
        log_error "项目目录不存在: $PROJECT_DIR"
        log_info "请先克隆项目到服务器"
        exit 1
    fi
    
    # 创建备份
    create_backup
    
    # 进入项目目录
    cd $PROJECT_DIR
    
    # 检查Git状态
    log_info "检查Git仓库状态..."
    if [ ! -d ".git" ]; then
        log_error "不是Git仓库"
        exit 1
    fi
    
    # 保存当前分支
    current_branch=$(git branch --show-current)
    log_info "当前分支: $current_branch"
    
    # 检查是否在main分支
    if [ "$current_branch" != "main" ]; then
        log_warning "当前不在main分支，正在切换..."
        git checkout main
        if [ $? -ne 0 ]; then
            log_error "切换到main分支失败"
            restore_backup
            exit 1
        fi
    fi
    
    # 暂存本地更改（如果有）
    if ! git diff --quiet || ! git diff --cached --quiet; then
        log_warning "检测到本地更改，正在暂存..."
        git stash push -m "deploy-stash-$(date +%Y%m%d_%H%M%S)"
    fi
    
    # 拉取最新代码
    log_info "拉取main分支的最新代码..."
    if ! git pull origin main; then
        log_error "拉取代码失败"
        # 尝试恢复备份
        restore_backup
        exit 1
    fi
    
    # 检查是否有package.json更新
    if git diff HEAD~1 --name-only | grep -q "package.json"; then
        log_info "检测到package.json更改，重新安装依赖..."
        npm install --production
    fi
    
    # 重启服务
    if check_service_status; then
        log_info "重启现有服务..."
        pm2 restart $SERVICE_NAME
    else
        log_info "启动服务..."
        pm2 start server.js --name $SERVICE_NAME
    fi
    
    if [ $? -eq 0 ]; then
        log_success "服务重启成功"
    else
        log_error "服务重启失败"
        # 尝试恢复备份
        restore_backup
        exit 1
    fi
    
    # 等待服务启动
    sleep 3
    
    # 检查服务状态
    if check_port; then
        log_success "服务运行正常，端口 $NODE_PORT 已开启"
        log_success "访问地址: http://$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_SERVER_IP"):8081"
    else
        log_error "服务可能未正常启动，请检查日志"
        pm2 logs $SERVICE_NAME --lines 10
        exit 1
    fi
    
    # 重新加载Nginx（如果需要）
    if systemctl is-active --quiet nginx; then
        log_info "重新加载Nginx配置..."
        systemctl reload nginx
    fi
    
    echo
    echo "======================================"
    echo "          部署完成!"
    echo "======================================"
    pm2 status
}

# 错误处理
trap 'log_error "部署过程中发生错误，正在尝试恢复..."; restore_backup; exit 1' ERR

# 执行主部署流程
main_deploy
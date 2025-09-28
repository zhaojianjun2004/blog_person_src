#!/bin/bash

# 阿里云环境检测和脚本安装工具
# 用于检测现有环境并安全安装部署脚本

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

echo "======================================"
echo "     阿里云环境检测和脚本安装"
echo "======================================"

# 检测当前环境
log_info "检测当前环境..."

# 检查项目目录
PROJECT_DIR="/blog/blog_person_src"
if [ -d "$PROJECT_DIR" ]; then
    log_success "项目目录存在: $PROJECT_DIR"
    cd $PROJECT_DIR
else
    log_error "项目目录不存在: $PROJECT_DIR"
    exit 1
fi

# 检查Git状态
if [ -d ".git" ]; then
    log_success "Git仓库正常"
    current_branch=$(git branch --show-current 2>/dev/null || echo "unknown")
    log_info "当前分支: $current_branch"
    
    # 检查是否有未提交的更改
    if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
        log_warning "检测到未提交的更改:"
        git status --short
        read -p "是否备份当前更改? (Y/n): " backup_changes
        if [ "$backup_changes" != "n" ] && [ "$backup_changes" != "N" ]; then
            git stash push -m "环境检测前的备份 - $(date '+%Y%m%d_%H%M%S')"
            log_success "更改已备份到stash"
        fi
    else
        log_success "Git状态干净"
    fi
else
    log_error "不是Git仓库"
    exit 1
fi

# 检查PM2服务
log_info "检查PM2服务状态..."
if command -v pm2 &> /dev/null; then
    log_success "PM2已安装"
    
    if pm2 describe blog_person > /dev/null 2>&1; then
        log_success "blog_person服务正在运行"
        pm2 describe blog_person | grep -E "(status|pid|uptime)"
    else
        log_warning "blog_person服务未找到"
    fi
else
    log_error "PM2未安装"
    exit 1
fi

# 检查端口
log_info "检查端口占用..."
if netstat -tuln | grep ":3001 " > /dev/null; then
    log_success "端口3001已被使用（应该是blog服务）"
else
    log_warning "端口3001未被占用"
fi

if netstat -tuln | grep ":8081 " > /dev/null; then
    log_success "端口8081已被使用（Nginx代理）"
else
    log_warning "端口8081未被占用"
fi

# 检查Nginx
if systemctl is-active --quiet nginx; then
    log_success "Nginx服务运行正常"
else
    log_warning "Nginx服务可能未运行"
fi

echo
log_info "环境检测完成！"
echo "======================================"

# 询问是否安装部署脚本
read -p "是否安装自动化部署脚本? (Y/n): " install_scripts
if [ "$install_scripts" = "n" ] || [ "$install_scripts" = "N" ]; then
    log_info "脚本安装已取消"
    exit 0
fi

# 创建deploy目录
log_info "创建deploy目录..."
mkdir -p deploy

# 创建备份目录
log_info "创建备份目录..."
mkdir -p /blog/backups

# 下载部署脚本（从GitHub或提供本地版本）
log_info "安装部署脚本..."

# 创建服务器端部署脚本
cat > deploy/server-deploy.sh << 'EOF'
#!/bin/bash

# 服务器端部署脚本
# 用于在阿里云服务器上自动拉取代码并重新部署博客

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置变量
PROJECT_DIR="/blog/blog_person_src"
BACKUP_DIR="/blog/backups"
SERVICE_NAME="blog_person"
NODE_PORT="3001"
MAX_BACKUPS=5

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
    mkdir -p $BACKUP_DIR
    
    timestamp=$(date +"%Y%m%d_%H%M%S")
    backup_file="$BACKUP_DIR/blog_backup_$timestamp.tar.gz"
    
    if [ -d "$PROJECT_DIR" ]; then
        cd $(dirname $PROJECT_DIR)
        tar -czf $backup_file $(basename $PROJECT_DIR) 2>/dev/null || {
            log_error "备份创建失败"
            return 1
        }
        log_success "备份已创建: $backup_file"
        
        # 清理旧备份
        backup_count=$(ls -1 $BACKUP_DIR/blog_backup_*.tar.gz 2>/dev/null | wc -l)
        if [ $backup_count -gt $MAX_BACKUPS ]; then
            log_info "清理旧备份文件..."
            ls -1t $BACKUP_DIR/blog_backup_*.tar.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f
        fi
    fi
}

# 主部署流程
main_deploy() {
    echo "======================================"
    echo "     阿里云服务器自动部署脚本"
    echo "======================================"
    
    if [ ! -d "$PROJECT_DIR" ]; then
        log_error "项目目录不存在: $PROJECT_DIR"
        exit 1
    fi
    
    # 创建备份
    create_backup
    
    # 进入项目目录
    cd $PROJECT_DIR
    
    # 检查Git状态
    if [ ! -d ".git" ]; then
        log_error "不是Git仓库"
        exit 1
    fi
    
    # 保存当前分支并切换到main
    current_branch=$(git branch --show-current)
    log_info "当前分支: $current_branch"
    
    if [ "$current_branch" != "main" ]; then
        log_warning "当前不在main分支，正在切换..."
        if ! git checkout main; then
            log_error "切换到main分支失败"
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
        exit 1
    fi
    
    # 检查package.json更新
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
    
    # 重新加载Nginx
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

# 执行主部署流程
main_deploy
EOF

# 创建快速更新脚本（简化版）
cat > deploy/quick-update.sh << 'EOF'
#!/bin/bash

# 快速更新脚本
# 只执行git pull和pm2 restart，不做备份

set -e

PROJECT_DIR="/blog/blog_person_src"
SERVICE_NAME="blog_person"

echo "======================================"
echo "        快速更新脚本"
echo "======================================"

cd $PROJECT_DIR

echo "[信息] 拉取最新代码..."
git pull origin main

echo "[信息] 重启服务..."
pm2 restart $SERVICE_NAME

echo "[成功] 更新完成!"
pm2 status
EOF

# 创建服务状态检查脚本
cat > deploy/status-check.sh << 'EOF'
#!/bin/bash

# 服务状态检查脚本

echo "======================================"
echo "        服务状态检查"
echo "======================================"

echo "PM2服务状态:"
pm2 status

echo
echo "端口占用情况:"
netstat -tuln | grep -E ":(3001|8081) "

echo
echo "Nginx状态:"
systemctl status nginx --no-pager -l | head -10

echo
echo "最近的应用日志:"
pm2 logs blog_person --lines 5 --nostream
EOF

# 设置执行权限
chmod +x deploy/*.sh

log_success "部署脚本安装完成!"
echo
echo "可用的脚本："
echo "1. deploy/server-deploy.sh    - 完整部署（带备份）"
echo "2. deploy/quick-update.sh     - 快速更新（仅pull+restart）"  
echo "3. deploy/status-check.sh     - 状态检查"
echo
echo "使用方法："
echo "cd /blog/blog_person_src"
echo "bash deploy/server-deploy.sh      # 完整部署"
echo "bash deploy/quick-update.sh       # 快速更新"
echo "bash deploy/status-check.sh       # 检查状态"

echo
log_info "建议先运行状态检查：bash deploy/status-check.sh"
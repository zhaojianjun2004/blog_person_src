#!/bin/bash

# 服务器环境一键配置脚本
# 用于初始化阿里云服务器环境

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
echo "    阿里云服务器环境配置脚本"
echo "======================================"

# 更新系统
log_info "更新系统包..."
yum update -y

# 安装基础工具
log_info "安装基础工具..."
yum install -y git curl wget vim

# 安装Node.js
log_info "安装Node.js..."
if ! command -v node &> /dev/null; then
    curl -sL https://rpm.nodesource.com/setup_16.x | bash -
    yum install -y nodejs
    log_success "Node.js 安装完成: $(node -v)"
else
    log_success "Node.js 已安装: $(node -v)"
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    log_warning "npm 未找到，重新安装..."
    yum install -y npm
fi
log_success "npm 版本: $(npm -v)"

# 安装PM2
log_info "安装PM2..."
npm install -g pm2
log_success "PM2 安装完成"

# 安装Nginx
log_info "安装Nginx..."
if ! command -v nginx &> /dev/null; then
    yum install -y nginx
    log_success "Nginx 安装完成"
else
    log_success "Nginx 已安装"
fi

# 启动并启用Nginx
systemctl start nginx
systemctl enable nginx

# 配置防火墙
log_info "配置防火墙..."
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-port=8081/tcp
firewall-cmd --reload
log_success "防火墙配置完成"

# 克隆项目（如果不存在）
PROJECT_DIR="/blog/blog_person_src"
if [ ! -d "$PROJECT_DIR" ]; then
    log_info "创建blog目录..."
    mkdir -p /blog
    log_info "克隆博客项目..."
    git clone https://github.com/zhaojianjun2004/blog_person_src.git $PROJECT_DIR
    cd $PROJECT_DIR
    
    # 安装依赖
    log_info "安装项目依赖..."
    npm install --production
    
    # 启动服务
    log_info "启动博客服务..."
    pm2 start server.js --name blog_person
    pm2 startup
    pm2 save
    
    log_success "项目部署完成"
else
    log_success "项目已存在: $PROJECT_DIR"
fi

# 配置Nginx
log_info "配置Nginx..."
cat > /etc/nginx/conf.d/blog_person.conf << 'EOF'
server {
    listen 8081;
    server_name 8.156.66.127;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# 测试Nginx配置
nginx -t
systemctl reload nginx

# 配置SELinux（如果启用）
if command -v getenforce &> /dev/null && [ "$(getenforce)" = "Enforcing" ]; then
    log_info "配置SELinux..."
    setsebool -P httpd_can_network_connect 1
    log_success "SELinux 配置完成"
fi

echo
echo "======================================"
echo "        环境配置完成!"
echo "======================================"
log_success "博客访问地址: http://8.156.66.127:8081"
log_success "服务状态:"
pm2 status
systemctl status nginx --no-pager -l
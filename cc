#!/bin/bash

# 博客管理脚本 - 统一命令入口
# 使用方法: bash cc [命令] 或设置别名 alias cc="bash cc"

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 检查是否在项目根目录
if [ ! -f "server.js" ] && [ ! -f "package.json" ]; then
    echo -e "${RED}[错误]${NC} 请在博客项目根目录下运行此脚本"
    exit 1
fi

# 显示Logo和帮助
show_help() {
    echo -e "${CYAN}"
    echo "  ╔═══════════════════════════════════╗"
    echo "  ║          博客管理工具             ║"
    echo "  ║        Blog Manager v1.0         ║"
    echo "  ╚═══════════════════════════════════╝"
    echo -e "${NC}"
    echo -e "${BLUE}用法:${NC} bash cc [命令] 或设置别名: ${YELLOW}alias cc='bash cc'${NC}"
    echo
    echo -e "${GREEN}📦 本地开发命令:${NC}"
    echo -e "  ${YELLOW}s${NC}      启动本地服务器 (npm start)"
    echo -e "  ${YELLOW}dev${NC}    开发模式启动"
    echo -e "  ${YELLOW}stop${NC}   停止本地服务"
    echo -e "  ${YELLOW}test${NC}   运行测试"
    echo
    echo -e "${GREEN}🚀 部署命令:${NC}"
    echo -e "  ${YELLOW}d${NC}      快速部署到服务器"
    echo -e "  ${YELLOW}deploy${NC} 完整部署 (备份+安全检查)"
    echo -e "  ${YELLOW}push${NC}   推送代码到GitHub"
    echo -e "  ${YELLOW}sync${NC}   同步: 推送+部署"
    echo
    echo -e "${GREEN}🔧 管理命令:${NC}"
    echo -e "  ${YELLOW}status${NC} 检查服务器状态"
    echo -e "  ${YELLOW}logs${NC}   查看服务器日志"
    echo -e "  ${YELLOW}backup${NC} 创建服务器备份"
    echo -e "  ${YELLOW}install${NC} 安装部署脚本到服务器"
    echo
    echo -e "${GREEN}📝 Git管理:${NC}"
    echo -e "  ${YELLOW}git${NC}    打开Git管理界面"
    echo -e "  ${YELLOW}branch${NC} 分支管理"
    echo -e "  ${YELLOW}commit${NC} 快速提交"
    echo
    echo -e "${GREEN}💡 示例:${NC}"
    echo -e "  ${CYAN}bash cc s${NC}      # 启动本地服务"
    echo -e "  ${CYAN}bash cc d${NC}      # 快速部署"
    echo -e "  ${CYAN}bash cc sync${NC}   # 推送并部署"
    echo
}

# 本地服务管理
start_local() {
    echo -e "${GREEN}🚀 启动本地服务器...${NC}"
    
    if [ -f "package.json" ]; then
        # 检查是否有start脚本
        if npm run | grep -q "start"; then
            echo -e "${BLUE}[信息]${NC} 使用 npm start 启动"
            npm start
        else
            echo -e "${BLUE}[信息]${NC} 使用 node server.js 启动"
            node server.js
        fi
    else
        node server.js
    fi
}

# 开发模式启动
start_dev() {
    echo -e "${GREEN}🔧 启动开发模式...${NC}"
    if command -v nodemon &> /dev/null; then
        nodemon server.js
    else
        echo -e "${YELLOW}[提示]${NC} 未安装nodemon，使用普通模式启动"
        echo -e "${YELLOW}[提示]${NC} 运行 'npm install -g nodemon' 安装开发工具"
        node server.js
    fi
}

# 停止本地服务
stop_local() {
    echo -e "${YELLOW}⏹️  停止本地服务...${NC}"
    
    # 查找并结束node进程
    if pgrep -f "node.*server.js" > /dev/null; then
        pkill -f "node.*server.js"
        echo -e "${GREEN}[成功]${NC} 本地服务已停止"
    elif pgrep -f "nodemon.*server.js" > /dev/null; then
        pkill -f "nodemon.*server.js"
        echo -e "${GREEN}[成功]${NC} 开发服务已停止"
    else
        echo -e "${BLUE}[信息]${NC} 没有运行的服务"
    fi
}

# 快速部署
quick_deploy() {
    echo -e "${GREEN}🚀 快速部署到服务器...${NC}"
    
    # 检查Git状态
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}[警告]${NC} 检测到未提交的更改"
        git status --short
        read -p "是否先提交这些更改? (Y/n): " commit_first
        
        if [ "$commit_first" != "n" ] && [ "$commit_first" != "N" ]; then
            quick_commit
        fi
    fi
    
    # 推送到GitHub
    echo -e "${BLUE}[信息]${NC} 推送到GitHub..."
    git push origin main
    
    # 部署到服务器
    echo -e "${BLUE}[信息]${NC} 部署到服务器..."
    ssh root@8.156.66.127 "cd /blog/blog_person_src && git pull origin main && pm2 restart blog_person"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[成功]${NC} 快速部署完成!"
        echo -e "${GREEN}[访问]${NC} http://8.156.66.127:8081"
    else
        echo -e "${RED}[错误]${NC} 部署失败"
        exit 1
    fi
}

# 完整部署
full_deploy() {
    echo -e "${GREEN}🛡️ 完整部署 (带备份和安全检查)...${NC}"
    
    # 检查是否有部署脚本
    if [ ! -f "deploy/server-deploy.sh" ]; then
        echo -e "${RED}[错误]${NC} 部署脚本不存在，请先运行: bash cc install"
        exit 1
    fi
    
    # 本地操作
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}[警告]${NC} 检测到未提交的更改"
        git status --short
        read -p "是否先提交这些更改? (Y/n): " commit_first
        
        if [ "$commit_first" != "n" ] && [ "$commit_first" != "N" ]; then
            quick_commit
        fi
    fi
    
    git push origin main
    
    # 服务器部署
    ssh root@8.156.66.127 "cd /blog/blog_person_src && bash deploy/server-deploy.sh"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[成功]${NC} 完整部署完成!"
        echo -e "${GREEN}[访问]${NC} http://8.156.66.127:8081"
    else
        echo -e "${RED}[错误]${NC} 部署失败"
        exit 1
    fi
}

# 推送代码
push_code() {
    echo -e "${GREEN}📤 推送代码到GitHub...${NC}"
    
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}[警告]${NC} 检测到未提交的更改"
        git status --short
        read -p "是否先提交这些更改? (Y/n): " commit_first
        
        if [ "$commit_first" != "n" ] && [ "$commit_first" != "N" ]; then
            quick_commit
        fi
    fi
    
    current_branch=$(git branch --show-current)
    git push origin $current_branch
    
    echo -e "${GREEN}[成功]${NC} 代码已推送到 $current_branch 分支"
}

# 同步操作
sync_all() {
    echo -e "${GREEN}🔄 同步: 推送代码并部署...${NC}"
    push_code
    quick_deploy
}

# 快速提交
quick_commit() {
    echo -e "${GREEN}💾 快速提交...${NC}"
    
    git status --short
    read -p "请输入提交信息 (回车使用默认): " commit_msg
    
    if [ -z "$commit_msg" ]; then
        commit_msg="更新博客内容 - $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    git add .
    git commit -m "$commit_msg"
    
    echo -e "${GREEN}[成功]${NC} 提交完成: $commit_msg"
}

# 检查服务器状态
check_status() {
    echo -e "${GREEN}📊 检查服务器状态...${NC}"
    
    ssh root@8.156.66.127 "
        echo -e '${BLUE}=== PM2 服务状态 ===${NC}'
        pm2 status
        echo
        echo -e '${BLUE}=== 端口占用情况 ===${NC}'
        netstat -tuln | grep -E ':(3001|8081) '
        echo
        echo -e '${BLUE}=== Nginx 状态 ===${NC}'
        systemctl status nginx --no-pager -l | head -5
        echo
        echo -e '${BLUE}=== 磁盘使用情况 ===${NC}'
        df -h | head -2
    "
}

# 查看服务器日志
view_logs() {
    echo -e "${GREEN}📋 查看服务器日志...${NC}"
    
    ssh root@8.156.66.127 "
        echo -e '${BLUE}=== PM2 应用日志 ===${NC}'
        pm2 logs blog_person --lines 20 --nostream
        echo
        echo -e '${BLUE}=== Nginx 访问日志 (最近10条) ===${NC}'
        tail -10 /var/log/nginx/access.log
        echo
        echo -e '${BLUE}=== Nginx 错误日志 (最近5条) ===${NC}'
        tail -5 /var/log/nginx/error.log
    "
}

# 创建备份
create_backup() {
    echo -e "${GREEN}💾 创建服务器备份...${NC}"
    
    ssh root@8.156.66.127 "
        cd /blog
        mkdir -p backups
        timestamp=\$(date +'%Y%m%d_%H%M%S')
        tar -czf backups/blog_backup_\$timestamp.tar.gz blog_person_src
        echo -e '${GREEN}[成功]${NC} 备份已创建: backups/blog_backup_'\$timestamp'.tar.gz'
        
        echo -e '${BLUE}=== 现有备份文件 ===${NC}'
        ls -la backups/blog_backup_*.tar.gz 2>/dev/null || echo '没有找到备份文件'
    "
}

# 安装部署脚本
install_scripts() {
    echo -e "${GREEN}🔧 安装部署脚本到服务器...${NC}"
    
    if [ ! -f "deploy/install-to-server.sh" ]; then
        echo -e "${RED}[错误]${NC} 部署脚本不存在"
        exit 1
    fi
    
    scp deploy/install-to-server.sh root@8.156.66.127:/tmp/
    ssh root@8.156.66.127 "chmod +x /tmp/install-to-server.sh && bash /tmp/install-to-server.sh"
    
    echo -e "${GREEN}[成功]${NC} 部署脚本安装完成"
}

# Git管理
git_manager() {
    if [ -f "deploy/git-helper.sh" ]; then
        bash deploy/git-helper.sh
    else
        echo -e "${RED}[错误]${NC} Git管理脚本不存在"
        echo -e "${BLUE}[提示]${NC} 请先运行: bash cc install"
    fi
}

# 分支管理
branch_manager() {
    echo -e "${GREEN}🌿 分支管理${NC}"
    echo
    echo "当前分支: $(git branch --show-current)"
    echo
    echo "所有分支:"
    git branch -a
    echo
    read -p "输入要切换的分支名 (回车取消): " branch_name
    
    if [ -n "$branch_name" ]; then
        git checkout $branch_name
        echo -e "${GREEN}[成功]${NC} 已切换到分支: $branch_name"
    fi
}

# 运行测试
run_test() {
    echo -e "${GREEN}🧪 运行测试...${NC}"
    
    if [ -f "package.json" ] && npm run | grep -q "test"; then
        npm test
    else
        echo -e "${YELLOW}[提示]${NC} 没有配置测试脚本"
        echo -e "${BLUE}[信息]${NC} 可以在package.json中添加test脚本"
    fi
}

# 主逻辑
case "${1:-help}" in
    "s"|"start")
        start_local
        ;;
    "dev")
        start_dev
        ;;
    "stop")
        stop_local
        ;;
    "test")
        run_test
        ;;
    "d"|"deploy")
        quick_deploy
        ;;
    "full"|"deploy-full")
        full_deploy
        ;;
    "push")
        push_code
        ;;
    "sync")
        sync_all
        ;;
    "status")
        check_status
        ;;
    "logs")
        view_logs
        ;;
    "backup")
        create_backup
        ;;
    "install")
        install_scripts
        ;;
    "git")
        git_manager
        ;;
    "branch")
        branch_manager
        ;;
    "commit")
        quick_commit
        ;;
    "help"|"h"|*)
        show_help
        ;;
esac
#!/bin/bash

# 快速部署脚本（一键部署）
# 在本地运行，自动提交代码并部署到服务器

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
SERVER_USER="root"
SERVER_HOST="8.156.66.127"
PROJECT_PATH="/blog/blog_person_src"

log_info() {
    echo -e "${BLUE}[信息]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[成功]${NC} $1"
}

log_error() {
    echo -e "${RED}[错误]${NC} $1"
}

echo "======================================"
echo "        一键快速部署脚本"
echo "======================================"

# 检查是否在Git仓库中
if [ ! -d ".git" ]; then
    log_error "请在Git仓库根目录下运行此脚本"
    exit 1
fi

# 检查是否有更改
if [ -n "$(git status --porcelain)" ]; then
    log_info "检测到文件更改"
    git status --short
    
    # 检查当前分支
    current_branch=$(git branch --show-current)
    log_info "当前分支: $current_branch"
    
    # 询问是否选择性提交
    echo
    read -p "是否需要选择性提交文件? (y/N): " selective
    if [ "$selective" = "y" ] || [ "$selective" = "Y" ]; then
        log_info "请手动选择要提交的文件，然后按回车继续..."
        echo "提示: 使用 git add [文件路径] 添加要提交的文件"
        echo "或者使用 git add . 添加所有文件"
        read -p "按回车继续..." dummy
    else
        git add .
    fi
    
    # 处理分支逻辑
    if [ "$current_branch" != "main" ]; then
        log_warning "当前不在main分支"
        echo "1. 切换到main分支并合并当前分支"
        echo "2. 直接在当前分支提交并推送"
        echo "3. 取消操作"
        read -p "请选择操作 (1/2/3): " branch_choice
        
        case $branch_choice in
            1)
                # 提交当前分支
                read -p "请输入提交信息 (回车使用默认信息): " commit_msg
                if [ -z "$commit_msg" ]; then
                    commit_msg="更新博客内容 - $(date '+%Y-%m-%d %H:%M:%S')"
                fi
                
                git commit -m "$commit_msg"
                git push origin $current_branch
                
                # 切换到main并合并
                git checkout main
                git pull origin main
                log_info "准备合并分支 $current_branch 到 main"
                read -p "确认合并? (y/N): " merge_confirm
                if [ "$merge_confirm" != "y" ] && [ "$merge_confirm" != "Y" ]; then
                    log_info "合并已取消"
                    exit 0
                fi
                
                git merge $current_branch
                git push origin main
                log_success "分支已合并并推送到main"
                ;;
            2)
                read -p "请输入提交信息 (回车使用默认信息): " commit_msg
                if [ -z "$commit_msg" ]; then
                    commit_msg="更新博客内容 - $(date '+%Y-%m-%d %H:%M:%S')"
                fi
                
                git commit -m "$commit_msg"
                git push origin $current_branch
                log_success "代码已推送到 $current_branch 分支"
                log_warning "服务器部署可能需要手动切换分支"
                ;;
            3)
                log_info "操作已取消"
                exit 0
                ;;
            *)
                log_error "无效选择"
                exit 1
                ;;
        esac
    else
        # 在main分支的常规操作
        read -p "请输入提交信息 (回车使用默认信息): " commit_msg
        if [ -z "$commit_msg" ]; then
            commit_msg="更新博客内容 - $(date '+%Y-%m-%d %H:%M:%S')"
        fi
        
        log_info "提交更改..."
        git commit -m "$commit_msg"
        
        log_info "推送到GitHub..."
        git push origin main
        
        log_success "代码已推送到GitHub"
    fi
else
    log_info "没有检测到文件更改"
fi

# 询问是否部署
echo
read -p "是否部署到阿里云服务器? (Y/n): " deploy_choice
if [ "$deploy_choice" = "n" ] || [ "$deploy_choice" = "N" ]; then
    log_info "部署已取消"
    exit 0
fi

# 部署到服务器
log_info "部署到服务器..."
ssh $SERVER_USER@$SERVER_HOST "cd $PROJECT_PATH && bash deploy/server-deploy.sh"

if [ $? -eq 0 ]; then
    echo
    echo "======================================"
    echo "        部署完成!"
    echo "======================================"
    log_success "博客已成功更新到: http://$SERVER_HOST:8081"
else
    log_error "部署失败，请检查服务器连接和配置"
    exit 1
fi
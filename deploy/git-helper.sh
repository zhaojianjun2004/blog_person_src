#!/bin/bash

# Git操作辅助脚本
# 提供常用的Git分支管理功能

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

# 显示当前Git状态
show_status() {
    echo "======================================"
    echo "        Git 状态信息"
    echo "======================================"
    
    current_branch=$(git branch --show-current)
    echo "当前分支: $current_branch"
    
    echo
    echo "分支列表:"
    git branch -a
    
    echo
    echo "文件状态:"
    if [ -n "$(git status --porcelain)" ]; then
        git status --short
    else
        echo "没有未提交的更改"
    fi
    
    echo
    echo "最近的提交:"
    git log --oneline -5
}

# 创建新分支
create_branch() {
    echo "======================================"
    echo "        创建新分支"
    echo "======================================"
    
    read -p "请输入新分支名称: " branch_name
    if [ -z "$branch_name" ]; then
        log_error "分支名称不能为空"
        return 1
    fi
    
    # 检查分支是否已存在
    if git show-ref --verify --quiet refs/heads/$branch_name; then
        log_error "分支 $branch_name 已存在"
        return 1
    fi
    
    # 确保在最新的main分支上创建
    git checkout main
    git pull origin main
    
    # 创建并切换到新分支
    git checkout -b $branch_name
    log_success "新分支 $branch_name 已创建并切换"
    
    # 推送到远程
    git push -u origin $branch_name
    log_success "分支已推送到远程仓库"
}

# 合并分支到main
merge_to_main() {
    echo "======================================"
    echo "        合并分支到main"
    echo "======================================"
    
    current_branch=$(git branch --show-current)
    
    if [ "$current_branch" = "main" ]; then
        log_error "当前已在main分支"
        return 1
    fi
    
    echo "当前分支: $current_branch"
    read -p "确认将 $current_branch 合并到 main? (y/N): " confirm
    
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        log_info "操作已取消"
        return 0
    fi
    
    # 确保当前分支的更改已提交
    if [ -n "$(git status --porcelain)" ]; then
        log_warning "检测到未提交的更改"
        git status --short
        read -p "是否先提交这些更改? (y/N): " commit_changes
        
        if [ "$commit_changes" = "y" ] || [ "$commit_changes" = "Y" ]; then
            read -p "请输入提交信息: " commit_msg
            if [ -z "$commit_msg" ]; then
                commit_msg="更新内容 - $(date '+%Y-%m-%d %H:%M:%S')"
            fi
            
            git add .
            git commit -m "$commit_msg"
            git push origin $current_branch
        else
            log_info "请先处理未提交的更改"
            return 1
        fi
    fi
    
    # 切换到main分支并更新
    git checkout main
    git pull origin main
    
    # 合并分支
    if git merge $current_branch; then
        log_success "分支合并成功"
        
        # 推送合并后的main分支
        git push origin main
        log_success "main分支已推送到远程"
        
        # 询问是否删除已合并的分支
        read -p "是否删除已合并的分支 $current_branch? (y/N): " delete_branch
        if [ "$delete_branch" = "y" ] || [ "$delete_branch" = "Y" ]; then
            git branch -d $current_branch
            git push origin --delete $current_branch
            log_success "分支 $current_branch 已删除"
        fi
    else
        log_error "合并失败，请手动解决冲突"
        return 1
    fi
}

# 切换分支
switch_branch() {
    echo "======================================"
    echo "        切换分支"
    echo "======================================"
    
    echo "可用分支:"
    git branch -a
    
    echo
    read -p "请输入要切换到的分支名称: " branch_name
    
    if [ -z "$branch_name" ]; then
        log_error "分支名称不能为空"
        return 1
    fi
    
    # 检查是否有未提交的更改
    if [ -n "$(git status --porcelain)" ]; then
        log_warning "检测到未提交的更改"
        git status --short
        echo "1. 暂存更改 (stash)"
        echo "2. 提交更改"
        echo "3. 放弃更改"
        echo "4. 取消操作"
        read -p "请选择操作 (1/2/3/4): " choice
        
        case $choice in
            1)
                git stash push -m "切换分支前的临时保存 - $(date '+%Y%m%d_%H%M%S')"
                log_info "更改已暂存"
                ;;
            2)
                read -p "请输入提交信息: " commit_msg
                if [ -z "$commit_msg" ]; then
                    commit_msg="切换分支前的提交 - $(date '+%Y-%m-%d %H:%M:%S')"
                fi
                git add .
                git commit -m "$commit_msg"
                ;;
            3)
                git reset --hard HEAD
                log_warning "未提交的更改已放弃"
                ;;
            4)
                log_info "操作已取消"
                return 0
                ;;
            *)
                log_error "无效选择"
                return 1
                ;;
        esac
    fi
    
    # 切换分支
    if git checkout $branch_name; then
        log_success "已切换到分支: $branch_name"
    else
        log_error "切换分支失败"
        return 1
    fi
}

# 主菜单
main_menu() {
    echo "======================================"
    echo "        Git 分支管理工具"
    echo "======================================"
    echo "1. 查看状态"
    echo "2. 创建新分支"
    echo "3. 切换分支"
    echo "4. 合并分支到main"
    echo "5. 退出"
    echo "======================================"
    
    read -p "请选择操作 (1-5): " choice
    
    case $choice in
        1) show_status ;;
        2) create_branch ;;
        3) switch_branch ;;
        4) merge_to_main ;;
        5) log_info "退出"; exit 0 ;;
        *) log_error "无效选择，请重试" ;;
    esac
    
    echo
    read -p "按回车键继续..." dummy
    main_menu
}

# 检查是否在Git仓库中
if [ ! -d ".git" ]; then
    log_error "请在Git仓库根目录下运行此脚本"
    exit 1
fi

# 启动主菜单
main_menu
@echo off
chcp 65001 > nul
echo ======================================
echo      本地博客自动部署脚本
echo ======================================
echo.

:: 检查是否在Git仓库中
if not exist ".git" (
    echo [错误] 请在Git仓库根目录下运行此脚本
    pause
    exit /b 1
)

:: 检查是否有未提交的更改
echo [信息] 检查Git状态...
git status --porcelain > temp_status.txt
if not "%errorlevel%"=="0" (
    echo [错误] Git命令执行失败
    del temp_status.txt 2>nul
    pause
    exit /b 1
)

:: 检查是否有更改
for /f %%i in ('type temp_status.txt ^| find /c /v ""') do set file_count=%%i
del temp_status.txt

if %file_count% equ 0 (
    echo [信息] 没有检测到文件更改
    set /p choice="是否继续部署到服务器? (y/N): "
    if /i not "%choice%"=="y" (
        echo [信息] 部署已取消
        pause
        exit /b 0
    )
) else (
    echo [信息] 检测到 %file_count% 个文件有更改
    
    :: 显示更改的文件
    echo [信息] 更改的文件:
    git status --short
    echo.
    
    :: 询问是否需要选择性提交文件
    set /p selective="是否需要选择性提交文件? (y/N): "
    if /i "%selective%"=="y" (
        echo [信息] 请手动选择要提交的文件，然后按任意键继续...
        echo [提示] 使用 git add [文件路径] 添加要提交的文件
        echo [提示] 或者使用 git add . 添加所有文件
        pause
    ) else (
        :: 自动添加所有更改
        git add .
    )
    
    :: 检查当前分支
    for /f "tokens=*" %%i in ('git branch --show-current') do set current_branch=%%i
    echo [信息] 当前分支: %current_branch%
    
    :: 如果不在main分支，询问是否切换或合并
    if not "%current_branch%"=="main" (
        echo [警告] 当前不在main分支
        echo 1. 切换到main分支并合并当前分支
        echo 2. 直接在当前分支提交并推送到 %current_branch%
        echo 3. 取消操作
        set /p branch_choice="请选择操作 (1/2/3): "
        
        if "%branch_choice%"=="1" (
            :: 提交当前分支的更改
            set /p commit_msg="请输入提交信息 (留空使用默认信息): "
            if "%commit_msg%"=="" set commit_msg=更新博客内容 - %date% %time%
            
            git commit -m "%commit_msg%"
            if not "%errorlevel%"=="0" (
                echo [错误] 提交失败
                pause
                exit /b 1
            )
            
            :: 推送当前分支
            git push origin %current_branch%
            
            :: 切换到main并合并
            git checkout main
            git pull origin main
            echo [信息] 准备合并分支 %current_branch% 到 main
            set /p merge_confirm="确认合并? (y/N): "
            if /i not "%merge_confirm%"=="y" (
                echo [信息] 合并已取消
                pause
                exit /b 0
            )
            
            git merge %current_branch%
            if not "%errorlevel%"=="0" (
                echo [错误] 合并失败，请手动解决冲突
                pause
                exit /b 1
            )
            
            :: 推送合并后的main分支
            git push origin main
            echo [成功] 分支已合并并推送到main
        ) else if "%branch_choice%"=="2" (
            :: 直接在当前分支操作
            set /p commit_msg="请输入提交信息 (留空使用默认信息): "
            if "%commit_msg%"=="" set commit_msg=更新博客内容 - %date% %time%
            
            git commit -m "%commit_msg%"
            git push origin %current_branch%
            echo [成功] 代码已推送到 %current_branch% 分支
            echo [警告] 服务器部署可能需要手动切换分支
        ) else (
            echo [信息] 操作已取消
            pause
            exit /b 0
        )
    ) else (
        :: 在main分支的常规操作
        set /p commit_msg="请输入提交信息 (留空使用默认信息): "
        if "%commit_msg%"=="" set commit_msg=更新博客内容 - %date% %time%
        
        :: 提交更改
        echo [信息] 提交更改到本地仓库...
        git commit -m "%commit_msg%"
        if not "%errorlevel%"=="0" (
            echo [错误] 提交失败
            pause
            exit /b 1
        )
        
        :: 推送到GitHub
        echo [信息] 推送到GitHub...
        git push origin main
        if not "%errorlevel%"=="0" (
            echo [错误] 推送到GitHub失败
            pause
            exit /b 1
        )
        echo [成功] 代码已推送到GitHub
    )
)

:: 询问是否部署到服务器
set /p deploy_choice="是否部署到阿里云服务器? (Y/n): "
if /i "%deploy_choice%"=="n" (
    echo [信息] 部署已取消
    pause
    exit /b 0
)

:: 部署到服务器
echo [信息] 开始部署到阿里云服务器...
echo [信息] 正在连接服务器并执行部署脚本...

:: 这里调用SSH部署命令
ssh root@8.156.66.127 "cd /blog/blog_person_src && bash deploy/server-deploy.sh"

if "%errorlevel%"=="0" (
    echo.
    echo ======================================
    echo        部署完成!
    echo ======================================
    echo 您的博客已成功更新到: http://8.156.66.127:8081
    echo.
) else (
    echo [错误] 服务器部署失败，请检查服务器连接和配置
)

pause
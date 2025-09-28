@echo off
chcp 65001 > nul

REM 博客管理脚本 - Windows版本
REM 使用方法: cc [命令]

if not exist "server.js" if not exist "package.json" (
    echo [错误] 请在博客项目根目录下运行此脚本
    pause
    exit /b 1
)

REM 显示帮助
if "%1"=="" goto :help
if "%1"=="help" goto :help
if "%1"=="h" goto :help

REM 本地服务管理
if "%1"=="s" goto :start
if "%1"=="start" goto :start
if "%1"=="dev" goto :dev
if "%1"=="stop" goto :stop
if "%1"=="test" goto :test

REM 部署命令
if "%1"=="d" goto :deploy
if "%1"=="deploy" goto :deploy
if "%1"=="full" goto :full_deploy
if "%1"=="push" goto :push
if "%1"=="sync" goto :sync

REM 管理命令
if "%1"=="status" goto :status
if "%1"=="logs" goto :logs
if "%1"=="backup" goto :backup
if "%1"=="install" goto :install

REM Git管理
if "%1"=="git" goto :git
if "%1"=="branch" goto :branch
if "%1"=="commit" goto :commit

goto :help

:help
echo.
echo   ╔═══════════════════════════════════╗
echo   ║          博客管理工具             ║
echo   ║        Blog Manager v1.0         ║
echo   ╚═══════════════════════════════════╝
echo.
echo 用法: cc [命令]
echo.
echo 📦 本地开发命令:
echo   s       启动本地服务器 (npm start)
echo   dev     开发模式启动
echo   stop    停止本地服务
echo   test    运行测试
echo.
echo 🚀 部署命令:
echo   d       快速部署到服务器
echo   full    完整部署 (备份+安全检查)
echo   push    推送代码到GitHub
echo   sync    同步: 推送+部署
echo.
echo 🔧 管理命令:
echo   status  检查服务器状态
echo   logs    查看服务器日志
echo   backup  创建服务器备份
echo   install 安装部署脚本到服务器
echo.
echo 📝 Git管理:
echo   git     打开Git管理界面
echo   branch  分支管理
echo   commit  快速提交
echo.
echo 💡 示例:
echo   cc s      # 启动本地服务
echo   cc d      # 快速部署
echo   cc sync   # 推送并部署
echo.
pause
exit /b 0

:start
echo 🚀 启动本地服务器...
if exist "package.json" (
    npm run | findstr "start" > nul
    if %errorlevel%==0 (
        echo [信息] 使用 npm start 启动
        npm start
    ) else (
        echo [信息] 使用 node server.js 启动
        node server.js
    )
) else (
    node server.js
)
goto :end

:dev
echo 🔧 启动开发模式...
where nodemon > nul 2>&1
if %errorlevel%==0 (
    nodemon server.js
) else (
    echo [提示] 未安装nodemon，使用普通模式启动
    echo [提示] 运行 'npm install -g nodemon' 安装开发工具
    node server.js
)
goto :end

:stop
echo ⏹️ 停止本地服务...
taskkill /f /im node.exe 2>nul
if %errorlevel%==0 (
    echo [成功] 本地服务已停止
) else (
    echo [信息] 没有运行的服务
)
goto :end

:test
echo 🧪 运行测试...
if exist "package.json" (
    npm run | findstr "test" > nul
    if %errorlevel%==0 (
        npm test
    ) else (
        echo [提示] 没有配置测试脚本
        echo [信息] 可以在package.json中添加test脚本
    )
) else (
    echo [提示] 没有找到package.json文件
)
goto :end

:deploy
echo 🚀 快速部署到服务器...
git status --porcelain > temp_status.txt
for /f %%i in ('type temp_status.txt ^| find /c /v ""') do set file_count=%%i
del temp_status.txt

if %file_count% gtr 0 (
    echo [警告] 检测到未提交的更改
    git status --short
    set /p commit_first="是否先提交这些更改? (Y/n): "
    if /i not "%commit_first%"=="n" (
        call :quick_commit
    )
)

echo [信息] 推送到GitHub...
git push origin main

echo [信息] 部署到服务器...
ssh root@8.156.66.127 "cd /blog/blog_person_src && git pull origin main && pm2 restart blog_person"

if %errorlevel%==0 (
    echo [成功] 快速部署完成!
    echo [访问] http://8.156.66.127:8081
) else (
    echo [错误] 部署失败
)
goto :end

:full_deploy
echo 🛡️ 完整部署 (带备份和安全检查)...
if not exist "deploy\server-deploy.sh" (
    echo [错误] 部署脚本不存在，请先运行: cc install
    goto :end
)

git status --porcelain > temp_status.txt
for /f %%i in ('type temp_status.txt ^| find /c /v ""') do set file_count=%%i
del temp_status.txt

if %file_count% gtr 0 (
    echo [警告] 检测到未提交的更改
    git status --short
    set /p commit_first="是否先提交这些更改? (Y/n): "
    if /i not "%commit_first%"=="n" (
        call :quick_commit
    )
)

git push origin main
ssh root@8.156.66.127 "cd /blog/blog_person_src && bash deploy/server-deploy.sh"

if %errorlevel%==0 (
    echo [成功] 完整部署完成!
    echo [访问] http://8.156.66.127:8081
) else (
    echo [错误] 部署失败
)
goto :end

:push
echo 📤 推送代码到GitHub...
git status --porcelain > temp_status.txt
for /f %%i in ('type temp_status.txt ^| find /c /v ""') do set file_count=%%i
del temp_status.txt

if %file_count% gtr 0 (
    echo [警告] 检测到未提交的更改
    git status --short
    set /p commit_first="是否先提交这些更改? (Y/n): "
    if /i not "%commit_first%"=="n" (
        call :quick_commit
    )
)

for /f "tokens=*" %%i in ('git branch --show-current') do set current_branch=%%i
git push origin %current_branch%
echo [成功] 代码已推送到 %current_branch% 分支
goto :end

:sync
echo 🔄 同步: 推送代码并部署...
call :push
call :deploy
goto :end

:status
echo 📊 检查服务器状态...
ssh root@8.156.66.127 "echo '=== PM2 服务状态 ===' && pm2 status && echo && echo '=== 端口占用情况 ===' && netstat -tuln | grep -E ':(3001|8081) ' && echo && echo '=== Nginx 状态 ===' && systemctl status nginx --no-pager -l | head -5"
goto :end

:logs
echo 📋 查看服务器日志...
ssh root@8.156.66.127 "echo '=== PM2 应用日志 ===' && pm2 logs blog_person --lines 20 --nostream && echo && echo '=== Nginx 访问日志 ===' && tail -10 /var/log/nginx/access.log"
goto :end

:backup
echo 💾 创建服务器备份...
ssh root@8.156.66.127 "cd /blog && mkdir -p backups && timestamp=$(date +%%Y%%m%%d_%%H%%M%%S) && tar -czf backups/blog_backup_$timestamp.tar.gz blog_person_src && echo '[成功] 备份已创建: backups/blog_backup_'$timestamp'.tar.gz' && echo '=== 现有备份文件 ===' && ls -la backups/blog_backup_*.tar.gz"
goto :end

:install
echo 🔧 安装部署脚本到服务器...
if not exist "deploy\install-to-server.sh" (
    echo [错误] 部署脚本不存在
    goto :end
)

scp deploy/install-to-server.sh root@8.156.66.127:/tmp/
ssh root@8.156.66.127 "chmod +x /tmp/install-to-server.sh && bash /tmp/install-to-server.sh"
echo [成功] 部署脚本安装完成
goto :end

:git
if exist "deploy\git-helper.sh" (
    bash deploy/git-helper.sh
) else (
    echo [错误] Git管理脚本不存在
    echo [提示] 请先运行: cc install
)
goto :end

:branch
echo 🌿 分支管理
echo.
for /f "tokens=*" %%i in ('git branch --show-current') do echo 当前分支: %%i
echo.
echo 所有分支:
git branch -a
echo.
set /p branch_name="输入要切换的分支名 (回车取消): "
if not "%branch_name%"=="" (
    git checkout %branch_name%
    echo [成功] 已切换到分支: %branch_name%
)
goto :end

:commit
call :quick_commit
goto :end

:quick_commit
echo 💾 快速提交...
git status --short
set /p commit_msg="请输入提交信息 (回车使用默认): "
if "%commit_msg%"=="" set commit_msg=更新博客内容 - %date% %time%

git add .
git commit -m "%commit_msg%"
echo [成功] 提交完成: %commit_msg%
exit /b 0

:end
pause
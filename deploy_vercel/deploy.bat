@echo off
echo ========================================
echo   准备部署到 Vercel
echo ========================================
echo.

echo [1/4] 检查 Git 状态...
git status

echo.
echo [2/4] 添加所有更改...
git add .

echo.
echo [3/4] 提交更改...
set /p commit_msg="请输入提交信息 (默认: 准备部署到 Vercel): "
if "%commit_msg%"=="" set commit_msg=准备部署到 Vercel
git commit -m "%commit_msg%"

echo.
echo [4/4] 推送到 GitHub...
git push origin main

echo.
echo ========================================
echo   ✅ 代码已推送到 GitHub！
echo ========================================
echo.
echo 下一步：
echo 1. 访问 https://vercel.com
echo 2. 使用 GitHub 登录
echo 3. 导入 blog_person_src 仓库
echo 4. 点击 Deploy 按钮
echo.
echo 或者使用 Vercel CLI 部署：
echo   npm i -g vercel
echo   vercel
echo.
pause

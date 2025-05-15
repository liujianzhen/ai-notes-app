@echo off
chcp 65001 > nul
echo 正在启动AI笔记助手开发环境...
echo.

cd %~dp0..
echo 当前目录: %cd%
echo.

echo 启动Next.js开发服务器...
start cmd /k "npm run dev"

echo.
echo 开发服务器已启动！
echo 请访问: http://localhost:3000
echo.

pause 
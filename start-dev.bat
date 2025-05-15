@echo off
chcp 65001 > nul

echo 正在启动AI笔记助手开发环境...

cd %~dp0

echo 检查Python环境...
python --version > nul 2>&1
if %errorlevel% neq 0 (
    echo 警告: 未检测到Python，AI功能可能无法使用。
    goto :start_frontend
)

echo 检查Ollama服务...
curl -s http://localhost:11434/api/tags > nul 2>&1
if %errorlevel% neq 0 (
    echo 警告: Ollama服务可能未运行，AI功能可能无法使用。
    echo 请确保先启动Ollama服务并拉取qwen3:30b-a3b模型。
    goto :start_frontend
)

echo 启动后端AI服务...
start cmd /k "%~dp0scripts\start-api.bat"
timeout /t 2 > nul

:start_frontend
echo 启动Next.js开发服务器...
start cmd /k "npm run dev"

echo 开发服务器已启动！
echo 前端: http://localhost:3000
echo 后端: http://localhost:9000 (如果AI服务成功启动)

pause
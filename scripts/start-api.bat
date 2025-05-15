@echo off
chcp 65001 > nul

echo 正在启动AI笔记助手API服务...

cd %~dp0..
cd src\server

:: 检查是否安装了所需的Python包
pip show fastapi > nul 2>&1
if %errorlevel% neq 0 (
    echo 正在安装必要的依赖...
    pip install fastapi uvicorn httpx pydantic
)

:: 启动FastAPI服务
echo 启动API服务，端口9000...
python ollama-api.py

pause
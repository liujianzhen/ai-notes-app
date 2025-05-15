from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
import json
from typing import List, Optional, Dict, Any

app = FastAPI(title="AI笔记助手 API")

# 配置CORS，允许前端应用访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中，应该设置为前端应用的URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ollama API 地址
OLLAMA_API_URL = "http://localhost:11434/api"
MODEL_NAME = "qwen3:30b-a3b"  # 使用本地部署的千问模型

class SummaryRequest(BaseModel):
    content: str
    max_length: int = 200

class TagsRequest(BaseModel):
    content: str
    title: str
    max_tags: int = 5

@app.get("/")
async def root():
    return {"message": "AI笔记助手API服务正在运行"}

@app.post("/summarize")
async def generate_summary(request: SummaryRequest):
    """根据笔记内容生成摘要"""
    if not request.content or len(request.content.strip()) < 10:
        raise HTTPException(status_code=400, detail="笔记内容太短，无法生成摘要")
    
    try:
        # 截取内容，避免过长导致模型处理缓慢
        content_preview = request.content[:5000] + "..." if len(request.content) > 5000 else request.content
        
        prompt = f"""请为以下笔记内容生成一个简洁的摘要，不超过{request.max_length}个字。

请首先在<think></think>标签内进行思考分析，帮助你理清笔记的主要内容和结构。在think标签内，你可以分析文章的要点、结构和上下文关系。

然后在think标签外提供最终的简洁摘要。

示例格式：
<think>
这篇笔记主要讨论了...我注意到它包含了以下几个关键点...
</think>
[最终的简洁摘要，不含think标签内容]

笔记内容:
{content_preview}"""

        # 增加超时时间到180秒（3分钟）
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(
                f"{OLLAMA_API_URL}/generate",
                json={
                    "model": MODEL_NAME,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "top_p": 0.9,
                        "max_tokens": request.max_length * 3  # 增加token以包含思考过程
                    }
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail=f"Ollama API请求失败: {response.text}")
            
            result = response.json()
            summary = result.get("response", "").strip()
            
            return {"summary": summary}
    
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="生成摘要超时，请尝试缩短笔记内容或稍后再试")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成摘要时发生错误: {str(e)}")

@app.post("/suggest-tags")
async def suggest_tags(request: TagsRequest):
    """根据笔记内容和标题推荐标签"""
    if not request.content or len(request.content.strip()) < 10:
        raise HTTPException(status_code=400, detail="笔记内容太短，无法推荐标签")
    
    try:
        # 截取内容，避免过长导致模型处理缓慢
        content_preview = request.content[:2000] + "..." if len(request.content) > 2000 else request.content
        
        prompt = f"""请根据以下笔记的标题和内容，推荐{request.max_tags}个最相关的标签。

请首先在<think></think>标签内进行思考，分析文章的关键主题和概念，然后在think标签外提供最终的标签推荐，格式为JSON数组。

示例格式：
<think>
这篇笔记主要讨论了...可能的标签包括...最相关的应该是...
</think>
["标签1", "标签2", "标签3"]

标签应该是单个词或简短的词组，用于分类和组织笔记。

笔记标题: {request.title}

笔记内容:
{content_preview}"""

        # 增加超时时间到120秒（2分钟）
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{OLLAMA_API_URL}/generate",
                json={
                    "model": MODEL_NAME,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.5,
                        "top_p": 0.9,
                        "max_tokens": 300  # 增加token以包含思考过程
                    }
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail=f"Ollama API请求失败: {response.text}")
            
            result = response.json()
            tags_text = result.get("response", "").strip()
            
            # 尝试从输出中提取JSON数组
            try:
                # 定位JSON数组的开始和结束
                start_idx = tags_text.find("[")
                end_idx = tags_text.rfind("]") + 1
                
                if start_idx >= 0 and end_idx > start_idx:
                    tags_json = tags_text[start_idx:end_idx]
                    tags = json.loads(tags_json)
                    
                    # 确保结果是字符串列表
                    if isinstance(tags, list) and all(isinstance(tag, str) for tag in tags):
                        return {"tags": tags[:request.max_tags]}
                
                # 如果无法解析JSON，使用备用方法
                # 尝试将输出按逗号分割，并清理
                fallback_tags = [tag.strip().strip('"\'[]') for tag in tags_text.split(',')]
                cleaned_tags = [tag for tag in fallback_tags if tag and len(tag) < 20]
                
                return {"tags": cleaned_tags[:request.max_tags]}
            
            except json.JSONDecodeError:
                # 无法解析JSON，使用备用方法
                fallback_tags = [tag.strip().strip('"\'[]') for tag in tags_text.split(',')]
                cleaned_tags = [tag for tag in fallback_tags if tag and len(tag) < 20]
                
                return {"tags": cleaned_tags[:request.max_tags]}
    
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="推荐标签超时，请尝试缩短笔记内容或稍后再试")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"推荐标签时发生错误: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ollama-api:app", host="0.0.0.0", port=9000, reload=True) 
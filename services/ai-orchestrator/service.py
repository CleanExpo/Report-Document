from __future__ import annotations
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from config import IntegratedConfig
from core_integration import POMLClaudeToolTrainIntegration

app = FastAPI(title="AI Orchestrator")
cfg = IntegratedConfig()
ai = POMLClaudeToolTrainIntegration(cfg)

# Configure CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GeneratePayload(BaseModel):
    prompt: str
    template_name: str | None = None
    variables: dict | None = None

@app.get("/health")
async def health():
    return await ai.health_check()

@app.post("/generate")
async def generate(p: GeneratePayload):
    res = await ai.generate(prompt=p.prompt, template_name=p.template_name, variables=p.variables)
    return res.__dict__

# Compatibility endpoints for existing Next.js integration
@app.post("/orchestrate")
async def orchestrate(p: GeneratePayload):
    """Compatibility endpoint for existing Next.js integration"""
    res = await ai.generate(prompt=p.prompt, template_name=p.template_name, variables=p.variables)
    return {
        "content": res.response,
        "usage": {"input_tokens": 0, "output_tokens": 0},
        "model": cfg.claude_model,
        "tools_used": [],
        "metadata": res.metadata or {},
        "confidence_score": res.confidence_score,
        "reasoning_chain": res.reasoning_chain,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("AI_SERVICE_PORT", "5051")))
"""
POML + Claude + Repository Tools Integration
Safe wrapper for AI orchestration with feature flags and gates.
"""
from __future__ import annotations
import os, json, asyncio
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional
from time import perf_counter
import logging

try:
    from anthropic import AsyncAnthropic  # async client
except Exception:  # fallback to sync if needed
    from anthropic import Anthropic as AsyncAnthropic  # type: ignore

try:
    from poml import PomlFile, PomlContext  # optional
    HAS_POML = True
except Exception:
    PomlFile = PomlContext = None  # type: ignore
    HAS_POML = False

from config import IntegratedConfig

logger = logging.getLogger(__name__)

@dataclass
class IntegratedResponse:
    success: bool
    response: Optional[str] = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = None
    confidence_score: Optional[float] = None
    reasoning_chain: List[Dict[str, Any]] = None
    localized_elements: List[Dict[str, Any]] = None

class POMLClaudeToolTrainIntegration:
    def __init__(self, config: Optional[IntegratedConfig] = None):
        self.config = config or IntegratedConfig()
        self.config.validate()
        self.claude = AsyncAnthropic(api_key=self.config.anthropic_api_key)
        
        # Available tools registry
        self.tools = {
            "repository_search": self._tool_repository_search,
            "code_generation": self._tool_code_generation,
            "validation": self._tool_validation,
        }
        
        logger.info("POMLClaudeToolTrainIntegration initialized")

    def _render(self, prompt: str, template_name: Optional[str], variables: Dict[str, Any]) -> str:
        if template_name and HAS_POML:
            tpl = Path(self.config.templates_dir) / f"{template_name}.poml"
            if tpl.exists():
                pf = PomlFile.from_file(str(tpl))
                ctx = PomlContext()
                for k, v in (variables or {}).items():
                    ctx.set_variable(k, v)
                return pf.render(ctx)
        return prompt

    async def generate(self, *, prompt: str, template_name: Optional[str] = None, variables: Optional[Dict[str, Any]] = None) -> IntegratedResponse:
        t0 = perf_counter()
        try:
            rendered = self._render(prompt, template_name, variables or {})
            rsp = await self.claude.messages.create(
                model=self.config.claude_model,
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature,
                messages=[{"role": "user", "content": rendered}],
            )
            # content can be mixed; concatenate text blocks
            text = "".join(getattr(b, "text", "") for b in rsp.content)
            try:
                obj = json.loads(text)
                return IntegratedResponse(
                    success=True,
                    response=obj.get("primary_response", text),
                    metadata={"processing_time": perf_counter() - t0, "model_used": self.config.claude_model},
                    confidence_score=obj.get("confidence_score"),
                    reasoning_chain=obj.get("reasoning_chain", []),
                    localized_elements=obj.get("localized_elements", []),
                )
            except json.JSONDecodeError:
                return IntegratedResponse(
                    success=True,
                    response=text,
                    metadata={"processing_time": perf_counter() - t0, "model_used": self.config.claude_model},
                )
        except Exception as e:
            return IntegratedResponse(success=False, error=str(e), metadata={"processing_time": perf_counter() - t0})

    # Tool implementations
    async def _tool_repository_search(self, query: str) -> Dict[str, Any]:
        """Search repository for relevant code"""
        # Implementation would search project files
        return {"status": "not_implemented", "query": query}
    
    async def _tool_code_generation(self, spec: Dict[str, Any]) -> str:
        """Generate code based on specification"""
        # Implementation would generate code based on spec
        return "# Code generation placeholder"
    
    async def _tool_validation(self, code: str) -> Dict[str, Any]:
        """Validate code for security and quality"""
        # Implementation would validate code
        return {"valid": True, "issues": []}
    
    async def health_check(self) -> Dict[str, Any]:
        """Health check for the orchestrator"""
        try:
            # Test Claude connection with minimal call
            response = await self.claude.messages.create(
                model=self.config.claude_model,
                max_tokens=10,
                messages=[{"role": "user", "content": "ping"}]
            )
            
            return {
                "status": "healthy",
                "model": self.config.claude_model,
                "has_poml": HAS_POML,
                "tools_available": list(self.tools.keys()),
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }

# Backward compatibility alias
POMLClaudeOrchestrator = POMLClaudeToolTrainIntegration

# For service.py compatibility
@dataclass
class OrchestrationRequest:
    """Structured request for AI orchestration"""
    prompt: str
    context: Optional[Dict[str, Any]] = None
    tools: Optional[List[str]] = None
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None
    template_name: Optional[str] = None
    variables: Optional[Dict[str, Any]] = None

@dataclass
class OrchestrationResponse:
    """Structured response from AI orchestration"""
    content: str
    usage: Dict[str, int]
    model: str
    tools_used: List[str]
    metadata: Dict[str, Any]
    confidence_score: Optional[float] = None
    reasoning_chain: List[Dict[str, Any]] = None

# Adapter for service.py
class POMLClaudeOrchestrator(POMLClaudeToolTrainIntegration):
    """Adapter class for backward compatibility with service.py"""
    
    async def orchestrate(self, request: OrchestrationRequest) -> OrchestrationResponse:
        """Main orchestration method adapter"""
        # Use the new generate method
        result = await self.generate(
            prompt=request.prompt,
            template_name=request.template_name,
            variables={
                **(request.variables or {}),
                "context": request.context,
                "tools": request.tools,
            }
        )
        
        # Convert IntegratedResponse to OrchestrationResponse
        if result.success:
            # Parse usage from metadata if available
            usage = {
                "input_tokens": 0,
                "output_tokens": 0,
            }
            
            return OrchestrationResponse(
                content=result.response or "",
                usage=usage,
                model=self.config.claude_model,
                tools_used=request.tools or [],
                metadata=result.metadata or {},
                confidence_score=result.confidence_score,
                reasoning_chain=result.reasoning_chain,
            )
        else:
            raise Exception(result.error or "Orchestration failed")
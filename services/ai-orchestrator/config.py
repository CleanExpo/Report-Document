from __future__ import annotations
import os
from dataclasses import dataclass
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

@dataclass
class IntegratedConfig:
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    claude_model: str = os.getenv("CLAUDE_MODEL", "claude-4")
    max_tokens: int = int(os.getenv("MAX_TOKENS", "100000"))
    temperature: float = float(os.getenv("TEMPERATURE", "0.7"))

    templates_dir: str = os.getenv("TEMPLATES_DIR", "./templates")

    def validate(self) -> None:
        if not self.anthropic_api_key:
            raise ValueError("ANTHROPIC_API_KEY is required")
        Path(self.templates_dir).mkdir(parents=True, exist_ok=True)
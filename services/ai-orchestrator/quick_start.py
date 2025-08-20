# services/ai-orchestrator/quick_start.py
from pathlib import Path
from config import IntegratedConfig
from core_integration import POMLClaudeToolTrainIntegration


def setup_project():
    print("🚀 Setting up AI Orchestrator...")
    for d in ["templates", "cache", "models", "data", "logs", "repos"]:
        Path(d).mkdir(exist_ok=True)
    Path("templates/sample_template.poml").write_text(
        """<poml>
<stylesheet>
output-format: structured-json
verbosity: detailed
reasoning-depth: multi-hop
</stylesheet>
<role>Expert AI assistant with integrated POML-Claude-ToolTrain</role>
<task>Process requests with systematic reasoning</task>
<output-format>{"response":"...","confidence_score":0.95}</output-format>
</poml>""",
        encoding="utf-8",
    )
    print("✅ Templates & folders ready")


if __name__ == "__main__":
    setup_project()
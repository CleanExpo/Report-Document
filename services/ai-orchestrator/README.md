# AI Orchestrator - POML-Claude-ToolTrain Developer Pack

> A powerful, sidecar AI service for NEW PROJECT PATHWAY, providing advanced code analysis, documentation generation, and intelligent development assistance.

## 🚀 Quick Start

```bash
# One-command setup
python quick_start.py

# Or manual setup
pip install -r requirements.txt
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
python service.py
```

## 📁 Structure

```
ai-orchestrator/
├── requirements.txt        # Core dependencies (lean)
├── requirements.extras.txt # Optional heavy deps (ML/torch)
├── .env                   # Configuration (never commit)
├── config.py              # Typed configuration
├── core_integration.py    # POML-Claude integration
├── service.py            # FastAPI HTTP service
├── usage_examples.py     # Ready-to-run examples
├── quick_start.py        # One-command setup
├── Dockerfile           # Container deployment
└── templates/           # POML templates
    ├── base.poml
    ├── code_review.poml
    ├── test_generation.poml
    ├── documentation.poml
    └── api_design.poml
```

## 🔧 Configuration

### Required Environment Variables
```env
ANTHROPIC_API_KEY=sk-ant-...  # Your Claude API key
```

### Optional Configuration
```env
CLAUDE_MODEL=claude-4          # Model to use
MAX_TOKENS=4000               # Response length
TEMPERATURE=0.7               # Creativity (0-1)
AI_SERVICE_PORT=5051          # Service port
TEMPLATES_DIR=./templates     # POML templates location
```

## 🎯 Features

### Core Capabilities
- **Code Review**: Analyze code quality, security, performance
- **Test Generation**: Create comprehensive test suites
- **Documentation**: Generate clear, complete docs
- **API Design**: Design RESTful endpoints
- **Error Analysis**: Debug and fix issues
- **Context-Aware**: Use POML templates for structured output

### Advanced Features (with extras)
- **Embeddings**: Vector search with ChromaDB/FAISS
- **Code Analysis**: AST parsing with tree-sitter
- **ML Models**: Transformers, torch integration
- **Monitoring**: Weights & Biases, TensorBoard

## 💻 Usage

### Python SDK
```python
from core_integration import POMLClaudeToolTrainIntegration

# Initialize
ai = POMLClaudeToolTrainIntegration()

# Generate with template
result = await ai.generate(
    prompt="Review this code for security issues",
    template_name="code_review",
    variables={"code": your_code}
)

if result.success:
    print(result.response)
    print(f"Confidence: {result.confidence_score}")
```

### REST API
```bash
# Health check
curl http://localhost:5051/health

# Generate
curl -X POST http://localhost:5051/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write unit tests for a login function",
    "template_name": "test_generation"
  }'
```

### Next.js Integration
```javascript
// Frontend call
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Generate API documentation',
    template_name: 'documentation',
    variables: { api_spec: spec }
  })
});
```

## 📚 Examples

Run all examples:
```bash
python usage_examples.py
```

Available examples:
1. **Basic Generation**: Simple text generation
2. **Code Review**: Structured code analysis
3. **Documentation**: Auto-generate docs
4. **Contextual Generation**: Use variables and templates
5. **Test Generation**: Create unit tests
6. **API Design**: Design REST endpoints
7. **Error Analysis**: Debug error messages
8. **Batch Processing**: Handle multiple prompts

## 🐳 Docker Deployment

```bash
# Build image
docker build -t ai-orchestrator .

# Run container
docker run -d \
  -p 5051:5051 \
  -e ANTHROPIC_API_KEY=your-key \
  --name ai-service \
  ai-orchestrator
```

## 🔌 Integration with Next.js

The service integrates seamlessly with NEW PROJECT PATHWAY:

1. **Feature Flag**: Enable with `aiOrchestrator` flag
2. **API Routes**: Proxied through `/api/ai/*`
3. **Environment**: Share config via Vercel env pull
4. **Development**: Use `npm run dev:all` to run both

## 📦 Dependency Profiles

### Core (Default)
Minimal dependencies for basic operation:
- FastAPI, Anthropic SDK, Pydantic
- ~50MB installed

### Extras (Optional)
Heavy ML dependencies for advanced features:
- PyTorch, Transformers, ChromaDB
- ~5GB installed

Install extras:
```bash
pip install -r requirements.extras.txt
```

## 🧪 Testing

```bash
# Test configuration
python -c "from config import IntegratedConfig; IntegratedConfig().validate()"

# Test service
python -m pytest tests/

# Run examples
python usage_examples.py
```

## 🚦 Health Monitoring

The service provides health endpoints:
- `GET /health` - Basic health check
- `GET /` - Service info

Monitor in production:
```bash
curl http://localhost:5051/health
```

## 📖 POML Templates

Templates use POML (Prompt Optimization Markup Language) for structured prompts:

```poml
# Custom Template
System: You are {{role}}.

Context:
{{#each context_items}}
- {{this}}
{{/each}}

Task: {{task}}

Output: {{output_format}}
```

## 🔒 Security

- API key required for Claude access
- CORS configured for local development
- Environment variables for secrets
- Input validation on all endpoints
- Rate limiting ready (configure in production)

## 🤝 Contributing

1. Add new templates to `templates/`
2. Extend `usage_examples.py` with new patterns
3. Update tests for new features
4. Follow existing code style

## 📝 License

Part of NEW PROJECT PATHWAY - See main project license.

## 🆘 Troubleshooting

### Common Issues

**API Key Error**
```
ValueError: ANTHROPIC_API_KEY is required
```
Solution: Add your key to `.env` file

**Import Error**
```
ModuleNotFoundError: No module named 'anthropic'
```
Solution: Run `pip install -r requirements.txt`

**Port Already in Use**
```
Error: [Errno 48] Address already in use
```
Solution: Change port in `.env` or stop other service

### Support

- Check `usage_examples.py` for working code
- Review templates in `templates/` directory
- Run `python quick_start.py` for automated setup
- See main project docs at `/docs`
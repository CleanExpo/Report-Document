"""
Usage Examples for POML-Claude-ToolTrain Integration
Ready-to-run examples demonstrating various capabilities
"""
import asyncio
import json
from typing import Dict, Any
from config import IntegratedConfig
from core_integration import POMLClaudeToolTrainIntegration

async def example_basic_generation():
    """Example 1: Basic text generation"""
    print("\n=== Example 1: Basic Generation ===")
    
    ai = POMLClaudeToolTrainIntegration()
    result = await ai.generate(
        prompt="Write a haiku about Python programming"
    )
    
    if result.success:
        print(f"Response: {result.response}")
        print(f"Processing time: {result.metadata.get('processing_time', 0):.2f}s")
    else:
        print(f"Error: {result.error}")

async def example_code_review():
    """Example 2: Code review with structured output"""
    print("\n=== Example 2: Code Review ===")
    
    code_snippet = '''
    def calculate_sum(numbers):
        total = 0
        for n in numbers:
            total += n
        return total
    '''
    
    ai = POMLClaudeToolTrainIntegration()
    result = await ai.generate(
        prompt=f"""Review this Python code and provide feedback in JSON format:
        ```python
        {code_snippet}
        ```
        
        Return JSON with keys: quality_score, issues, suggestions, improved_code""",
        template_name="code_review"  # Uses template if available
    )
    
    if result.success:
        print(f"Review: {result.response}")
        if result.confidence_score:
            print(f"Confidence: {result.confidence_score}")

async def example_documentation_generation():
    """Example 3: Generate documentation from code"""
    print("\n=== Example 3: Documentation Generation ===")
    
    function_code = '''
    async def fetch_user_data(user_id: str, include_metadata: bool = False) -> Dict[str, Any]:
        """Fetches user data from the database"""
        # Implementation here
        pass
    '''
    
    ai = POMLClaudeToolTrainIntegration()
    result = await ai.generate(
        prompt=f"Generate comprehensive documentation for this function:\n{function_code}",
        variables={"code": function_code, "style": "google"}
    )
    
    if result.success:
        print(f"Documentation:\n{result.response}")

async def example_with_context():
    """Example 4: Generation with context variables"""
    print("\n=== Example 4: Contextual Generation ===")
    
    ai = POMLClaudeToolTrainIntegration()
    result = await ai.generate(
        prompt="Generate a project README based on the context",
        variables={
            "project_name": "NEW PROJECT PATHWAY",
            "tech_stack": ["Next.js", "FastAPI", "Claude AI"],
            "purpose": "AI-assisted development pipeline",
            "target_users": "non-coders and developers"
        }
    )
    
    if result.success:
        print(f"README:\n{result.response[:500]}...")  # First 500 chars

async def example_test_generation():
    """Example 5: Generate unit tests"""
    print("\n=== Example 5: Test Generation ===")
    
    function_to_test = '''
    def validate_email(email: str) -> bool:
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    '''
    
    ai = POMLClaudeToolTrainIntegration()
    result = await ai.generate(
        prompt=f"Generate comprehensive unit tests for this function:\n{function_to_test}",
        template_name="test_generation"
    )
    
    if result.success:
        print(f"Tests:\n{result.response}")

async def example_api_endpoint_design():
    """Example 6: Design API endpoints"""
    print("\n=== Example 6: API Design ===")
    
    ai = POMLClaudeToolTrainIntegration()
    result = await ai.generate(
        prompt="Design RESTful API endpoints for a task management system",
        variables={
            "entities": ["tasks", "users", "projects", "comments"],
            "operations": ["CRUD", "search", "filter", "sort"],
            "auth_type": "JWT"
        }
    )
    
    if result.success:
        print(f"API Design:\n{result.response[:800]}...")

async def example_error_analysis():
    """Example 7: Analyze error messages"""
    print("\n=== Example 7: Error Analysis ===")
    
    error_log = '''
    TypeError: cannot unpack non-iterable NoneType object
    File "app.py", line 45, in process_data
        x, y = get_coordinates()
    '''
    
    ai = POMLClaudeToolTrainIntegration()
    result = await ai.generate(
        prompt=f"Analyze this error and suggest fixes:\n{error_log}"
    )
    
    if result.success:
        print(f"Analysis: {result.response}")
        if result.reasoning_chain:
            print(f"Reasoning steps: {len(result.reasoning_chain)}")

async def example_batch_processing():
    """Example 8: Process multiple prompts efficiently"""
    print("\n=== Example 8: Batch Processing ===")
    
    prompts = [
        "What is dependency injection?",
        "Explain async/await in Python",
        "Best practices for API versioning"
    ]
    
    ai = POMLClaudeToolTrainIntegration()
    results = []
    
    for prompt in prompts:
        result = await ai.generate(prompt=prompt)
        results.append({
            "prompt": prompt,
            "success": result.success,
            "response": result.response[:100] + "..." if result.success else result.error
        })
    
    print(f"Processed {len(results)} prompts:")
    for r in results:
        print(f"  - {r['prompt'][:30]}...: {'✓' if r['success'] else '✗'}")

async def run_all_examples():
    """Run all examples sequentially"""
    examples = [
        example_basic_generation,
        example_code_review,
        example_documentation_generation,
        example_with_context,
        example_test_generation,
        example_api_endpoint_design,
        example_error_analysis,
        example_batch_processing
    ]
    
    for example in examples:
        try:
            await example()
            await asyncio.sleep(1)  # Rate limiting
        except Exception as e:
            print(f"Error in {example.__name__}: {e}")

def main():
    """Main entry point"""
    print("POML-Claude-ToolTrain Usage Examples")
    print("=" * 50)
    
    # Check configuration
    try:
        config = IntegratedConfig()
        config.validate()
        print(f"✓ Configuration valid")
        print(f"✓ Using model: {config.claude_model}")
    except Exception as e:
        print(f"✗ Configuration error: {e}")
        print("Please set ANTHROPIC_API_KEY in your .env file")
        return
    
    # Run examples
    asyncio.run(run_all_examples())
    
    print("\n" + "=" * 50)
    print("Examples completed!")

if __name__ == "__main__":
    main()
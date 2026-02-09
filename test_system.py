"""
Test script to verify the evaluation engine setup.
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))


async def test_imports():
    """Test that all required modules can be imported."""
    print("Testing imports...")
    
    try:
        # Core dependencies
        import fastapi
        import uvicorn
        import motor
        import pymongo
        import fitz  # PyMuPDF
        import docx
        import language_tool_python
        import textstat
        from sentence_transformers import SentenceTransformer
        from datasketch import MinHash
        from reportlab.pdfgen import canvas
        
        print("✓ All core dependencies imported successfully")
        return True
    except ImportError as e:
        print(f"✗ Import error: {e}")
        return False


async def test_services():
    """Test that services can be instantiated."""
    print("\nTesting services...")
    
    try:
        from app.services.parser_service import document_parser
        from app.services.grammar_service import grammar_service
        from app.services.vocabulary_service import vocabulary_service
        from app.services.topic_service import topic_relevance_service
        from app.services.coherence_service import coherence_service
        
        print("✓ All services instantiated successfully")
        return True
    except Exception as e:
        print(f"✗ Service error: {e}")
        return False


async def test_grammar_analysis():
    """Test grammar analysis with sample text."""
    print("\nTesting grammar analysis...")
    
    try:
        from app.services.grammar_service import grammar_service
        
        sample_text = "This is a sample text for testing. It has multiple sentences."
        result = grammar_service.analyze(sample_text)
        
        print(f"  - Total errors: {result.total_errors}")
        print(f"  - Readability: {result.readability_score:.2f}")
        print(f"  - Score: {result.score:.2f}")
        print("✓ Grammar analysis working")
        return True
    except Exception as e:
        print(f"✗ Grammar analysis error: {e}")
        return False


async def test_vocabulary_analysis():
    """Test vocabulary analysis with sample text."""
    print("\nTesting vocabulary analysis...")
    
    try:
        from app.services.vocabulary_service import vocabulary_service
        
        sample_text = "The quick brown fox jumps over the lazy dog. This sentence contains various words."
        result = vocabulary_service.analyze(sample_text)
        
        print(f"  - Lexical diversity: {result.lexical_diversity:.4f}")
        print(f"  - Avg word length: {result.average_word_length:.2f}")
        print(f"  - Score: {result.score:.2f}")
        print("✓ Vocabulary analysis working")
        return True
    except Exception as e:
        print(f"✗ Vocabulary analysis error: {e}")
        return False


async def test_coherence_analysis():
    """Test coherence analysis with sample text."""
    print("\nTesting coherence analysis...")
    
    try:
        from app.services.coherence_service import coherence_service
        
        sample_text = """This is the first paragraph. It has multiple sentences. Therefore, it demonstrates structure.
        
        This is the second paragraph. However, it also has structure. Furthermore, it uses transition words."""
        
        result = coherence_service.analyze(sample_text)
        
        print(f"  - Paragraphs: {result.paragraph_count}")
        print(f"  - Transition words: {result.transition_word_count}")
        print(f"  - Score: {result.score:.2f}")
        print("✓ Coherence analysis working")
        return True
    except Exception as e:
        print(f"✗ Coherence analysis error: {e}")
        return False


async def test_topic_analysis():
    """Test topic relevance analysis."""
    print("\nTesting topic analysis...")
    
    try:
        from app.services.topic_service import topic_relevance_service
        
        submission = "Climate change is a major environmental issue affecting the planet."
        prompt = "Write about environmental challenges."
        
        result = topic_relevance_service.analyze(submission, prompt)
        
        print(f"  - Similarity: {result.similarity_score:.4f}")
        print(f"  - Score: {result.score:.2f}")
        print(f"  - Notes: {result.notes}")
        print("✓ Topic analysis working")
        return True
    except Exception as e:
        print(f"✗ Topic analysis error: {e}")
        print("  Note: First run may take longer (downloading models)")
        return False


async def main():
    """Run all tests."""
    print("=" * 50)
    print("Document Evaluation Engine - Test Suite")
    print("=" * 50)
    
    results = []
    
    # Run tests
    results.append(await test_imports())
    results.append(await test_services())
    results.append(await test_grammar_analysis())
    results.append(await test_vocabulary_analysis())
    results.append(await test_coherence_analysis())
    results.append(await test_topic_analysis())
    
    # Summary
    print("\n" + "=" * 50)
    passed = sum(results)
    total = len(results)
    print(f"Tests passed: {passed}/{total}")
    
    if passed == total:
        print("✓ All tests passed! System is ready.")
        print("\nYou can now start the application with:")
        print("  uvicorn app.main:app --reload")
    else:
        print("⚠ Some tests failed. Check error messages above.")
        print("  The system may still work with limited functionality.")
    
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())

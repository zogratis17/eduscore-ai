import pytest
from server.core.parser import DocumentParser

def test_extract_text_from_pdf():
    file_path = "tests/sample.pdf"
    
    try:
        with open(file_path, "rb") as f:
            file_bytes = f.read()
        
        result = DocumentParser.extract_text_from_pdf(file_bytes)
        
        assert result["status"] == "success"
        assert "text" in result
        assert isinstance(result["text"], str)
        assert "metadata" in result
        assert "page_count" in result["metadata"]
        assert result["metadata"]["page_count"] > 0
        
        # Preview the text in the console
        print(f"\n--- Extracted Text (Total: {len(result['text'])} chars) ---")
        print("FIRST 300 CHARS:")
        print(result["text"][:300])
        print("\n... [MIDDLE CONTENT] ...\n")
        print("LAST 300 CHARS:")
        print(result["text"][-300:])
        print("--------------------------------------------------")
    except FileNotFoundError:
        pytest.fail(f"Test file not found at {file_path}")
    except Exception as e:
        pytest.fail(f"An unexpected error occurred: {e}")
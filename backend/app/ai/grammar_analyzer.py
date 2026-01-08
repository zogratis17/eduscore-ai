import httpx
import logging
from typing import Dict, Any, List
from app.core.config import settings

logger = logging.getLogger(__name__)

class GrammarAnalyzer:
    """
    Analyzes text for grammar, spelling, and style errors using LanguageTool.
    """
    
    def __init__(self):
        self.api_url = f"{settings.LANGUAGETOOL_URL}/v2/check"
        
    async def analyze(self, text: str) -> Dict[str, Any]:
        """
        Analyzes the given text and returns a grammar score and list of errors.
        """
        if not text:
            return {
                "score": 0,
                "errors": [],
                "error_count": 0
            }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    data={
                        "text": text,
                        "language": "en-US"
                    },
                    timeout=60.0
                )
                response.raise_for_status()
                result = response.json()
                
                matches = result.get("matches", [])
                word_count = len(text.split())
                
                score = self._calculate_score(matches, word_count)
                formatted_errors = self._format_errors(matches)
                
                return {
                    "score": score,
                    "errors": formatted_errors,
                    "error_count": len(matches)
                }
                
        except Exception as e:
            logger.error(f"Error connecting to LanguageTool: {str(e)}")
            # Fail gracefully - return high score but with error note? 
            # Or re-raise? For MVP, let's log and return a neutral result.
            return {
                "score": 0,
                "errors": [],
                "error_count": 0,
                "system_error": str(e)
            }

    def _calculate_score(self, matches: List[Dict], word_count: int) -> float:
        """
        Calculates grammar score based on error density.
        Formula: 100 - (weighted_error_count / word_count * 1000) * 0.5
        """
        if word_count == 0:
            return 0.0
            
        # Weight errors: Ignore simple style/typography for score
        weighted_errors = 0
        for m in matches:
            rule_id = m.get("rule", {}).get("id", "")
            category = m.get("rule", {}).get("category", {}).get("id", "")
            
            if category == "TYPOGRAPHY":
                weighted_errors += 0.1 # Very low penalty
            elif category == "STYLE":
                weighted_errors += 0.5 # Medium penalty
            else:
                weighted_errors += 1.0 # Full penalty for grammar/spelling
        
        # Calculate error rate per 1000 words
        error_rate = (weighted_errors / word_count) * 1000
        
        # Calculate penalty (Reduced multiplier from 2 to 0.5)
        penalty = error_rate * 0.5
        
        score = 100.0 - penalty
        return max(0.0, min(100.0, score))

    def _format_errors(self, matches: List[Dict]) -> List[Dict]:
        """
        Formats raw LanguageTool matches into a cleaner structure.
        """
        formatted = []
        # Limit to top 50 errors to prevent UI overload
        for match in matches[:50]:
            replacements = [r["value"] for r in match.get("replacements", [])[:3]]
            formatted.append({
                "message": match.get("message"),
                "short_message": match.get("shortMessage"),
                "offset": match.get("offset"),
                "length": match.get("length"),
                "replacements": replacements,
                "suggestion": replacements[0] if replacements else "", # Frontend compatibility
                "rule_id": match.get("rule", {}).get("id"),
                "rule_category": match.get("rule", {}).get("category", {}).get("id"),
                "context": match.get("context", {}).get("text"),
            })
        return formatted

grammar_analyzer = GrammarAnalyzer()

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
        if not text:
            return {"score": 0, "errors": [], "error_count": 0, "error_rate": 0}

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    data={"text": text, "language": "en-US"},
                    timeout=60.0,
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
                    "error_count": len(matches),
                    "error_rate": round(len(matches) / word_count, 4) if word_count > 0 else 0,
                }

        except Exception as e:
            logger.error(f"Error connecting to LanguageTool: {str(e)}")
            # LanguageTool is down — return None score so orchestrator can
            # handle this gracefully (skip grammar from weighted scoring)
            return {
                "score": None,
                "errors": [],
                "error_count": 0,
                "error_rate": 0,
                "system_error": str(e),
            }

    def _calculate_score(self, matches: List[Dict], word_count: int) -> float:
        """
        Calculates grammar score based on error density.

        Scoring logic:
        - Only real grammar/spelling errors get full weight
        - Style suggestions get half weight
        - Typography (smart quotes etc.) gets minimal weight
        - Score uses errors-per-100-words as the base metric
        - A well-written essay (< 1 error per 100 words) scores 90+
        - A messy essay (> 5 errors per 100 words) scores below 50
        """
        if word_count == 0:
            return 0.0

        weighted_errors = 0.0
        for m in matches:
            category = m.get("rule", {}).get("category", {}).get("id", "")

            if category == "TYPOGRAPHY":
                weighted_errors += 0.1
            elif category in ("STYLE", "REDUNDANCY", "CASING"):
                weighted_errors += 0.3
            else:
                # Real grammar/spelling errors
                weighted_errors += 1.0

        # Errors per 100 words — the core metric
        errors_per_100 = (weighted_errors / word_count) * 100

        # Scoring curve:
        # 0 errors/100w → 100
        # 1 error/100w  → 88
        # 2 errors/100w → 76
        # 3 errors/100w → 64
        # 5 errors/100w → 40
        # 8+ errors/100w → ~0

        score = 100.0 - (errors_per_100 * 12.0)
        return round(max(0.0, min(100.0, score)), 2)

    def _format_errors(self, matches: List[Dict]) -> List[Dict]:
        formatted = []
        for match in matches[:50]:
            replacements = [r["value"] for r in match.get("replacements", [])[:3]]
            formatted.append({
                "message": match.get("message"),
                "short_message": match.get("shortMessage"),
                "offset": match.get("offset"),
                "length": match.get("length"),
                "replacements": replacements,
                "suggestion": replacements[0] if replacements else "",
                "rule_id": match.get("rule", {}).get("id"),
                "rule_category": match.get("rule", {}).get("category", {}).get("id"),
                "context": match.get("context", {}).get("text"),
            })
        return formatted


grammar_analyzer = GrammarAnalyzer()

import logging
from typing import Dict, Any

from app.core.config import settings

logger = logging.getLogger(__name__)

# Lazy-loaded Gemini client
_gemini_model = None


def _get_gemini_model():
    """Lazy-initialize the Gemini model to avoid import errors if key is missing."""
    global _gemini_model
    if _gemini_model is None and settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            _gemini_model = genai.GenerativeModel("gemini-2.5-flash")
            logger.info("Gemini 2.5 Flash model initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini model: {e}")
            _gemini_model = None
    return _gemini_model


class RAGEngine:
    """
    Generates qualitative feedback based on evaluation metrics.
    Uses Gemini 2.5 Flash (free tier) for rich, contextual feedback.
    Falls back to template-based feedback if Gemini is unavailable.
    """

    async def generate_feedback(
        self,
        text: str,
        grammar_res: Dict,
        vocab_res: Dict,
        coherence_res: Dict,
        topic_res: Dict,
    ) -> str:
        """
        Generates feedback using Gemini AI, with template fallback.
        """
        # Try Gemini first
        model = _get_gemini_model()
        if model:
            try:
                feedback = await self._generate_with_gemini(
                    model, text, grammar_res, vocab_res, coherence_res, topic_res
                )
                if feedback:
                    return feedback
            except Exception as e:
                logger.warning(f"Gemini feedback generation failed, using fallback: {e}")

        # Fallback to templates
        return self._generate_template_feedback(
            grammar_res, vocab_res, coherence_res, topic_res
        )

    async def _generate_with_gemini(
        self,
        model,
        text: str,
        grammar_res: Dict,
        vocab_res: Dict,
        coherence_res: Dict,
        topic_res: Dict,
    ) -> str:
        """Calls Gemini 2.5 Flash to generate contextual feedback."""
        # Truncate essay to ~2000 words to stay within token limits
        words = text.split()
        truncated_text = " ".join(words[:2000])
        if len(words) > 2000:
            truncated_text += "\n[... essay truncated for analysis ...]"

        prompt = f"""You are an academic writing evaluator providing constructive feedback to a student.

Analyze the following essay and its evaluation scores, then provide a **concise feedback paragraph** (150-200 words).

## Essay Text:
{truncated_text}

## Evaluation Scores (out of 100):
- Grammar Score: {grammar_res.get('score', 0)}/100 ({grammar_res.get('error_count', 0)} errors found)
- Vocabulary Score: {vocab_res.get('score', 0)}/100 (Lexical Diversity: {vocab_res.get('metrics', {}).get('lexical_diversity', 'N/A')})
- Coherence Score: {coherence_res.get('score', 0)}/100 (Structure: {coherence_res.get('analysis', {}).get('structure_rating', 'N/A')})
- Topic Relevance: {topic_res.get('score', 0)}/100

## Instructions:
1. Start with the essay's strongest aspect
2. Mention 2-3 specific areas for improvement with actionable suggestions
3. Reference specific parts of the essay when possible
4. Keep a constructive, encouraging tone appropriate for a student
5. Do NOT mention the numerical scores — focus on qualitative assessment
6. Write as a single cohesive paragraph, not a bulleted list"""

        response = await model.generate_content_async(prompt)
        feedback = response.text.strip()

        if feedback:
            logger.info("Gemini feedback generated successfully.")
            return feedback

        return ""

    def _generate_template_feedback(
        self,
        grammar_res: Dict,
        vocab_res: Dict,
        coherence_res: Dict,
        topic_res: Dict,
    ) -> str:
        """Template-based fallback when Gemini is unavailable."""
        parts = []

        # Opening
        if topic_res.get("score", 0) > 80:
            parts.append(
                "This essay effectively addresses the prompt with a clear focus."
            )
        else:
            parts.append(
                "The essay addresses the topic but could benefit from a sharper focus on the prompt requirements."
            )

        # Structure
        if coherence_res.get("score", 0) > 75:
            parts.append(
                "The structure is logical, with well-connected paragraphs that guide the reader."
            )
        else:
            parts.append(
                "Review your paragraph transitions. Some ideas feel disconnected."
            )

        # Grammar
        error_count = grammar_res.get("error_count", 0)
        if error_count == 0:
            parts.append(
                "The writing is mechanically sound with no obvious grammatical errors."
            )
        elif error_count < 5:
            parts.append(
                "There are a few minor grammatical issues, but they do not impede understanding."
            )
        else:
            parts.append(
                f"We detected {error_count} grammatical errors. Proofreading is recommended."
            )

        # Vocabulary
        if vocab_res.get("score", 0) > 70:
            parts.append(
                "Vocabulary usage is varied and appropriate for an academic context."
            )

        # Closing
        parts.append("Overall, a solid effort.")

        return " ".join(parts)


rag_engine = RAGEngine()

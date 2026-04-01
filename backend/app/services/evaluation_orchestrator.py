import logging
from typing import Dict, Any, Callable, Optional
from app.ai.grammar_analyzer import grammar_analyzer
from app.ai.plagiarism_detector import plagiarism_detector
from app.ai.gemini_evaluator import gemini_evaluator
from app.ai.rag_engine import rag_engine
from app.models.rubric import Rubric

logger = logging.getLogger(__name__)


class EvaluationOrchestrator:
    """
    Coordinator service that runs AI analysis modules on a document.
    
    Scoring Architecture:
    - Gemini handles ALL scoring (grammar, vocabulary, coherence, topic_relevance)
    - LanguageTool provides error spans for the interactive EssayViewer (UI only)
    - MinHash handles internal plagiarism detection (duplicate submissions)
    - AI detection is informational only (no score penalty)
    
    Penalties:
    - Plagiarism: additive deductions (not multiplicative)  
    - Off-topic floor: if relevance < 10, score capped at 25
    """

    async def evaluate_document(
        self,
        text: str,
        document_id: str = None,
        prompt: str = None,
        rubric: Rubric = None,
        status_callback: Optional[Callable[[str], None]] = None,
    ) -> Dict[str, Any]:
        if not text:
            raise ValueError("No text provided for evaluation")

        def _update(stage: str):
            if status_callback:
                try:
                    status_callback(stage)
                except Exception as e:
                    logger.warning(f"Status callback failed: {e}")

        logger.info("Starting document evaluation...")

        # ── Step 1: Grammar Error Spans (LanguageTool — for UI highlighting) ──
        _update("analyzing_grammar")
        logger.info("Running Grammar Analysis (LanguageTool — for error spans)...")
        lt_grammar_result = await grammar_analyzer.analyze(text)

        # ── Step 2: Plagiarism (MinHash — internal duplicate detection) ──
        _update("analyzing_plagiarism")
        logger.info("Running Plagiarism Detection (MinHash)...")
        plagiarism_result = plagiarism_detector.check_plagiarism(
            text, exclude_doc_id=document_id
        )

        # ── Step 3: Gemini Evaluation (ALL scoring dimensions) ──
        _update("analyzing_with_gemini")
        logger.info("Running Gemini AI Evaluation...")
        gemini_result = await gemini_evaluator.evaluate(text, prompt=prompt)

        if not gemini_result:
            raise RuntimeError(
                "Gemini AI is currently unavailable. Evaluation cannot proceed without it. "
                "Please check if the API key is valid and the rate limit hasn't been exceeded, then retry."
            )

        scoring_engine = "gemini"
        logger.info("Using Gemini scores for evaluation.")

        # Extract Gemini scores into result dicts
        # Grammar: use Gemini's holistic score, but keep LanguageTool's error spans for UI
        grammar_result = {
            "score": gemini_result["grammar"]["score"],
            "reasoning": gemini_result["grammar"].get("reasoning", ""),
            "strengths": gemini_result["grammar"].get("strengths", []),
            "improvements": gemini_result["grammar"].get("improvements", []),
            "engine": "gemini",
            # Preserve LanguageTool error spans for the interactive EssayViewer
            "errors": lt_grammar_result.get("errors", []),
            "error_count": lt_grammar_result.get("error_count", 0),
            "error_rate": lt_grammar_result.get("error_rate", 0),
        }
        vocab_result = {
            "score": gemini_result["vocabulary"]["score"],
            "reasoning": gemini_result["vocabulary"].get("reasoning", ""),
            "strengths": gemini_result["vocabulary"].get("strengths", []),
            "improvements": gemini_result["vocabulary"].get("improvements", []),
            "engine": "gemini",
        }
        coherence_result = {
            "score": gemini_result["coherence"]["score"],
            "reasoning": gemini_result["coherence"].get("reasoning", ""),
            "strengths": gemini_result["coherence"].get("strengths", []),
            "improvements": gemini_result["coherence"].get("improvements", []),
            "engine": "gemini",
        }
        topic_result = {
            "score": gemini_result["topic_relevance"]["score"],
            "reasoning": gemini_result["topic_relevance"].get("reasoning", ""),
            "strengths": gemini_result["topic_relevance"].get("strengths", []),
            "improvements": gemini_result["topic_relevance"].get("improvements", []),
            "engine": "gemini",
        }
        ai_detection_result = {
            "score": gemini_result["ai_detection"]["score"],
            "label": gemini_result["ai_detection"].get("label", "Unknown"),
            "reasoning": gemini_result["ai_detection"].get("reasoning", ""),
            "engine": "gemini",
        }

        # ── Step 4: Score Aggregation ──
        _update("calculating_score")

        grammar_score = grammar_result["score"]
        vocab_score = vocab_result["score"]
        coherence_score = coherence_result["score"]
        topic_score = topic_result["score"]
        plagiarism_pct = plagiarism_result["percentage"]

        # Score lookup for rubric criterion matching
        score_map = {
            "grammar": grammar_score,
            "vocabulary": vocab_score,
            "coherence": coherence_score,
            "topic_relevance": topic_score,
        }

        # Build weighted components from rubric (or defaults)
        weighted_components = []
        weighted_score = 0.0
        total_weight_used = 0.0

        if rubric:
            logger.info(f"Using Rubric: {rubric.name}")
            for criterion in rubric.criteria:
                matched_key = self._match_criterion(criterion.name)
                c_score = score_map.get(matched_key, 0)
                if matched_key is None:
                    logger.warning(f"Unknown criterion: '{criterion.name}'. Using score 0.")

                contribution = round(c_score * (criterion.weight / 100.0), 2)
                weighted_score += contribution
                total_weight_used += criterion.weight
                weighted_components.append({
                    "name": criterion.name,
                    "raw_score": round(c_score, 2),
                    "weight": criterion.weight,
                    "contribution": contribution,
                })
        else:
            logger.info("No rubric provided. Using default weights.")
            defaults = [
                ("Grammar", "grammar", 25),
                ("Vocabulary", "vocabulary", 20),
                ("Coherence", "coherence", 25),
                ("Topic Relevance", "topic_relevance", 30),
            ]
            for name, key, weight in defaults:
                c_score = score_map[key]
                contribution = round(c_score * (weight / 100.0), 2)
                weighted_score += contribution
                total_weight_used += weight
                weighted_components.append({
                    "name": name,
                    "raw_score": round(c_score, 2),
                    "weight": weight,
                    "contribution": contribution,
                })

        # Normalize if weights don't add to 100 (e.g. custom rubric missing a category)
        if total_weight_used > 0 and total_weight_used < 100:
            scale = 100.0 / total_weight_used
            weighted_score *= scale
            for comp in weighted_components:
                comp["adjusted_weight"] = round(comp["weight"] * scale, 1)
                comp["contribution"] = round(comp["contribution"] * scale, 2)
            logger.info(f"Weights only summed to {total_weight_used}%. Normalized to 100%.")

        weighted_total = round(weighted_score, 2)
        final_score = weighted_score

        # ── Apply Penalties (additive, not multiplicative) ──
        penalties = []

        # Plagiarism penalty — additive deduction, capped at 40 points
        if plagiarism_pct > 50:
            deduction = min(40.0, round(plagiarism_pct * 0.4, 2))
            final_score -= deduction
            penalties.append({
                "name": "Severe Plagiarism",
                "detail": f"{plagiarism_pct}% similarity — {deduction} point deduction",
                "deduction": -deduction,
            })
        elif plagiarism_pct > 20:
            deduction = round(plagiarism_pct * 0.3, 2)
            final_score -= deduction
            penalties.append({
                "name": "Plagiarism",
                "detail": f"{plagiarism_pct}% similarity — {deduction} point deduction",
                "deduction": -deduction,
            })
        elif plagiarism_pct > 5:
            deduction = round(plagiarism_pct * 0.15, 2)
            final_score -= deduction
            penalties.append({
                "name": "Minor Similarity",
                "detail": f"{plagiarism_pct}% similarity — {deduction} point deduction",
                "deduction": -deduction,
            })
        # <= 5% is considered noise/common phrases — no penalty

        # AI detection: informational only, NO score penalty
        # Displayed as a badge/flag in the UI, not a deduction
        if ai_detection_result["score"] > 80:
            penalties.append({
                "name": "AI Content Flag",
                "detail": f"AI probability {ai_detection_result['score']}% — flagged for review (no score deduction)",
                "deduction": 0,
            })

        # Off-topic floor: if essay is completely off-topic, cap the score
        if topic_score < 10:
            off_topic_cap = 25.0
            if final_score > off_topic_cap:
                overshoot = round(final_score - off_topic_cap, 2)
                final_score = off_topic_cap
                penalties.append({
                    "name": "Off-Topic",
                    "detail": f"Topic relevance {topic_score}% — score capped at {off_topic_cap}",
                    "deduction": -overshoot,
                })

        final_score = round(max(0.0, min(100.0, final_score)), 2)

        score_breakdown = {
            "weighted_components": weighted_components,
            "weighted_total": weighted_total,
            "penalties": penalties,
            "final_score": final_score,
        }

        grade = self._assign_grade(final_score)

        # ── Step 5: Generate Feedback ──
        _update("generating_feedback")
        feedback = await rag_engine.generate_feedback(
            text, grammar_result, vocab_result, coherence_result, topic_result
        )

        return {
            "final_score": round(final_score, 2),
            "grade": grade,
            "rubric_used": rubric.name if rubric else "Default",
            "scoring_engine": scoring_engine,
            "components": {
                "grammar": grammar_result,
                "plagiarism": plagiarism_result,
                "vocabulary": vocab_result,
                "coherence": coherence_result,
                "topic_relevance": topic_result,
                "ai_detection": ai_detection_result,
            },
            "score_breakdown": score_breakdown,
            "overall_feedback": feedback,
        }

    def _match_criterion(self, name: str) -> str:
        """Map a rubric criterion name to an internal score key."""
        n = name.lower()
        grammar_words = ["grammar", "mechanic", "spelling", "punctuation", "syntax"]
        vocab_words = ["vocab", "lexic", "word choice", "diction", "language use"]
        coherence_words = ["coheren", "flow", "structure", "organization", "logic", "clarity",
                           "consistency", "quality"]
        topic_words = ["topic", "relevan", "prompt", "focus", "content", "thesis", "argument"]

        if any(w in n for w in grammar_words):
            return "grammar"
        elif any(w in n for w in vocab_words):
            return "vocabulary"
        elif any(w in n for w in coherence_words):
            return "coherence"
        elif any(w in n for w in topic_words):
            return "topic_relevance"
        return None

    def _assign_grade(self, score: float) -> str:
        if score >= 90: return "A+"
        elif score >= 85: return "A"
        elif score >= 80: return "A-"
        elif score >= 75: return "B+"
        elif score >= 70: return "B"
        elif score >= 65: return "B-"
        elif score >= 60: return "C+"
        elif score >= 55: return "C"
        elif score >= 50: return "C-"
        else: return "F"


evaluation_orchestrator = EvaluationOrchestrator()
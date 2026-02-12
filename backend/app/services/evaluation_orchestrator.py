import logging
from typing import Dict, Any
from app.ai.grammar_analyzer import grammar_analyzer
from app.ai.plagiarism_detector import plagiarism_detector
from app.ai.vocabulary_analyzer import vocabulary_analyzer
from app.ai.coherence_scorer import coherence_scorer
from app.ai.topic_relevance import topic_relevance_analyzer
from app.ai.ai_text_detector import ai_text_detector
from app.ai.rag_engine import rag_engine
from app.models.rubric import Rubric

logger = logging.getLogger(__name__)

class EvaluationOrchestrator:
    """
    Coordinator service that runs various AI analysis modules on a document
    and aggregates the results.
    """
    
    async def evaluate_document(
        self, 
        text: str, 
        document_id: str = None, 
        prompt: str = None,
        rubric: Rubric = None
    ) -> Dict[str, Any]:
        """
        Runs all available evaluation modules on the text.
        """
        if not text:
            raise ValueError("No text provided for evaluation")

        logger.info("Starting document evaluation...")
        
        # 1. Grammar Analysis
        logger.info("Running Grammar Analysis...")
        grammar_result = await grammar_analyzer.analyze(text)
        
        # 2. Plagiarism Detection
        logger.info("Running Plagiarism Detection...")
        plagiarism_result = plagiarism_detector.check_plagiarism(text, exclude_doc_id=document_id)
        
        # 3. Vocabulary Analysis
        logger.info("Running Vocabulary Analysis...")
        vocab_result = vocabulary_analyzer.analyze(text)
        
        # 4. Coherence Analysis
        logger.info("Running Coherence Analysis...")
        coherence_result = coherence_scorer.analyze(text)

        # 5. Topic Relevance (if prompt provided)
        topic_result = {"score": 100, "similarity": 1.0} # Default perfect if no prompt
        if prompt:
            logger.info("Running Topic Relevance Analysis...")
            topic_result = topic_relevance_analyzer.analyze(text, prompt)
            
        # 6. AI Text Detection
        logger.info("Running AI Text Detection...")
        ai_detection_result = ai_text_detector.detect(text)
        
        # 7. Aggregation using Rubric
        grammar_score = grammar_result["score"]
        vocab_score = vocab_result["score"]
        coherence_score = coherence_result["score"]
        topic_score = topic_result["score"]
        plagiarism_pct = plagiarism_result["percentage"]
        
        # Map component names to local score variables
        score_map = {
            "Grammar": grammar_score,
            "Vocabulary": vocab_score,
            "Coherence": coherence_score,
            "Topic Relevance": topic_score
        }
        
        weighted_score = 0.0
        
        if rubric:
            logger.info(f"Using Rubric: {rubric.name}")
            for criterion in rubric.criteria:
                # Fuzzy match criterion name to available scores
                # Default to 0 if criterion logic not implemented yet
                c_name = criterion.name
                c_score = 0.0
                
                # Simple mapping logic (can be made more robust)
                if "Grammar" in c_name or "Mechanics" in c_name:
                    c_score = grammar_score
                elif "Vocabulary" in c_name or "Lexical" in c_name:
                    c_score = vocab_score
                elif "Coherence" in c_name or "Flow" in c_name or "Structure" in c_name:
                    c_score = coherence_score
                elif "Topic" in c_name or "Relevance" in c_name or "Prompt" in c_name:
                    c_score = topic_score
                else:
                    logger.warning(f"Unknown criterion in rubric: {c_name}. Skipping score contribution.")
                    
                weighted_score += (c_score * (criterion.weight / 100.0))
        else:
            # Fallback Legacy Weights
            logger.info("No rubric provided. Using default weights.")
            weighted_score = (
                (grammar_score * 0.30) +
                (vocab_score * 0.20) +
                (coherence_score * 0.20) +
                (topic_score * 0.30)
            )
        
        final_score = weighted_score
        
        # Apply penalties
        if plagiarism_pct > 0:
            deduction = plagiarism_pct * 0.5
            final_score -= deduction
            
        if plagiarism_pct > 30:
             final_score *= 0.5 # Severe penalty
             
        # AI Penalty (if high confidence)
        if ai_detection_result["score"] > 80:
            final_score *= 0.8 # 20% penalty for AI generated content

        final_score = max(0.0, min(100.0, final_score))
        
        # Assign Grade
        grade = self._assign_grade(final_score)
        
        # Generate Qualitative Feedback
        feedback = await rag_engine.generate_feedback(
            text, grammar_result, vocab_result, coherence_result, topic_result
        )
        
        return {
            "final_score": round(final_score, 2),
            "grade": grade,
            "rubric_used": rubric.name if rubric else "Default",
            "components": {
                "grammar": grammar_result,
                "plagiarism": plagiarism_result,
                "vocabulary": vocab_result,
                "coherence": coherence_result,
                "topic_relevance": topic_result,
                "ai_detection": ai_detection_result
            },
            "overall_feedback": feedback
        }

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
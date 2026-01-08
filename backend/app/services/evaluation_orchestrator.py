import logging
from typing import Dict, Any
from app.ai.grammar_analyzer import grammar_analyzer
from app.ai.plagiarism_detector import plagiarism_detector
from app.ai.vocabulary_analyzer import vocabulary_analyzer
from app.ai.coherence_scorer import coherence_scorer

logger = logging.getLogger(__name__)

class EvaluationOrchestrator:
    """
    Coordinator service that runs various AI analysis modules on a document
    and aggregates the results.
    """
    
    async def evaluate_document(self, text: str, document_id: str = None) -> Dict[str, Any]:
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
        
        # 5. Aggregation
        # Weights:
        # Grammar: 40%
        # Vocabulary: 25%
        # Coherence: 25%
        # Plagiarism: Penalty only
        
        grammar_score = grammar_result["score"]
        vocab_score = vocab_result["score"]
        coherence_score = coherence_result["score"]
        plagiarism_pct = plagiarism_result["percentage"]
        
        # Base Score
        weighted_score = (
            (grammar_score * 0.40) +
            (vocab_score * 0.30) +
            (coherence_score * 0.30)
        )
        
        final_score = weighted_score
        
        # Apply penalties
        if plagiarism_pct > 0:
            deduction = plagiarism_pct * 0.5
            final_score -= deduction
            
        if plagiarism_pct > 30:
             final_score *= 0.5 # Severe penalty per PRD

        final_score = max(0.0, min(100.0, final_score))
        
        # Assign Grade
        grade = self._assign_grade(final_score)
        
        return {
            "final_score": round(final_score, 2),
            "grade": grade,
            "components": {
                "grammar": grammar_result,
                "plagiarism": plagiarism_result,
                "vocabulary": vocab_result,
                "coherence": coherence_result
            },
            "feedback": self._generate_feedback(
                grammar_result, 
                plagiarism_result, 
                vocab_result, 
                coherence_result
            )
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

    def _generate_feedback(self, grammar: Dict, plagiarism: Dict, vocab: Dict, coherence: Dict) -> str:
        """
        Generates simple feedback based on analysis.
        """
        feedback = []
        
        # Grammar
        if grammar["score"] > 85:
            feedback.append("Excellent grammar.")
        elif grammar["score"] < 60:
            feedback.append("Needs significant grammar review.")
            
        # Vocabulary
        if vocab["score"] > 80:
            feedback.append("Strong use of vocabulary.")
        elif vocab["score"] < 50:
            feedback.append("Try to use more varied and academic language.")
            
        # Coherence
        if coherence["score"] > 80:
            feedback.append("Well-structured and easy to follow.")
        elif coherence["score"] < 50:
            feedback.append("Consider improving paragraph transitions and structure.")

        # Plagiarism
        if plagiarism["percentage"] > 10:
             feedback.append(f"WARNING: Plagiarism detected ({plagiarism['percentage']}%).")
             
        return " ".join(feedback)

evaluation_orchestrator = EvaluationOrchestrator()

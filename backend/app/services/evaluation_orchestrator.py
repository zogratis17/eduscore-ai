import logging
from typing import Dict, Any
from app.ai.grammar_analyzer import grammar_analyzer
from app.ai.plagiarism_detector import plagiarism_detector

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
        # Note: In a real scenario, we should ensure the corpus is loaded.
        # For this MVP, we rely on the corpus being built/loaded separately 
        # or incrementally.
        plagiarism_result = plagiarism_detector.check_plagiarism(text, exclude_doc_id=document_id)
        
        # 3. Aggregation
        # Phase 1 MVP Weights (Normalized for available components)
        # Grammar: 80%, Plagiarism Penalty: 20%
        
        grammar_score = grammar_result["score"]
        plagiarism_penalty = plagiarism_result["percentage"]
        
        # Formula: (Grammar * 0.8) - (Plagiarism * 0.5) 
        # Adjusted to be robust:
        # Base score comes from grammar. Plagiarism acts as a heavy penalty.
        
        final_score = (grammar_score * 1.0) 
        
        # Apply penalties
        if plagiarism_penalty > 0:
            # 1% plagiarism = 1 point deduction? Or stricter?
            # PRD suggests severe penalty if > 30%
            deduction = plagiarism_penalty * 0.5
            final_score -= deduction
            
        if plagiarism_penalty > 30:
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
                # "vocabulary": ...
            },
            "feedback": self._generate_feedback(grammar_result, plagiarism_result)
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

    def _generate_feedback(self, grammar_result: Dict, plagiarism_result: Dict) -> str:
        """
        Generates simple feedback based on analysis.
        """
        score = grammar_result["score"]
        error_count = grammar_result["error_count"]
        plagiarism_pct = plagiarism_result["percentage"]
        
        feedback = []
        
        # Grammar Feedback
        if score > 90:
            feedback.append("Excellent work! Your writing is grammatically sound.")
        elif score > 75:
            feedback.append("Good job. There are a few grammar issues to address.")
        else:
            feedback.append("Needs improvement. Please review the grammar errors carefully.")
            
        if error_count > 0:
            feedback.append(f"Found {error_count} potential grammar or style issues.")
            
        # Plagiarism Feedback
        if plagiarism_pct > 30:
             feedback.append(f"WARNING: High plagiarism detected ({plagiarism_pct}%). Please review academic integrity guidelines.")
        elif plagiarism_pct > 0:
             feedback.append(f"Note: Some content matches existing sources ({plagiarism_pct}%). Ensure proper citation.")
             
        return " ".join(feedback)

evaluation_orchestrator = EvaluationOrchestrator()

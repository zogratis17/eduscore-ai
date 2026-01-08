import logging
from typing import Dict, Any
from app.ai.grammar_analyzer import grammar_analyzer
# Will import other analyzers here as they are built
# from app.ai.plagiarism_detector import plagiarism_detector

logger = logging.getLogger(__name__)

class EvaluationOrchestrator:
    """
    Coordinator service that runs various AI analysis modules on a document
    and aggregates the results.
    """
    
    async def evaluate_document(self, text: str) -> Dict[str, Any]:
        """
        Runs all available evaluation modules on the text.
        """
        if not text:
            raise ValueError("No text provided for evaluation")

        logger.info("Starting document evaluation...")
        
        # 1. Grammar Analysis
        logger.info("Running Grammar Analysis...")
        grammar_result = await grammar_analyzer.analyze(text)
        
        # 2. Plagiarism Detection (Placeholder)
        # plagiarism_result = await plagiarism_detector.check(text)
        
        # 3. Aggregation
        # For MVP Phase 1, we focus on Grammar. 
        # Future: Calculate weighted average based on rubric.
        
        # Final Score Logic (Simplified for now)
        final_score = grammar_result["score"]
        
        # Assign Grade
        grade = self._assign_grade(final_score)
        
        return {
            "final_score": round(final_score, 2),
            "grade": grade,
            "components": {
                "grammar": grammar_result,
                # "plagiarism": plagiarism_result,
                # "vocabulary": ...
            },
            "feedback": self._generate_feedback(grammar_result)
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

    def _generate_feedback(self, grammar_result: Dict) -> str:
        """
        Generates simple feedback based on analysis.
        Start of the 'Feedback Generation' feature.
        """
        score = grammar_result["score"]
        error_count = grammar_result["error_count"]
        
        feedback = []
        
        if score > 90:
            feedback.append("Excellent work! Your writing is grammatically sound.")
        elif score > 75:
            feedback.append("Good job. There are a few grammar issues to address.")
        else:
            feedback.append("Needs improvement. Please review the grammar errors carefully.")
            
        if error_count > 0:
            feedback.append(f"Found {error_count} potential grammar or style issues.")
            
        return " ".join(feedback)

evaluation_orchestrator = EvaluationOrchestrator()

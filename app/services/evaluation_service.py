"""Main evaluation service that coordinates all analysis components."""
from datetime import datetime
from app.models.schemas import EvaluationResults
from app.services.grammar_service import grammar_service
from app.services.vocabulary_service import vocabulary_service
from app.services.topic_service import topic_relevance_service
from app.services.coherence_service import coherence_service
from app.services.plagiarism_service import plagiarism_service
from app.config import settings


class EvaluationService:
    """Main service for document evaluation."""
    
    @staticmethod
    def _calculate_letter_grade(score: float) -> str:
        """
        Convert numerical score to letter grade.
        
        Args:
            score: Numerical score (0-100)
            
        Returns:
            str: Letter grade
        """
        if score >= 90:
            return "A"
        elif score >= 80:
            return "B"
        elif score >= 70:
            return "C"
        elif score >= 60:
            return "D"
        else:
            return "F"
    
    @staticmethod
    def _generate_feedback(results: dict) -> str:
        """
        Generate AI-powered feedback based on results.
        
        Args:
            results: Dictionary of all analysis results
            
        Returns:
            str: Generated feedback
        """
        feedback_parts = []
        
        # Grammar feedback
        grammar = results['grammar']
        if grammar.score >= 80:
            feedback_parts.append("Your writing demonstrates strong grammar and language skills.")
        elif grammar.score >= 60:
            feedback_parts.append(f"Your writing has some grammar issues ({grammar.total_errors} errors found). Review the suggestions to improve.")
        else:
            feedback_parts.append(f"Your writing needs significant improvement in grammar ({grammar.total_errors} errors found).")
        
        # Vocabulary feedback
        vocab = results['vocabulary']
        if vocab.lexical_diversity >= 0.5:
            feedback_parts.append("Your vocabulary usage is diverse and sophisticated.")
        else:
            feedback_parts.append("Consider using more varied vocabulary to enhance your writing.")
        
        # Topic relevance feedback
        topic = results['topic_relevance']
        if topic.similarity_score >= 0.8:
            feedback_parts.append("Your submission is highly relevant to the topic.")
        elif topic.similarity_score >= 0.6:
            feedback_parts.append("Your submission is moderately on-topic but could be more focused.")
        else:
            feedback_parts.append("Your submission may be off-topic. Review the assignment requirements.")
        
        # Coherence feedback
        coherence = results['coherence']
        if coherence.transition_word_count >= 5:
            feedback_parts.append("Good use of transition words for flow and coherence.")
        else:
            feedback_parts.append("Add more transition words to improve the flow of your writing.")
        
        # Plagiarism feedback
        plagiarism = results['plagiarism']
        if plagiarism.similarity_percentage > 30:
            feedback_parts.append(f"⚠️ High similarity detected ({plagiarism.similarity_percentage}%). Ensure proper citations and original work.")
        elif plagiarism.similarity_percentage > 15:
            feedback_parts.append(f"Moderate similarity detected ({plagiarism.similarity_percentage}%). Review for proper citations.")
        else:
            feedback_parts.append("No significant plagiarism detected. Good original work.")
        
        return " ".join(feedback_parts)
    
    @staticmethod
    async def evaluate_document(
        document_id: str,
        text: str,
        prompt_text: str = None
    ) -> EvaluationResults:
        """
        Perform complete evaluation of a document.
        
        Args:
            document_id: Document identifier
            text: Document text
            prompt_text: Optional assignment prompt
            
        Returns:
            EvaluationResults: Complete evaluation results
        """
        # Perform all analyses
        grammar_analysis = grammar_service.analyze(text)
        vocabulary_analysis = vocabulary_service.analyze(text)
        topic_analysis = topic_relevance_service.analyze(text, prompt_text)
        coherence_analysis = coherence_service.analyze(text)
        plagiarism_analysis = await plagiarism_service.analyze(text, document_id)
        
        # Calculate weighted overall score
        overall_score = (
            grammar_analysis.score * settings.grammar_weight +
            vocabulary_analysis.score * settings.vocabulary_weight +
            topic_analysis.score * settings.topic_relevance_weight +
            coherence_analysis.score * settings.coherence_weight +
            plagiarism_analysis.score * settings.plagiarism_weight
        )
        
        # Get letter grade
        letter_grade = EvaluationService._calculate_letter_grade(overall_score)
        
        # Generate feedback
        feedback = EvaluationService._generate_feedback({
            'grammar': grammar_analysis,
            'vocabulary': vocabulary_analysis,
            'topic_relevance': topic_analysis,
            'coherence': coherence_analysis,
            'plagiarism': plagiarism_analysis
        })
        
        return EvaluationResults(
            document_id=document_id,
            overall_score=round(overall_score, 2),
            letter_grade=letter_grade,
            grammar=grammar_analysis,
            vocabulary=vocabulary_analysis,
            topic_relevance=topic_analysis,
            coherence=coherence_analysis,
            plagiarism=plagiarism_analysis,
            evaluated_at=datetime.utcnow(),
            feedback=feedback
        )


evaluation_service = EvaluationService()

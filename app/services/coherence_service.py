"""Coherence and structure analysis service."""
import re
import numpy as np
from typing import List
from app.models.schemas import CoherenceAnalysis


class CoherenceService:
    """Service for coherence and structure analysis."""
    
    # Common transition words
    TRANSITION_WORDS = {
        'however', 'therefore', 'furthermore', 'moreover', 'consequently',
        'meanwhile', 'nevertheless', 'thus', 'hence', 'additionally',
        'similarly', 'likewise', 'conversely', 'alternatively', 'subsequently',
        'accordingly', 'besides', 'nonetheless', 'otherwise', 'indeed',
        'first', 'second', 'third', 'finally', 'firstly', 'secondly',
        'in conclusion', 'in summary', 'for example', 'for instance',
        'in addition', 'on the other hand', 'as a result'
    }
    
    @staticmethod
    def analyze(text: str) -> CoherenceAnalysis:
        """
        Analyze text coherence and structure.
        
        Args:
            text: Text to analyze
            
        Returns:
            CoherenceAnalysis: Analysis results
        """
        # Split into paragraphs
        paragraphs = [p.strip() for p in text.split('\n') if p.strip()]
        paragraph_count = len(paragraphs)
        
        if paragraph_count == 0:
            return CoherenceAnalysis(
                paragraph_count=0,
                avg_sentences_per_paragraph=0.0,
                sentence_length_variance=0.0,
                transition_word_count=0,
                score=0.0
            )
        
        # Count sentences per paragraph
        sentences_per_para = []
        all_sentence_lengths = []
        
        for para in paragraphs:
            # Split into sentences
            sentences = re.split(r'[.!?]+', para)
            sentences = [s.strip() for s in sentences if s.strip()]
            sentences_per_para.append(len(sentences))
            
            # Track sentence lengths (in words)
            for sentence in sentences:
                words = sentence.split()
                all_sentence_lengths.append(len(words))
        
        avg_sentences_per_paragraph = np.mean(sentences_per_para) if sentences_per_para else 0
        
        # Calculate sentence length variance
        sentence_length_variance = np.var(all_sentence_lengths) if all_sentence_lengths else 0
        
        # Count transition words
        text_lower = text.lower()
        transition_count = sum(
            text_lower.count(word)
            for word in CoherenceService.TRANSITION_WORDS
        )
        
        # Calculate score (0-100)
        # Good structure: 3-5 sentences per paragraph
        para_score = 100 if 3 <= avg_sentences_per_paragraph <= 5 else \
                     max(0, 100 - abs(avg_sentences_per_paragraph - 4) * 15)
        
        # Moderate variance is good (15-50)
        variance_score = 100 if 15 <= sentence_length_variance <= 50 else \
                        max(0, 100 - abs(sentence_length_variance - 30) * 2)
        
        # Transition words (at least 1 per 100 words is good)
        total_words = len(text.split())
        expected_transitions = total_words / 100
        transition_score = min(100, (transition_count / max(expected_transitions, 1)) * 100)
        
        # Combined score
        final_score = (para_score * 0.3) + (variance_score * 0.3) + (transition_score * 0.4)
        
        return CoherenceAnalysis(
            paragraph_count=paragraph_count,
            avg_sentences_per_paragraph=round(avg_sentences_per_paragraph, 2),
            sentence_length_variance=round(sentence_length_variance, 2),
            transition_word_count=transition_count,
            score=round(final_score, 2)
        )


coherence_service = CoherenceService()

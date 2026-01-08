import re
import statistics
from typing import Dict, Any, List

class CoherenceScorer:
    """
    Analyzes structure and flow of the document.
    """
    
    TRANSITION_WORDS = {
        'however', 'therefore', 'furthermore', 'moreover', 'consequently', 
        'nevertheless', 'nonetheless', 'meanwhile', 'subsequently', 'conversely', 
        'similarly', 'additionally', 'finally', 'initially', 'specifically',
        'for example', 'in conclusion', 'on the other hand', 'as a result'
    }

    def analyze(self, text: str) -> Dict[str, Any]:
        if not text:
            return {"score": 0, "analysis": {}}

        # Split into paragraphs
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        
        # 1. Paragraph Count & Length Consistency
        para_count = len(paragraphs)
        if para_count == 0:
            return {"score": 0, "analysis": {}}
            
        para_lengths = [len(p.split()) for p in paragraphs]
        para_length_variance = statistics.stdev(para_lengths) if para_count > 1 else 0
        avg_para_length = statistics.mean(para_lengths)
        
        # 2. Transition Word Usage
        transition_count = 0
        lower_text = text.lower()
        for word in self.TRANSITION_WORDS:
            transition_count += lower_text.count(word)
            
        transitions_per_para = transition_count / para_count
        
        # 3. Calculate Score
        # Structure: Target 3-10 paragraphs
        if 3 <= para_count <= 15:
            score_structure = 100
        else:
            score_structure = 50 # Too short or too long
            
        # Transitions: Target >= 0.5 per paragraph
        score_flow = min(transitions_per_para * 2.0, 1.0) * 100
        
        # Balance: Lower variance is better (but not zero)
        # Normalize variance relative to mean. CV = SD/Mean
        cv = para_length_variance / avg_para_length if avg_para_length > 0 else 0
        # If CV < 0.5 (consistent), score high. If CV > 1.0 (erratic), score low.
        score_balance = max(0, 100 - (cv * 50))
        
        final_score = (score_structure * 0.3) + (score_flow * 0.4) + (score_balance * 0.3)
        final_score = max(0.0, min(100.0, final_score))
        
        return {
            "score": round(final_score, 2),
            "analysis": {
                "paragraph_count": para_count,
                "avg_paragraph_length_words": round(avg_para_length, 1),
                "transition_word_count": transition_count,
                "structure_rating": "Good" if score_structure > 80 else "Needs Improvement"
            }
        }

coherence_scorer = CoherenceScorer()

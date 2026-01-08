import re
from typing import Dict, Any, List, Set

class VocabularyAnalyzer:
    """
    Analyzes vocabulary richness, including lexical diversity and word length.
    """
    
    # Simple list of academic/complex words (could be expanded or loaded from file)
    ACADEMIC_WORDS = {
        'analysis', 'approach', 'assessment', 'assumption', 'authority', 'available', 
        'benefit', 'concept', 'consistent', 'constitutional', 'context', 'contract', 
        'creation', 'data', 'definition', 'derived', 'distribution', 'economic', 
        'environment', 'established', 'estimate', 'evidence', 'export', 'factors', 
        'financial', 'formula', 'function', 'identified', 'income', 'indicate', 
        'individual', 'interpretation', 'involved', 'issues', 'labor', 'legal', 
        'legislation', 'major', 'method', 'occur', 'percent', 'period', 'policy', 
        'principle', 'procedure', 'process', 'required', 'research', 'response', 
        'role', 'section', 'sector', 'significant', 'similar', 'source', 'specific', 
        'structure', 'theory', 'variable', 'significant', 'subsequent', 'sufficient'
    }

    def analyze(self, text: str) -> Dict[str, Any]:
        if not text:
            return {"score": 0, "metrics": {}}

        tokens = self._tokenize(text)
        if not tokens:
            return {"score": 0, "metrics": {}}

        # 1. Lexical Diversity (Type-Token Ratio)
        # Ratio of unique words to total words
        unique_tokens = set(tokens)
        ttr = len(unique_tokens) / len(tokens)
        
        # 2. Average Word Length
        avg_word_length = sum(len(w) for w in tokens) / len(tokens)
        
        # 3. Academic Word Usage
        academic_count = sum(1 for w in tokens if w in self.ACADEMIC_WORDS)
        academic_percentage = academic_count / len(tokens)
        
        # 4. Calculate Score
        # Formula: Weighted average of normalized metrics
        # TTR (target > 0.4 for essays), Avg Length (target > 5), Academic (> 2%)
        
        score_ttr = min(ttr * 2.0, 1.0) * 100  # 0.5 TTR -> 100
        score_len = min((avg_word_length - 3) / 3.0, 1.0) * 100 # 3 chars=0, 6 chars=100
        score_acad = min(academic_percentage * 20.0, 1.0) * 100 # 5% -> 100
        
        # Weights: TTR 40%, Length 30%, Academic 30%
        final_score = (score_ttr * 0.4) + (score_len * 0.3) + (score_acad * 0.3)
        final_score = max(0.0, min(100.0, final_score))
        
        return {
            "score": round(final_score, 2),
            "metrics": {
                "lexical_diversity": round(ttr, 2),
                "avg_word_length": round(avg_word_length, 2),
                "academic_word_percentage": round(academic_percentage * 100, 2),
                "unique_words": len(unique_tokens),
                "total_words": len(tokens)
            }
        }

    def _tokenize(self, text: str) -> List[str]:
        # Simple tokenization: lowercase, remove punctuation
        text = text.lower()
        text = re.sub(r'[^\w\s]', '', text)
        return [w for w in text.split() if w.strip()]

vocabulary_analyzer = VocabularyAnalyzer()

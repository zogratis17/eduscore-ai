import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from typing import Dict, Any

class ReportGenerator:
    """
    Generates PDF reports for document evaluations.
    """
    
    def generate_pdf(self, evaluation: Dict[str, Any], document: Dict[str, Any]) -> bytes:
        """
        Generates a PDF report in memory.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []

        # -- Title --
        title_style = styles["Title"]
        elements.append(Paragraph("EduScore AI - Evaluation Report", title_style))
        elements.append(Spacer(1, 0.2 * inch))

        # -- Document Info --
        info_data = [
            ["Filename:", document.get("original_filename", "Unknown")],
            ["Date:", evaluation.get("created_at", "").strftime("%Y-%m-%d %H:%M") if hasattr(evaluation.get("created_at"), "strftime") else str(evaluation.get("created_at"))],
            ["Grade:", evaluation.get("grade", "N/A")],
            ["Score:", f"{evaluation.get('final_score', 0)}/100"]
        ]
        
        t = Table(info_data, colWidths=[1.5*inch, 4*inch])
        t.setStyle(TableStyle([
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 0.3 * inch))

        # -- Overall Feedback --
        elements.append(Paragraph("Overall Feedback", styles["Heading2"]))
        elements.append(Paragraph(evaluation.get("overall_feedback", "No feedback provided."), styles["Normal"]))
        elements.append(Spacer(1, 0.2 * inch))

        # -- Component Scores --
        components = evaluation.get("components", {})
        
        # Grammar
        grammar = components.get("grammar", {})
        self._add_section(elements, styles, "Grammar Analysis", 
                          f"Score: {grammar.get('score', 0)}/100", 
                          f"Found {grammar.get('error_count', 0)} potential issues.")

        # Vocabulary
        vocab = components.get("vocabulary", {})
        metrics = vocab.get("metrics", {})
        vocab_text = (f"Score: {vocab.get('score', 0)}/100. "
                      f"Lexical Diversity: {metrics.get('lexical_diversity', 0)}. "
                      f"Avg Word Length: {metrics.get('avg_word_length', 0)}.")
        self._add_section(elements, styles, "Vocabulary", vocab_text)

        # Coherence
        coherence = components.get("coherence", {})
        self._add_section(elements, styles, "Coherence & Flow", 
                          f"Score: {coherence.get('score', 0)}/100",
                          f"Structure Rating: {coherence.get('analysis', {}).get('structure_rating', 'N/A')}")

        # Plagiarism
        plagiarism = components.get("plagiarism", {})
        plag_score = plagiarism.get("percentage", 0)
        plag_color = "red" if plag_score > 10 else "black"
        plag_text = f"Similarity Detected: {plag_score}%"
        self._add_section(elements, styles, "Plagiarism Check", plag_text)

        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    def _add_section(self, elements, styles, title, *lines):
        elements.append(Paragraph(title, styles["Heading3"]))
        for line in lines:
            elements.append(Paragraph(line, styles["Normal"]))
        elements.append(Spacer(1, 0.1 * inch))

report_generator = ReportGenerator()

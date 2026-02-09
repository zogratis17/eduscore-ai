"""PDF report export service."""
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime
import io
from typing import Dict


class ExportService:
    """Service for exporting evaluation results to PDF."""
    
    @staticmethod
    def generate_pdf_report(document_data: Dict, evaluation_results: Dict) -> bytes:
        """
        Generate a PDF report of evaluation results.
        
        Args:
            document_data: Document information
            evaluation_results: Evaluation results
            
        Returns:
            bytes: PDF file content
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter,
                               rightMargin=72, leftMargin=72,
                               topMargin=72, bottomMargin=18)
        
        # Container for the 'Flowable' objects
        elements = []
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a1a1a'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#2c3e50'),
            spaceAfter=12,
            spaceBefore=12
        )
        
        # Title
        elements.append(Paragraph("Document Evaluation Report", title_style))
        elements.append(Spacer(1, 12))
        
        # Document Information
        elements.append(Paragraph("Document Information", heading_style))
        doc_info = [
            ['Filename:', document_data.get('filename', 'N/A')],
            ['Upload Date:', document_data.get('uploaded_at', datetime.utcnow()).strftime('%Y-%m-%d %H:%M')],
            ['File Type:', document_data.get('file_type', 'N/A').upper()],
            ['Word Count:', str(document_data.get('word_count', 0))],
            ['Page Count:', str(document_data.get('page_count', 0))]
        ]
        
        doc_table = Table(doc_info, colWidths=[2*inch, 4*inch])
        doc_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f0f0')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
        ]))
        elements.append(doc_table)
        elements.append(Spacer(1, 20))
        
        # Overall Score
        elements.append(Paragraph("Overall Results", heading_style))
        overall_data = [
            ['Overall Score:', f"{evaluation_results.get('overall_score', 0):.2f}/100"],
            ['Letter Grade:', evaluation_results.get('letter_grade', 'N/A')],
            ['Evaluation Date:', evaluation_results.get('evaluated_at', datetime.utcnow()).strftime('%Y-%m-%d %H:%M')]
        ]
        
        overall_table = Table(overall_data, colWidths=[2*inch, 4*inch])
        overall_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e8f5e9')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 1), (1, 1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
        ]))
        elements.append(overall_table)
        elements.append(Spacer(1, 20))
        
        # Component Scores
        elements.append(Paragraph("Component Scores Breakdown", heading_style))
        
        grammar = evaluation_results.get('grammar', {})
        vocabulary = evaluation_results.get('vocabulary', {})
        topic = evaluation_results.get('topic_relevance', {})
        coherence = evaluation_results.get('coherence', {})
        plagiarism = evaluation_results.get('plagiarism', {})
        
        component_data = [
            ['Component', 'Score', 'Weight'],
            ['Grammar & Language', f"{grammar.get('score', 0):.2f}", '20%'],
            ['Vocabulary Quality', f"{vocabulary.get('score', 0):.2f}", '15%'],
            ['Topic Relevance', f"{topic.get('score', 0):.2f}", '25%'],
            ['Coherence & Structure', f"{coherence.get('score', 0):.2f}", '20%'],
            ['Plagiarism Check', f"{plagiarism.get('score', 0):.2f}", '20%']
        ]
        
        component_table = Table(component_data, colWidths=[3*inch, 1.5*inch, 1.5*inch])
        component_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#34495e')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(component_table)
        elements.append(Spacer(1, 20))
        
        # Detailed Analysis
        elements.append(PageBreak())
        elements.append(Paragraph("Detailed Analysis", heading_style))
        elements.append(Spacer(1, 12))
        
        # Grammar Details
        elements.append(Paragraph("<b>Grammar & Language Analysis</b>", styles['Heading3']))
        grammar_details = f"""
        Total Errors: {grammar.get('total_errors', 0)}<br/>
        Readability Score: {grammar.get('readability_score', 0):.2f}<br/>
        Score: {grammar.get('score', 0):.2f}/100
        """
        elements.append(Paragraph(grammar_details, styles['Normal']))
        elements.append(Spacer(1, 12))
        
        # Top Grammar Errors
        errors = grammar.get('errors', [])[:10]
        if errors:
            elements.append(Paragraph("<b>Top Grammar Issues:</b>", styles['Normal']))
            for i, error in enumerate(errors, 1):
                error_text = f"{i}. {error.get('message', 'N/A')} (Category: {error.get('category', 'N/A')})"
                elements.append(Paragraph(error_text, styles['Normal']))
            elements.append(Spacer(1, 12))
        
        # Vocabulary Details
        elements.append(Paragraph("<b>Vocabulary Quality</b>", styles['Heading3']))
        vocab_details = f"""
        Lexical Diversity: {vocabulary.get('lexical_diversity', 0):.4f}<br/>
        Average Word Length: {vocabulary.get('average_word_length', 0):.2f}<br/>
        Unique Words: {vocabulary.get('unique_words', 0)}<br/>
        Total Words: {vocabulary.get('total_words', 0)}<br/>
        Score: {vocabulary.get('score', 0):.2f}/100
        """
        elements.append(Paragraph(vocab_details, styles['Normal']))
        elements.append(Spacer(1, 12))
        
        # Coherence Details
        elements.append(Paragraph("<b>Coherence & Structure</b>", styles['Heading3']))
        coherence_details = f"""
        Paragraph Count: {coherence.get('paragraph_count', 0)}<br/>
        Avg Sentences per Paragraph: {coherence.get('avg_sentences_per_paragraph', 0):.2f}<br/>
        Transition Words: {coherence.get('transition_word_count', 0)}<br/>
        Score: {coherence.get('score', 0):.2f}/100
        """
        elements.append(Paragraph(coherence_details, styles['Normal']))
        elements.append(Spacer(1, 12))
        
        # Plagiarism Details
        elements.append(Paragraph("<b>Plagiarism Detection</b>", styles['Heading3']))
        plagiarism_details = f"""
        Similarity Percentage: {plagiarism.get('similarity_percentage', 0):.2f}%<br/>
        Score: {plagiarism.get('score', 0):.2f}/100
        """
        elements.append(Paragraph(plagiarism_details, styles['Normal']))
        
        matched_segments = plagiarism.get('matched_segments', [])
        if matched_segments:
            elements.append(Paragraph("<b>Matched Segments:</b>", styles['Normal']))
            for i, match in enumerate(matched_segments[:5], 1):
                match_text = f"{i}. \"{match.get('matched_text', 'N/A')[:100]}...\" (Similarity: {match.get('similarity', 0):.2f})"
                elements.append(Paragraph(match_text, styles['Normal']))
        elements.append(Spacer(1, 20))
        
        # Feedback
        elements.append(PageBreak())
        elements.append(Paragraph("Feedback & Recommendations", heading_style))
        feedback_text = evaluation_results.get('feedback', 'No feedback available.')
        elements.append(Paragraph(feedback_text, styles['Normal']))
        
        # Build PDF
        doc.build(elements)
        
        buffer.seek(0)
        return buffer.read()


export_service = ExportService()

import React, { useState } from 'react';
import { Combine } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { PDFDocument } from 'pdf-lib';
import { toast } from 'sonner';
import { addToHistory } from '../../lib/history';

const PdfMerge = () => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ name: string; url: string } | null>(null);

  const handleMerge = async (files: File[]) => {
    setProcessing(true);
    setResult(null);
    
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of files) {
        const fileBytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const name = `merged_${Date.now()}.pdf`;
      
      setResult({ name, url });
      addToHistory({
        name,
        type: 'PDF',
        action: 'Merge',
        date: new Date().toISOString(),
        size: blob.size
      });
      toast.success('PDFs merged successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Error merging PDFs. Ensure all files are valid PDF documents.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Merge PDF"
      description="Combine multiple PDF documents into a single file."
      icon={<Combine className="w-8 h-8" />}
      accept={{ 'application/pdf': ['.pdf'] }}
      onProcess={handleMerge}
      processing={processing}
      result={result}
    >
      <div className="text-sm text-slate-500">
        <p>Upload two or more PDF files to combine them in the order they appear.</p>
        <p className="mt-2 italic">Tip: You can drag and drop to reorder files (coming soon).</p>
      </div>
    </ToolLayout>
  );
};

export default PdfMerge;
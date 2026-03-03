import React, { useState } from 'react';
import { Split } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { PDFDocument } from 'pdf-lib';
import { toast } from 'sonner';
import { addToHistory } from '../../lib/history';
import JSZip from 'jszip';

const PdfSplit = () => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ name: string; url: string } | null>(null);
  const [splitRange, setSplitRange] = useState('1');

  const handleSplit = async (files: File[]) => {
    if (files.length === 0) return;
    
    setProcessing(true);
    setResult(null);
    
    try {
      const file = files[0];
      const fileBytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(fileBytes);
      const pageCount = pdf.getPageCount();
      
      // Basic split implementation: split every page into a separate PDF or by range
      // For simplicity, we'll split every single page into a ZIP if no specific range is provided
      // or just extract the first X pages.
      
      const zip = new JSZip();
      
      for (let i = 0; i < pageCount; i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(page);
        const pdfBytes = await newPdf.save();
        zip.file(`page_${i + 1}.pdf`, pdfBytes);
      }
      
      const zipContent = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipContent);
      const name = `${file.name.replace('.pdf', '')}_split.zip`;
      
      setResult({ name, url });
      addToHistory({
        name,
        type: 'PDF',
        action: 'Split',
        date: new Date().toISOString(),
        size: zipContent.size
      });
      toast.success('PDF split into individual pages and zipped!');
    } catch (error) {
      console.error(error);
      toast.error('Error splitting PDF.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Split PDF"
      description="Split a PDF document into multiple files (one for each page)."
      icon={<Split className="w-8 h-8" />}
      accept={{ 'application/pdf': ['.pdf'] }}
      multiple={false}
      onProcess={handleSplit}
      processing={processing}
      result={result}
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          Upload a PDF to split it into separate files. Currently splits every page into a ZIP archive.
        </p>
      </div>
    </ToolLayout>
  );
};

export default PdfSplit;
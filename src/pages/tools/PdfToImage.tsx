import React, { useState } from 'react';
import { ImageIcon, FileImage } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { toast } from 'sonner';
import { addToHistory } from '../../lib/history';
import JSZip from 'jszip';
import * as pdfjs from 'pdfjs-dist';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfToImage = () => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ name: string; url: string } | null>(null);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');

  const handleConvert = async (files: File[]) => {
    if (files.length === 0) return;
    setProcessing(true);
    setResult(null);
    
    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const zip = new JSZip();
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // High quality
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: context, viewport, canvas }).promise;
        
        const blob = await new Promise<Blob | null>((resolve) => 
          canvas.toBlob((b) => resolve(b), `image/${format}`)
        );
        
        if (blob) {
          zip.file(`page_${i}.${format}`, blob);
        }
      }
      
      const zipContent = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipContent);
      const name = `${file.name.replace('.pdf', '')}_images.zip`;
      
      setResult({ name, url });
      addToHistory({
        name,
        type: 'Image',
        action: 'PDF to Image',
        date: new Date().toISOString(),
        size: zipContent.size
      });
      toast.success('PDF converted to images successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Error converting PDF to images.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF to Image"
      description="Extract pages from a PDF and save them as high-quality images."
      icon={<FileImage className="w-8 h-8" />}
      accept={{ 'application/pdf': ['.pdf'] }}
      multiple={false}
      onProcess={handleConvert}
      processing={processing}
      result={result}
    >
      <div className="space-y-4">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Image Format</label>
        <div className="grid grid-cols-2 gap-2">
          {['png', 'jpeg'].map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f as any)}
              className={`
                py-2 px-3 rounded-lg text-sm font-bold border transition-all
                ${format === f 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}
              `}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
};

export default PdfToImage;
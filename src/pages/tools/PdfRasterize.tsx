import React, { useState } from 'react';
import { Layers, Download, Sliders, AlertCircle } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { toast } from 'sonner';
import { addToHistory } from '../../lib/history';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const PdfRasterize = () => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ name: string; url: string } | null>(null);
  const [dpi, setDpi] = useState(150);

  const handleRasterize = async (files: File[]) => {
    if (files.length === 0) return;
    const sourceFile = files[0];
    
    setProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      const arrayBuffer = await sourceFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      
      const outPdf = await PDFDocument.create();
      
      // Rasterize each page
      for (let i = 1; i <= totalPages; i++) {
        setProgress(Math.round((i / totalPages) * 100));
        
        const page = await pdf.getPage(i);
        const scale = dpi / 72; // 72 is default PDF DPI
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas
        };
        
        await page.render(renderContext).promise;
        
        // Convert canvas to image
        const imgData = canvas.toDataURL('image/jpeg', 0.85);
        const imgBytes = await fetch(imgData).then(res => res.arrayBuffer());
        
        // Embed image in new PDF
        const pdfImg = await outPdf.embedJpg(imgBytes);
        const newPage = outPdf.addPage([viewport.width, viewport.height]);
        newPage.drawImage(pdfImg, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        });
      }

      const pdfBytes = await outPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const name = `rasterized_${sourceFile.name}`;
      
      setResult({ name, url });
      addToHistory({
        name,
        type: 'PDF',
        action: 'Rasterize',
        date: new Date().toISOString(),
        size: blob.size
      });
      toast.success('PDF rasterized successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Error rasterizing PDF.');
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  return (
    <ToolLayout
      title="Rasterize PDF"
      description="Flatten your PDF into an image-based document. Perfect for preventing text selection or flattening forms."
      icon={<Layers className="w-8 h-8" />}
      accept={{ 'application/pdf': ['.pdf'] }}
      multiple={false}
      onProcess={handleRasterize}
      processing={processing}
      result={result}
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <Sliders size={14} /> Output Quality (DPI)
            </label>
            <span className="text-sm font-bold text-blue-600">{dpi} DPI</span>
          </div>
          <input
            type="range"
            min="72"
            max="300"
            step="1"
            value={dpi}
            onChange={(e) => setDpi(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
            <span>Standard (72)</span>
            <span>Print (300)</span>
          </div>
        </div>

        {processing && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span>Rasterizing pages...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-sm">
            <AlertCircle size={16} />
            What is Rasterization?
          </div>
          <p className="text-xs text-blue-600/80 dark:text-blue-400/80 leading-relaxed">
            This process converts every page of your PDF into a high-resolution image. 
            The resulting PDF will look identical but will contain no selectable text or interactive elements.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
};

export default PdfRasterize;
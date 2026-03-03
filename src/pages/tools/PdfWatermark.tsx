import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Type, Image as ImageIcon, Move, RotateCcw, Sliders, Download, Eye, Trash2, ShieldAlert } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { PDFDocument, rgb, degrees, StandardFonts, PDFImage } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from 'sonner';
import { addToHistory } from '../../lib/history';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface WatermarkOptions {
  mode: 'add' | 'remove';
  type: 'text' | 'image';
  text: string;
  imageFile: File | null;
  opacity: number;
  rotation: number;
  scale: number;
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tiled';
  fontSize: number;
  color: string;
}

const PdfWatermark = () => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ name: string; url: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  
  const [options, setOptions] = useState<WatermarkOptions>({
    mode: 'add',
    type: 'text',
    text: 'WATERMARK',
    imageFile: null,
    opacity: 0.5,
    rotation: 45,
    scale: 1,
    position: 'center',
    fontSize: 60,
    color: '#000000',
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (files: File[]) => {
    if (files.length > 0) {
      setSourceFile(files[0]);
      setResult(null);
    }
  };

  const generatePreview = useCallback(async () => {
    if (!sourceFile || !canvasRef.current) return;

    setPreviewLoading(true);
    try {
      const arrayBuffer = await sourceFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      
      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas
        };
        await page.render(renderContext).promise;

        if (options.mode === 'add') {
          // Draw watermark preview overlay
          context.save();
          context.globalAlpha = options.opacity;
          context.translate(canvas.width / 2, canvas.height / 2);
          context.rotate((options.rotation * Math.PI) / 180);
          
          if (options.type === 'text') {
            context.font = `${options.fontSize}px sans-serif`;
            context.fillStyle = options.color;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            
            if (options.position === 'tiled') {
               for (let x = -canvas.width; x < canvas.width; x += 200) {
                 for (let y = -canvas.height; y < canvas.height; y += 150) {
                   context.fillText(options.text, x, y);
                 }
               }
            } else {
              context.fillText(options.text, 0, 0);
            }
          } else if (options.type === 'image' && options.imageFile) {
              try {
                const img = new Image();
                img.src = URL.createObjectURL(options.imageFile);
                await new Promise((resolve) => (img.onload = resolve));
                const imgWidth = img.width * options.scale;
                const imgHeight = img.height * options.scale;
                context.drawImage(img, -imgWidth/2, -imgHeight/2, imgWidth, imgHeight);
              } catch (e) {
                console.error('Image load failed');
              }
          }
          context.restore();
        }
      }
    } catch (error) {
      console.error('Preview error:', error);
    } finally {
      setPreviewLoading(false);
    }
  }, [sourceFile, options]);

  useEffect(() => {
    if (sourceFile) {
      const timer = setTimeout(() => {
        generatePreview();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [sourceFile, options, generatePreview]);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
  };

  const handleProcess = async () => {
    if (!sourceFile) return;
    
    if (options.mode === 'remove') {
      toast.info('Note: Automatic watermark removal is limited by PDF complexity. For best results, use the Rasterize tool if the watermark persists.');
    }

    setProcessing(true);
    try {
      const arrayBuffer = await sourceFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      if (options.mode === 'add') {
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        let watermarkImage: PDFImage | null = null;
        if (options.type === 'image' && options.imageFile) {
          const imgBytes = await options.imageFile.arrayBuffer();
          if (options.imageFile.type === 'image/jpeg') {
            watermarkImage = await pdfDoc.embedJpg(imgBytes);
          } else if (options.imageFile.type === 'image/png') {
            watermarkImage = await pdfDoc.embedPng(imgBytes);
          }
        }

        const { r, g, b } = hexToRgb(options.color);

        for (const page of pages) {
          const { width, height } = page.getSize();
          
          if (options.type === 'text') {
            const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
            const textHeight = options.fontSize;

            if (options.position === 'tiled') {
              for (let x = 0; x < width; x += textWidth + 100) {
                for (let y = 0; y < height; y += textHeight + 100) {
                  page.drawText(options.text, {
                    x,
                    y,
                    size: options.fontSize,
                    font,
                    color: rgb(r, g, b),
                    opacity: options.opacity,
                    rotate: degrees(options.rotation),
                  });
                }
              }
            } else {
              let x = width / 2;
              let y = height / 2;
              
              if (options.position === 'top-left') { x = 50; y = height - 50; }
              else if (options.position === 'top-right') { x = width - 150; y = height - 50; }
              else if (options.position === 'bottom-left') { x = 50; y = 50; }
              else if (options.position === 'bottom-right') { x = width - 150; y = 50; }
              
              page.drawText(options.text, {
                x: x - (options.position === 'center' ? textWidth / 2 : 0),
                y: y - (options.position === 'center' ? textHeight / 2 : 0),
                size: options.fontSize,
                font,
                color: rgb(r, g, b),
                opacity: options.opacity,
                rotate: degrees(options.rotation),
              });
            }
          } else if (options.type === 'image' && watermarkImage) {
            const imgWidth = watermarkImage.width * options.scale;
            const imgHeight = watermarkImage.height * options.scale;
            
            let x = width / 2 - imgWidth / 2;
            let y = height / 2 - imgHeight / 2;

            if (options.position === 'top-left') { x = 20; y = height - imgHeight - 20; }
            else if (options.position === 'top-right') { x = width - imgWidth - 20; y = height - imgHeight - 20; }
            else if (options.position === 'bottom-left') { x = 20; y = 20; }
            else if (options.position === 'bottom-right') { x = width - imgWidth - 20; y = 20; }

            page.drawImage(watermarkImage, {
              x,
              y,
              width: imgWidth,
              height: imgHeight,
              opacity: options.opacity,
              rotate: degrees(options.rotation),
            });
          }
        }
      } else {
        // Experimental "Remove" - Simplified logic: cover up or just a placeholder for complex logic
        // Genuine removal is extremely hard client-side without a full editor.
        // We will provide a message.
        toast.error('Automated watermark removal is not supported in this client-side version. Please use manual redaction tools or the Rasterize feature to obscure watermarks.');
        setProcessing(false);
        return;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const name = `${options.mode === 'add' ? 'watermarked' : 'processed'}_${sourceFile.name}`;
      
      setResult({ name, url });
      addToHistory({
        name,
        type: 'PDF',
        action: options.mode === 'add' ? 'Add Watermark' : 'Remove Watermark',
        date: new Date().toISOString(),
        size: blob.size
      });
      toast.success('PDF processed successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Error processing PDF.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Watermark PDF"
      description="Add text or image watermarks to your PDF documents with full control."
      icon={<Type className="w-8 h-8" />}
      accept={{ 'application/pdf': ['.pdf'] }}
      multiple={false}
      onProcess={handleProcess}
      processing={processing}
      result={result}
    >
      <div className="space-y-6">
        {/* Toggle Mode */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setOptions({ ...options, mode: 'add' })}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${options.mode === 'add' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Add Watermark
          </button>
          <button
            onClick={() => setOptions({ ...options, mode: 'remove' })}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${options.mode === 'remove' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Remove Watermark
          </button>
        </div>

        {options.mode === 'add' ? (
          <div className="space-y-6">
            {/* Toggle Type */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setOptions({ ...options, type: 'text' })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${options.type === 'text' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Type size={16} /> Text
              </button>
              <button
                onClick={() => setOptions({ ...options, type: 'image' })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${options.type === 'image' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <ImageIcon size={16} /> Image
              </button>
            </div>

            {options.type === 'text' ? (
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Watermark Text</label>
                <input
                  type="text"
                  value={options.text}
                  onChange={(e) => setOptions({ ...options, text: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter text..."
                />
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Watermark Image</label>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={(e) => setOptions({ ...options, imageFile: e.target.files?.[0] || null })}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Opacity</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={options.opacity}
                  onChange={(e) => setOptions({ ...options, opacity: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Rotation</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={options.rotation}
                  onChange={(e) => setOptions({ ...options, rotation: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Position</label>
              <select
                value={options.position}
                onChange={(e) => setOptions({ ...options, position: e.target.value as any })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              >
                <option value="center">Center</option>
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="tiled">Tiled / Pattern</option>
              </select>
            </div>

            {options.type === 'text' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Font Size</label>
                  <input
                    type="number"
                    value={options.fontSize}
                    onChange={(e) => setOptions({ ...options, fontSize: parseInt(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Color</label>
                  <input
                    type="color"
                    value={options.color}
                    onChange={(e) => setOptions({ ...options, color: e.target.value })}
                    className="w-full h-10 p-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold">
              <ShieldAlert size={20} />
              Heads Up!
            </div>
            <p className="text-sm text-amber-600 dark:text-amber-400 leading-relaxed">
              Watermark removal is a complex task. Because this tool runs entirely in your browser for privacy, it cannot automatically "erase" embedded watermarks without affecting the underlying content in many cases.
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
              Alternative: Use the <strong>Rasterize PDF</strong> tool to flatten the document, then use a PDF editor to cover unwanted areas.
            </p>
          </div>
        )}

        {/* Preview Area */}
        <div className="mt-8 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900">
          <div className="p-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <Eye size={14} /> Live Preview (First Page)
            </span>
            {previewLoading && <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>}
          </div>
          <div className="p-4 flex justify-center items-center overflow-auto max-h-[400px]">
            {sourceFile ? (
              <canvas ref={canvasRef} className="max-w-full h-auto shadow-2xl rounded-sm" />
            ) : (
              <div className="py-20 text-slate-400 text-sm">Upload a file to see preview</div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default PdfWatermark;
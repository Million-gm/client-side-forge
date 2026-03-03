import React, { useState } from 'react';
import { ImageIcon, FileType } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { PDFDocument } from 'pdf-lib';
import { toast } from 'sonner';
import { addToHistory } from '../../lib/history';

const ImageToPdf = () => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ name: string; url: string } | null>(null);

  const handleConvert = async (files: File[]) => {
    setProcessing(true);
    setResult(null);
    
    try {
      const pdfDoc = await PDFDocument.create();
      
      for (const file of files) {
        const imageBytes = await file.arrayBuffer();
        let image;
        
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(imageBytes);
        } else if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          // For other formats like webp, we need to convert to png first in canvas
          const pngBlob = await convertToPng(file);
          const pngBytes = await pngBlob.arrayBuffer();
          image = await pdfDoc.embedPng(pngBytes);
        }
        
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const name = `images_to_pdf_${Date.now()}.pdf`;
      
      setResult({ name, url });
      addToHistory({
        name,
        type: 'PDF',
        action: 'Image to PDF',
        date: new Date().toISOString(),
        size: blob.size
      });
      toast.success('Images converted to PDF!');
    } catch (error) {
      console.error(error);
      toast.error('Error converting images to PDF.');
    } finally {
      setProcessing(false);
    }
  };

  const convertToPng = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('No context');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject('Conversion failed');
          }, 'image/png');
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <ToolLayout
      title="Image to PDF"
      description="Convert one or more images into a single PDF document."
      icon={<FileType className="w-8 h-8" />}
      accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
      onProcess={handleConvert}
      processing={processing}
      result={result}
    >
      <div className="text-sm text-slate-500">
        <p>Each image will be placed on a new page in the PDF.</p>
      </div>
    </ToolLayout>
  );
};

export default ImageToPdf;
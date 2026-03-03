import React, { useState } from 'react';
import { Image as ImageIcon, Check } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { toast } from 'sonner';
import { addToHistory } from '../../lib/history';
import JSZip from 'jszip';

const ImageConverter = () => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ name: string; url: string } | null>(null);
  const [targetFormat, setTargetFormat] = useState<'png' | 'jpeg' | 'webp'>('png');

  const handleConvert = async (files: File[]) => {
    setProcessing(true);
    setResult(null);
    
    try {
      const zip = new JSZip();
      
      for (const file of files) {
        const convertedBlob = await convertImage(file, targetFormat);
        zip.file(`${file.name.split('.')[0]}.${targetFormat}`, convertedBlob);
      }
      
      const zipContent = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipContent);
      const name = `converted_images_${Date.now()}.zip`;
      
      setResult({ name, url });
      addToHistory({
        name,
        type: 'Image',
        action: `Convert to ${targetFormat.toUpperCase()}`,
        date: new Date().toISOString(),
        size: zipContent.size
      });
      toast.success('Images converted successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Error converting images.');
    } finally {
      setProcessing(false);
    }
  };

  const convertImage = (file: File, format: string): Promise<Blob> => {
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
          }, `image/${format}`);
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <ToolLayout
      title="Convert Image"
      description="Convert images between PNG, JPEG, and WEBP formats."
      icon={<ImageIcon className="w-8 h-8" />}
      accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
      onProcess={handleConvert}
      processing={processing}
      result={result}
    >
      <div className="space-y-4">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Target Format</label>
        <div className="grid grid-cols-3 gap-2">
          {['png', 'jpeg', 'webp'].map((format) => (
            <button
              key={format}
              onClick={() => setTargetFormat(format as any)}
              className={`
                py-2 px-3 rounded-lg text-sm font-bold border transition-all
                ${targetFormat === format 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}
              `}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
};

export default ImageConverter;
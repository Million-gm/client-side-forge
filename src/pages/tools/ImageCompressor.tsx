import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';
import { addToHistory } from '../../lib/history';
import JSZip from 'jszip';

const ImageCompressor = () => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ name: string; url: string } | null>(null);
  const [quality, setQuality] = useState(0.8);

  const handleCompress = async (files: File[]) => {
    setProcessing(true);
    setResult(null);
    
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        initialQuality: quality
      };

      const zip = new JSZip();
      
      for (const file of files) {
        const compressedFile = await imageCompression(file, options);
        zip.file(`compressed_${file.name}`, compressedFile);
      }
      
      const zipContent = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipContent);
      const name = `compressed_images_${Date.now()}.zip`;
      
      setResult({ name, url });
      addToHistory({
        name,
        type: 'Image',
        action: 'Compress',
        date: new Date().toISOString(),
        size: zipContent.size
      });
      toast.success('Images compressed successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Error compressing images.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Compress Image"
      description="Reduce image file size with smart compression."
      icon={<Zap className="w-8 h-8" />}
      accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
      onProcess={handleCompress}
      processing={processing}
      result={result}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Compression Level</label>
          <span className="text-sm text-blue-600 font-bold">{Math.round((1 - quality) * 100)}%</span>
        </div>
        <input 
          type="range" 
          min="0.1" 
          max="0.9" 
          step="0.1" 
          value={quality} 
          onChange={(e) => setQuality(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </div>
    </ToolLayout>
  );
};

export default ImageCompressor;
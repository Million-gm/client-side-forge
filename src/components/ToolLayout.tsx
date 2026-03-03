import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, X, Loader2, Download, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ToolLayoutProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accept?: Record<string, string[]>;
  multiple?: boolean;
  onProcess: (files: File[]) => Promise<void>;
  processing: boolean;
  result?: {
    name: string;
    url: string;
  } | null;
  children?: React.ReactNode;
}

const ToolLayout = ({ 
  title, 
  description, 
  icon, 
  accept, 
  multiple = true, 
  onProcess, 
  processing,
  result,
  children
}: ToolLayoutProps) => {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (multiple) {
      setFiles(prev => [...prev, ...acceptedFiles]);
    } else {
      setFiles(acceptedFiles);
    }
  }, [multiple]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }
    await onProcess(files);
  };

  const clearFiles = () => {
    setFiles([]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
          {icon}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Area */}
          <div 
            {...getRootProps()} 
            className={`
              relative border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer
              ${isDragActive ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'}
            `}
          >
            <input {...getInputProps()} />
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
              <FileUp className={`w-8 h-8 ${isDragActive ? 'text-blue-500' : 'text-slate-400'}`} />
            </div>
            <p className="text-lg font-semibold mb-1">
              {isDragActive ? 'Drop files here' : 'Click or drag files to upload'}
            </p>
            <p className="text-sm text-slate-400">
              Supports: {Object.values(accept || {}).flat().join(', ')}
            </p>
          </div>

          {/* File List */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between px-2">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Selected Files ({files.length})</h3>
                  <button onClick={clearFiles} className="text-xs font-semibold text-red-500 hover:underline">Clear all</button>
                </div>
                <div className="space-y-2">
                  {files.map((file, idx) => (
                    <motion.div 
                      key={`${file.name}-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="shrink-0 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <FileUp className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <h3 className="text-lg font-bold mb-4">Tool Options</h3>
            {children}
            
            <button
              onClick={handleProcess}
              disabled={processing || files.length === 0}
              className={`
                w-full mt-6 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                ${processing || files.length === 0 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-[0.98]'}
              `}
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Process Files
                </>
              )}
            </button>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-4 text-green-600 dark:text-green-400">
                  <Download className="w-5 h-5" />
                  <h3 className="font-bold">Ready for download!</h3>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mb-4 truncate">{result.name}</p>
                <a 
                  href={result.url} 
                  download={result.name}
                  className="block w-full py-3 px-4 bg-green-600 text-white rounded-xl font-bold text-center hover:bg-green-700 transition-colors shadow-lg shadow-green-500/20"
                >
                  Download Now
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              Your files are processed locally. Nothing is uploaded to any server. 
              The speed of processing depends on your device's memory and CPU.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolLayout;
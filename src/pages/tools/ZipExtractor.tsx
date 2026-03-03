import React, { useState } from 'react';
import { Archive, FileBox } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { addToHistory } from '../../lib/history';

const ZipExtractor = () => {
  const [processing, setProcessing] = useState(false);
  const [extractedFiles, setExtractedFiles] = useState<{name: string, url: string}[]>([]);

  const handleExtract = async (files: File[]) => {
    if (files.length === 0) return;
    setProcessing(true);
    setExtractedFiles([]);
    
    try {
      const file = files[0];
      const zip = new JSZip();
      const content = await zip.loadAsync(file);
      
      const results: {name: string, url: string}[] = [];
      
      for (const [filename, zipEntry] of Object.entries(content.files)) {
        if (!zipEntry.dir) {
          const blob = await zipEntry.async('blob');
          const url = URL.createObjectURL(blob);
          results.push({ name: filename, url });
        }
      }
      
      setExtractedFiles(results);
      addToHistory({
        name: file.name,
        type: 'Archive',
        action: 'Extract ZIP',
        date: new Date().toISOString(),
        size: file.size
      });
      toast.success(`Extracted ${results.length} files!`);
    } catch (error) {
      console.error(error);
      toast.error('Error extracting ZIP file.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="ZIP Extractor"
      description="Extract files from a ZIP archive directly in your browser."
      icon={<Archive className="w-8 h-8" />}
      accept={{ 'application/zip': ['.zip'] }}
      multiple={false}
      onProcess={handleExtract}
      processing={processing}
    >
      <div className="space-y-4">
        {extractedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-bold text-sm uppercase text-slate-400">Extracted Files</h4>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
              {extractedFiles.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-sm truncate mr-4">{f.name}</span>
                  <a href={f.url} download={f.name} className="text-blue-600 font-bold text-xs hover:underline">Download</a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ZipExtractor;
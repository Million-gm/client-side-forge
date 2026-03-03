import React, { useState } from 'react';
import { FileText, Eye } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { toast } from 'sonner';
import mammoth from 'mammoth';

const WordViewer = () => {
  const [processing, setProcessing] = useState(false);
  const [html, setHtml] = useState<string>('');
  const [fileName, setFileName] = useState('');

  const handleView = async (files: File[]) => {
    if (files.length === 0) return;
    setProcessing(true);
    setHtml('');
    setFileName(files[0].name);
    
    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setHtml(result.value);
      toast.success('Document loaded!');
    } catch (error) {
      console.error(error);
      toast.error('Error loading Word document.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Word Viewer"
      description="View Microsoft Word (.docx) files directly in your browser."
      icon={<Eye className="w-8 h-8" />}
      accept={{ 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
      }}
      multiple={false}
      onProcess={handleView}
      processing={processing}
    >
      <div className="space-y-4">
        {html && (
          <div className="mt-8 p-8 bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-inner max-h-[600px] overflow-y-auto prose prose-sm max-w-none">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">{fileName}</h2>
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default WordViewer;
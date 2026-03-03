import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { toast } from 'sonner';
import mammoth from 'mammoth';
import { addToHistory } from '../../lib/history';

const WordToTxt = () => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ name: string; url: string } | null>(null);

  const handleConvert = async (files: File[]) => {
    if (files.length === 0) return;
    setProcessing(true);
    setResult(null);
    
    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const { value: text } = await mammoth.extractRawText({ arrayBuffer });
      
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const name = `${file.name.split('.')[0]}.txt`;
      
      setResult({ name, url });
      addToHistory({
        name,
        type: 'Word',
        action: 'Convert to TXT',
        date: new Date().toISOString(),
        size: blob.size
      });
      toast.success('Word document converted to text!');
    } catch (error) {
      console.error(error);
      toast.error('Error converting Word document.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Word to TXT"
      description="Extract all text content from a Word document (.docx)."
      icon={<FileText className="w-8 h-8" />}
      accept={{ 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
      }}
      multiple={false}
      onProcess={handleConvert}
      processing={processing}
      result={result}
    >
      <div className="text-sm text-slate-500">
        <p>Extracts raw text content without formatting or images.</p>
      </div>
    </ToolLayout>
  );
};

export default WordToTxt;
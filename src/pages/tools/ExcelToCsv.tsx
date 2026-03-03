import React, { useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { addToHistory } from '../../lib/history';

const ExcelToCsv = () => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ name: string; url: string } | null>(null);

  const handleConvert = async (files: File[]) => {
    if (files.length === 0) return;
    setProcessing(true);
    setResult(null);
    
    try {
      const file = files[0];
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const name = `${file.name.split('.')[0]}.csv`;
      
      setResult({ name, url });
      addToHistory({
        name,
        type: 'Excel',
        action: 'Convert to CSV',
        date: new Date().toISOString(),
        size: blob.size
      });
      toast.success('Excel converted to CSV!');
    } catch (error) {
      console.error(error);
      toast.error('Error converting Excel file.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Excel to CSV"
      description="Convert Excel spreadsheets (.xlsx, .xls) to CSV format."
      icon={<FileSpreadsheet className="w-8 h-8" />}
      accept={{ 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-excel': ['.xls']
      }}
      multiple={false}
      onProcess={handleConvert}
      processing={processing}
      result={result}
    >
      <div className="text-sm text-slate-500">
        <p>Converts the first sheet of your Excel workbook into a standard CSV file.</p>
      </div>
    </ToolLayout>
  );
};

export default ExcelToCsv;
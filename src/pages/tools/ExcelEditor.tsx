import React, { useState } from 'react';
import { FileSpreadsheet, Edit3, Download } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { addToHistory } from '../../lib/history';

const ExcelEditor = () => {
  const [processing, setProcessing] = useState(false);
  const [data, setData] = useState<any[][]>([]);
  const [fileName, setFileName] = useState('');
  const [sheetName, setSheetName] = useState('');

  const handleLoad = async (files: File[]) => {
    if (files.length === 0) return;
    setProcessing(true);
    setData([]);
    setFileName(files[0].name);
    
    try {
      const file = files[0];
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const firstSheet = workbook.SheetNames[0];
      setSheetName(firstSheet);
      const worksheet = workbook.Sheets[firstSheet];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      setData(json);
      toast.success('Spreadsheet loaded!');
    } catch (error) {
      console.error(error);
      toast.error('Error loading spreadsheet.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...data];
    newData[rowIndex][colIndex] = value;
    setData(newData);
  };

  const handleExport = () => {
    try {
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || 'Sheet1');
      const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const name = `edited_${fileName}`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.click();
      
      addToHistory({
        name,
        type: 'Excel',
        action: 'Edit & Save',
        date: new Date().toISOString(),
        size: blob.size
      });
      toast.success('Excel exported successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Error exporting file.');
    }
  };

  return (
    <ToolLayout
      title="Excel Editor"
      description="View and edit Excel spreadsheets directly in the browser."
      icon={<Edit3 className="w-8 h-8" />}
      accept={{ 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-excel': ['.xls']
      }}
      multiple={false}
      onProcess={handleLoad}
      processing={processing}
    >
      <div className="space-y-4">
        {data.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">{fileName} - {sheetName}</h3>
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-sm shadow-lg shadow-green-500/20"
              >
                <Download size={16} />
                Export XLSX
              </button>
            </div>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-auto max-h-[500px]">
              <table className="w-full text-sm text-left border-collapse">
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2 border-r border-slate-100 dark:border-slate-800 last:border-0 min-w-[100px]">
                          <input 
                            type="text" 
                            value={cell || ''} 
                            onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                            className="w-full bg-transparent border-none outline-none focus:ring-1 focus:ring-blue-500/50 rounded px-1"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ExcelEditor;
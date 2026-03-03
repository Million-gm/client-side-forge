import React, { useState, useEffect } from 'react';
import { History, Trash2, Download, FileBox, Calendar } from 'lucide-react';
import { getHistory, clearHistory, HistoryItem } from '../lib/history';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const HistoryPage = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleClear = () => {
    if (confirm('Are you sure you want to clear your local history?')) {
      clearHistory();
      setHistory([]);
      toast.success('History cleared');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg">
            <History className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Activity History</h1>
            <p className="text-slate-500 dark:text-slate-400">Your recent browser-based file operations.</p>
          </div>
        </div>
        {history.length > 0 && (
          <button 
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors font-semibold text-sm"
          >
            <Trash2 size={18} />
            Clear History
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {history.length === 0 ? (
          <div className="p-20 text-center">
            <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="text-slate-300 w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium">No activity recorded yet.</p>
            <p className="text-sm text-slate-400">Tools you use will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <AnimatePresence initial={false}>
              {history.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      shrink-0 p-3 rounded-xl 
                      ${item.type === 'PDF' ? 'bg-red-50 text-red-500' : ''}
                      ${item.type === 'Image' ? 'bg-purple-50 text-purple-500' : ''}
                      ${item.type === 'Excel' ? 'bg-green-50 text-green-500' : ''}
                      ${item.type === 'Word' ? 'bg-blue-50 text-blue-500' : ''}
                    `}>
                      <FileBox size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">{item.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="font-semibold uppercase text-blue-600">{item.action}</span>
                        <span>•</span>
                        <span>{formatSize(item.size)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl flex gap-3 items-center">
        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
          <strong>Privacy Note:</strong> This history is stored only in your browser's local storage. Clearing your browser cache or clicking "Clear History" will remove these records forever.
        </p>
      </div>
    </div>
  );
};

export default HistoryPage;
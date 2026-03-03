import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  FileText, 
  FileSpreadsheet, 
  FileBox, 
  Image as ImageIcon, 
  History, 
  Home, 
  Menu, 
  Moon, 
  Sun,
  Shield,
  Zap,
  Github,
  Split,
  Combine,
  Lock,
  FileType,
  Archive,
  Search,
  FileImage,
  Eye,
  Edit3,
  Type,
  Layers
} from 'lucide-react';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// Pages
import Dashboard from './pages/Dashboard';
import PdfMerge from './pages/tools/PdfMerge';
import PdfSplit from './pages/tools/PdfSplit';
import ImageConverter from './pages/tools/ImageConverter';
import ImageCompressor from './pages/tools/ImageCompressor';
import ExcelToCsv from './pages/tools/ExcelToCsv';
import ExcelEditor from './pages/tools/ExcelEditor';
import WordToTxt from './pages/tools/WordToTxt';
import WordViewer from './pages/tools/WordViewer';
import ImageToPdf from './pages/tools/ImageToPdf';
import PdfPassword from './pages/tools/PdfPassword';
import ZipExtractor from './pages/tools/ZipExtractor';
import PdfToImage from './pages/tools/PdfToImage';
import PdfWatermark from './pages/tools/PdfWatermark';
import PdfRasterize from './pages/tools/PdfRasterize';
import HistoryPage from './pages/HistoryPage';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.title = "Mega tool - Universal Document Toolbox";
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <Toaster position="top-right" expand={false} richColors />
        
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            />
          )}
        </AnimatePresence>

        <aside className={`fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="p-6 flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileBox className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">Mega tool</span>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              <SidebarLink to="/" icon={<Home size={20} />} label="Dashboard" onClick={() => setIsSidebarOpen(false)} />
              
              <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">PDF Tools</div>
              <SidebarLink to="/pdf/merge" icon={<Combine size={20} />} label="Merge PDF" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/pdf/split" icon={<Split size={20} />} label="Split PDF" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/pdf/image-to-pdf" icon={<FileType size={20} />} label="Image to PDF" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/pdf/to-image" icon={<FileImage size={20} />} label="PDF to Image" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/pdf/watermark" icon={<Type size={20} />} label="Watermark" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/pdf/rasterize" icon={<Layers size={20} />} label="Rasterize" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/pdf/password" icon={<Lock size={20} />} label="Password Protect" onClick={() => setIsSidebarOpen(false)} />
              
              <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Image Studio</div>
              <SidebarLink to="/image/convert" icon={<ImageIcon size={20} />} label="Convert Images" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/image/compress" icon={<Zap size={20} />} label="Compress" onClick={() => setIsSidebarOpen(false)} />
              
              <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Office & Data</div>
              <SidebarLink to="/excel/editor" icon={<Edit3 size={20} />} label="Excel Editor" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/excel/to-csv" icon={<FileSpreadsheet size={20} />} label="Excel to CSV" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/word/viewer" icon={<Eye size={20} />} label="Word Viewer" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/word/to-txt" icon={<FileText size={20} />} label="Word to TXT" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/archive/extract" icon={<Archive size={20} />} label="ZIP Extractor" onClick={() => setIsSidebarOpen(false)} />

              <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">System</div>
              <SidebarLink to="/history" icon={<History size={20} />} label="Activity History" onClick={() => setIsSidebarOpen(false)} />
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={toggleTheme}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>
        </aside>

        <main className="lg:ml-72 min-h-screen flex flex-col">
          <header className="h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 border-bottom border-slate-200 dark:border-slate-800">
            <button onClick={toggleSidebar} className="lg:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
              <Menu size={24} />
            </button>
            
            <div className="hidden lg:flex items-center text-sm font-medium text-slate-500 gap-2">
              <Shield size={16} className="text-green-500" />
              <span>100% Client-Side & Private</span>
            </div>

            <div className="flex items-center gap-4">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <Github size={20} />
              </a>
            </div>
          </header>

          <div className="flex-1 p-6 lg:p-10">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pdf/merge" element={<PdfMerge />} />
              <Route path="/pdf/split" element={<PdfSplit />} />
              <Route path="/pdf/image-to-pdf" element={<ImageToPdf />} />
              <Route path="/pdf/to-image" element={<PdfToImage />} />
              <Route path="/pdf/watermark" element={<PdfWatermark />} />
              <Route path="/pdf/rasterize" element={<PdfRasterize />} />
              <Route path="/pdf/password" element={<PdfPassword />} />
              <Route path="/image/convert" element={<ImageConverter />} />
              <Route path="/image/compress" element={<ImageCompressor />} />
              <Route path="/excel/to-csv" element={<ExcelToCsv />} />
              <Route path="/excel/editor" element={<ExcelEditor />} />
              <Route path="/word/to-txt" element={<WordToTxt />} />
              <Route path="/word/viewer" element={<WordViewer />} />
              <Route path="/archive/extract" element={<ZipExtractor />} />
              <Route path="/history" element={<HistoryPage />} />
            </Routes>
          </div>
          
          <footer className="py-6 px-10 text-center text-slate-400 text-sm border-t border-slate-200 dark:border-slate-800">
            &copy; {new Date().getFullYear()} Mega tool. All processing is done locally in your browser.
          </footer>
        </main>
      </div>
    </Router>
  );
};

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const SidebarLink = ({ to, icon, label, onClick }: SidebarLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
};

export default App;
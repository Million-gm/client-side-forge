import React from 'react';
import { motion } from 'framer-motion';
import { 
  Combine, 
  Split, 
  Image as ImageIcon, 
  Zap, 
  FileSpreadsheet, 
  FileText, 
  ShieldCheck,
  ZapIcon,
  DownloadCloud,
  FileType,
  Lock,
  Archive,
  FileImage,
  Eye,
  Edit3,
  Type,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-12 text-center lg:text-left">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-4"
        >
          Mega <span className="text-blue-600">tool</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto lg:mx-0"
        >
          Powerful, private, and 100% client-side. Manipulate PDFs, Excel, Word, and Images entirely in your browser. No files are ever uploaded.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <FeatureInfoCard 
          icon={<ShieldCheck className="text-green-500" />}
          title="Privacy First"
          description="Your documents never leave your device. Zero server involvement."
        />
        <FeatureInfoCard 
          icon={<ZapIcon className="text-yellow-500" />}
          title="Instant Speed"
          description="Local processing means no waiting for uploads or downloads."
        />
        <FeatureInfoCard 
          icon={<DownloadCloud className="text-blue-500" />}
          title="Progressive Web App"
          description="Install it on your desktop or mobile and use it completely offline."
        />
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-16"
      >
        <ToolSection title="PDF Management" color="text-red-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ToolCard to="/pdf/merge" title="Merge PDF" description="Combine multiple files" icon={<Combine className="w-6 h-6 text-red-500" />} badge="PDF" variants={item} />
            <ToolCard to="/pdf/split" title="Split PDF" description="Extract pages easily" icon={<Split className="w-6 h-6 text-red-500" />} badge="PDF" variants={item} />
            <ToolCard to="/pdf/image-to-pdf" title="Image to PDF" description="Convert photos to PDF" icon={<FileType className="w-6 h-6 text-red-500" />} badge="PDF" variants={item} />
            <ToolCard to="/pdf/to-image" title="PDF to Image" description="Export pages as JPG/PNG" icon={<FileImage className="w-6 h-6 text-red-500" />} badge="PDF" variants={item} />
            <ToolCard to="/pdf/watermark" title="Watermark" description="Add text or image stamps" icon={<Type className="w-6 h-6 text-red-500" />} badge="PDF" variants={item} />
            <ToolCard to="/pdf/rasterize" title="Rasterize" description="Flatten to image-based PDF" icon={<Layers className="w-6 h-6 text-red-500" />} badge="PDF" variants={item} />
            <ToolCard to="/pdf/password" title="Protect" description="Add security password" icon={<Lock className="w-6 h-6 text-red-500" />} badge="PDF" variants={item} />
          </div>
        </ToolSection>

        <ToolSection title="Image Studio" color="text-purple-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ToolCard to="/image/convert" title="Converter" description="PNG, JPG, WEBP, etc" icon={<ImageIcon className="w-6 h-6 text-purple-500" />} badge="Image" variants={item} />
            <ToolCard to="/image/compress" title="Compressor" description="Reduce file size" icon={<Zap className="w-6 h-6 text-purple-500" />} badge="Image" variants={item} />
          </div>
        </ToolSection>

        <ToolSection title="Office & Data" color="text-blue-600">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ToolCard to="/excel/editor" title="Excel Editor" description="View and edit sheets" icon={<Edit3 className="w-6 h-6 text-green-600" />} badge="Excel" variants={item} />
            <ToolCard to="/excel/to-csv" title="Excel to CSV" description="Clean data export" icon={<FileSpreadsheet className="w-6 h-6 text-green-600" />} badge="Excel" variants={item} />
            <ToolCard to="/word/viewer" title="Word Viewer" description="Read docx files" icon={<Eye className="w-6 h-6 text-blue-600" />} badge="Word" variants={item} />
            <ToolCard to="/word/to-txt" title="Word to Text" description="Extract clean text" icon={<FileText className="w-6 h-6 text-blue-600" />} badge="Word" variants={item} />
            <ToolCard to="/archive/extract" title="ZIP Extract" description="Unpack zip archives" icon={<Archive className="w-6 h-6 text-amber-500" />} badge="Archive" variants={item} />
          </div>
        </ToolSection>
      </motion.div>
    </div>
  );
};

const ToolSection = ({ title, color, children }: any) => (
  <div>
    <h2 className={`text-2xl font-black mb-8 flex items-center gap-3 ${color} tracking-tight uppercase`}>
      <span className="w-2.5 h-10 bg-current rounded-full opacity-10"></span>
      {title}
    </h2>
    {children}
  </div>
);

const ToolCard = ({ to, title, description, icon, badge, variants }: any) => {
  return (
    <motion.div variants={variants}>
      <Link 
        to={to} 
        className="group flex flex-col p-6 h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-2xl hover:shadow-blue-500/10 active:scale-[0.98]"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:scale-110 transition-all duration-300">
            {icon}
          </div>
          <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 uppercase tracking-[0.1em] border border-slate-200 dark:border-slate-700">
            {badge}
          </span>
        </div>
        <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 transition-colors">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{description}</p>
      </Link>
    </motion.div>
  );
};

const FeatureInfoCard = ({ icon, title, description }: any) => {
  return (
    <div className="flex items-center gap-5 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm">
      <div className="shrink-0 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-0.5">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default Dashboard;
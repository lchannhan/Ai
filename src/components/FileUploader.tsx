import React, { useRef, useState } from "react";
import { Upload, FileText, Image as ImageIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FileUploaderProps {
  files: File[];
  onFilesSelect: (files: File[]) => void;
  onFileRemove: (index: number) => void;
  isLoading: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  files, 
  onFilesSelect, 
  onFileRemove,
  isLoading 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelect(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelect(Array.from(e.target.files));
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-8 relative z-10">
      <div
        className={`flex-1 flex flex-col items-center justify-center text-center transition-all duration-500 rounded-[3rem] ${
          dragActive ? "scale-95 brightness-110" : ""
        } ${isLoading ? "opacity-60 pointer-events-none" : "cursor-pointer"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          accept="image/*,application/pdf"
          onChange={handleChange}
        />
        
        <div className="flex flex-col items-center justify-center">
          <div className="relative mb-10 group-hover:scale-110 transition-transform duration-700">
            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 animate-pulse" />
            <div className="w-32 h-32 bg-white/20 backdrop-blur-3xl rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/30 relative z-10">
              <Upload className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <h3 className="text-3xl font-[1000] mb-4 text-white tracking-tight drop-shadow-lg">អាប់ឡូតរូបភាព ឬ PDF</h3>
          <p className="text-white/80 text-[14px] font-black max-w-[280px] leading-relaxed uppercase tracking-[0.2em] mb-10">ចុចទីនេះ ឬ ទម្លាក់ឯកសារចូល</p>
          
          <div className="flex items-center gap-3 px-6 py-3 bg-white/20 rounded-2xl backdrop-blur-xl border border-white/20 shadow-xl">
             <div className="flex -space-x-1">
                <div className="px-3 py-1.5 bg-white/90 rounded-lg text-[10px] font-black text-rose-500 uppercase shadow-sm">IMG / PDF</div>
             </div>
             <span className="text-[10px] font-black text-white/90 uppercase tracking-widest pl-2">តាមតម្រូវការតាមចិត្ត</span>
          </div>

          <p className="mt-8 text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">ឬ អូសឯកសារមករកទីនេះ ដើម្បីបំប្លែង</p>
        </div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-3 max-h-[180px] overflow-y-auto pr-2 scrollbar-hide"
          >
            {files.map((file, idx) => (
              <motion.div
                key={`${file.name}-${idx}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl group/file hover:bg-white/20 transition-all"
              >
                <div className="flex items-center space-x-4 min-w-0">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 text-white`}>
                    {file.type.includes("pdf") ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black text-white truncate leading-none mb-1.5">{file.name}</p>
                    <span className="text-[8px] text-white/60 font-black uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onFileRemove(idx); }}
                  className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

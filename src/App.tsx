import React, { useState, useEffect, useRef } from "react";
import { FileUploader } from "./components/FileUploader";
import { extractTextWithMath, streamTextWithMath } from "./lib/gemini";
import { downloadAsWord, downloadAsLaTeX } from "./lib/word";
import { 
  Copy, 
  Download, 
  Check, 
  AlertCircle, 
  Loader2, 
  FileText,
  LayoutDashboard,
  Settings,
  Clock,
  ChevronDown,
  Crown,
  Zap,
  ExternalLink,
  ShieldCheck,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [extractedText, setExtractedText] = useState<string>("");
  const [currentFiles, setCurrentFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [outputMode, setOutputMode] = useState<'word' | 'latex'>('word');
  const [timer, setTimer] = useState<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      setTimer(0);
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 0.1);
      }, 100);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isLoading]);

  const processFiles = async (files: File[], mode: 'word' | 'latex' = outputMode) => {
    if (files.length === 0) return;
    setIsLoading(true);
    setError(null);
    setExtractedText("");

    try {
      const generator = streamTextWithMath(files, mode);
      for await (const chunk of generator) {
        setExtractedText(prev => prev + chunk);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "មានបញ្ហាក្នុងការបំប្លែងឯកសារ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (mode: 'word' | 'latex') => {
    setOutputMode(mode);
    if (currentFiles.length > 0) {
      processFiles(currentFiles, mode);
    }
  };

  const handleFilesSelect = (newFiles: File[]) => {
    const updatedFiles = [...currentFiles, ...newFiles];
    setCurrentFiles(updatedFiles);
    processFiles(updatedFiles);
  };

  const handleFileRemove = (index: number) => {
    const updatedFiles = currentFiles.filter((_, i) => i !== index);
    setCurrentFiles(updatedFiles);
    if (updatedFiles.length === 0) {
      setExtractedText("");
    }
  };

  const copyToClipboard = async () => {
    if (!extractedText) return;
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleDownloadWord = () => {
    if (!extractedText) return;
    downloadAsWord(extractedText, "MathDoc_Extract.docx");
  };

  const handleDownloadLaTeX = () => {
    if (!extractedText) return;
    downloadAsLaTeX(extractedText, "MathDoc_Extract.tex");
  };

  const resetAll = () => {
    setExtractedText("");
    setCurrentFiles([]);
    setError(null);
  };

  return (
    <div className="min-h-screen font-sans flex flex-col bg-[#F8FAFC]">
      {/* Header */}
      <header className="h-24 bg-white border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-50 shadow-sm transition-all">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <LayoutDashboard className="text-white w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-[1000] tracking-tighter text-slate-800 leading-none">
              MATHDOC <span className="text-indigo-600">ULTRA</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Math made simple.</span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-orange-100 flex items-center gap-2 cursor-pointer hover:scale-105 transition-all">
            <Crown className="w-4 h-4" /> PRO <ChevronDown className="w-3 h-3" />
          </div>
        </div>
      </header>

      <main className="flex-1 p-10 grid grid-cols-12 gap-10 max-w-[1800px] mx-auto w-full">
        {/* Left Side: Controls */}
        <section className="col-span-12 lg:col-span-4 flex flex-col gap-10">
          {/* Action Card */}
          <div className="bg-gradient-to-br from-[#EC4899] via-[#F43F5E] to-[#FB923C] rounded-[3.5rem] p-12 shadow-2xl shadow-rose-200 relative overflow-hidden group min-h-[450px] flex flex-col">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,#fff_0,transparent_50%)] opacity-30 pointer-events-none" />
             <FileUploader 
               files={currentFiles}
               onFilesSelect={handleFilesSelect} 
               onFileRemove={handleFileRemove}
               isLoading={isLoading} 
             />
          </div>

          {/* Settings Section */}
          <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-200 border border-white relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-500 flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                 បច្ចេកវិទ្យាបញ្ញាសិប្បនិម្មិត
              </h4>
              <Settings className="w-5 h-5 text-slate-300" />
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[14px] font-black text-slate-800 block">ទ្រង់ទ្រាយគណិតវិទ្យា</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">MATHTYPE • LATEX • STEM</span>
                  </div>
                </div>
                <div className="w-14 h-7 bg-indigo-600 rounded-full relative p-1 shadow-inner cursor-pointer">
                  <div className="absolute right-1 w-5 h-5 bg-white rounded-full shadow-md" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <LayoutDashboard className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[14px] font-black text-slate-800 block">ភាសាខ្មែរ (OCR)</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">KANTUMRUY • PRO • AI</span>
                  </div>
                </div>
                <div className="w-14 h-7 bg-indigo-600 rounded-full relative p-1 shadow-inner cursor-pointer">
                  <div className="absolute right-1 w-5 h-5 bg-white rounded-full shadow-md" />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Developer Banner */}
          <a 
            href="https://laychannhan.blogspot.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-[2.5rem] p-8 shadow-xl shadow-indigo-100 flex items-center gap-8 group hover:scale-[1.02] transition-all cursor-pointer overflow-hidden relative text-white"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
             <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white shrink-0">
               <ExternalLink className="w-7 h-7" />
             </div>
             <div>
               <span className="text-white font-black text-lg block leading-none mb-1">ទំនាក់ទំនងទៅកាន់អ្នកបង្កើត</span>
               <span className="text-white/70 text-[11px] font-bold uppercase tracking-widest leading-none">ទៅកាន់គេហទំព័រ Blogger របស់ខ្ញុំ</span>
             </div>
          </a>
        </section>

        {/* Right Side: Result Area */}
        <section className="col-span-12 lg:col-span-8 flex flex-col bg-white rounded-[4rem] shadow-2xl shadow-slate-200 border border-white overflow-hidden relative min-h-[800px]">
          <div className="px-12 py-10 border-b border-slate-50 flex flex-wrap gap-8 justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-20">
            <div className="flex flex-col">
              <span className="text-[13px] font-black uppercase tracking-[0.4em] text-indigo-600 mb-2">លទ្ធផលទទួលបាន</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleModeChange('word')}
                  className={`px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${outputMode === 'word' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                >
                  RUN AS WORD
                </button>
                <button 
                  onClick={() => handleModeChange('latex')}
                  className={`px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${outputMode === 'latex' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                >
                  RUN AS LATEX
                </button>
                { (isLoading || timer > 0) && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shadow-sm"
                  >
                    <div className={`w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] ${isLoading ? 'animate-pulse' : ''}`} />
                    <span className="text-[12px] font-black font-mono tracking-wider">
                      {isLoading ? "កំពុងដំណើរការ៖ " : "ចំណាយពេល៖ "} {timer.toFixed(1)}s
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
            
            <div className="flex gap-4">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={copyToClipboard}
                disabled={!extractedText || isLoading}
                className="px-8 py-3.5 bg-white border border-slate-200 rounded-3xl text-[12px] font-black uppercase tracking-widest text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-all disabled:opacity-50 flex items-center gap-4 shadow-sm"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-slate-400" />}
                ចម្លង {outputMode === 'word' ? "DOCX" : "TEX"}
              </motion.button>
              
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={outputMode === 'word' ? handleDownloadWord : handleDownloadLaTeX}
                disabled={!extractedText || isLoading}
                className="px-10 py-3.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-3xl text-[12px] font-black uppercase tracking-widest hover:brightness-110 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-4 shadow-xl shadow-orange-100"
              >
                <Download className="w-5 h-5" /> ទាញយក .{outputMode === 'word' ? "DOCX" : "TEX"}
              </motion.button>
            </div>
          </div>

          <div className="flex-1 p-16 overflow-y-auto scrollbar-hide flex flex-col relative">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-600 font-bold"
              >
                <AlertCircle className="w-6 h-6 shrink-0" />
                {error}
              </motion.div>
            )}

            {extractedText || isLoading ? (
              <div className="flex flex-col">
                {isLoading && !extractedText && (
                  <div className="flex-1 flex flex-col items-center justify-center gap-8 py-20">
                     <div className="w-28 h-28 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
                     <p className="text-slate-400 font-black uppercase tracking-[0.3em] animate-pulse text-center">កំពុងបំប្លែងដោយបញ្ញាសិប្បនិម្មិត...</p>
                  </div>
                )}
                
                {extractedText && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="whitespace-pre-wrap text-2xl leading-[3.5rem] font-medium text-slate-800"
                  >
                    {extractedText}
                    {isLoading && (
                      <motion.span 
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-3 h-8 bg-indigo-600 ml-2 align-middle rounded-sm"
                      />
                    )}
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                <div className="w-40 h-40 bg-indigo-50/50 rounded-full flex items-center justify-center mb-10 relative">
                   <div className="absolute inset-0 bg-indigo-400/5 rounded-full animate-ping" />
                   <RotateCcw className="w-16 h-16 text-indigo-400 animate-spin-slow" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-4 uppercase tracking-[0.2em]">GATEWAY <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">STANDBY</span></h3>
                <p className="text-slate-400 max-w-lg leading-relaxed font-bold text-lg mb-12">
                   សូមបញ្ចូលឯកសាររបស់អ្នកនៅក្នុងផ្នែកខាងឆ្វេង ដើម្បីទទួលបានការបំប្លែងខ្លឹមសាររបស់លោកអ្នកដោយស្វ័យប្រវត្តិ។
                </p>

                <div className="flex flex-wrap justify-center gap-6">
                   <div className="px-8 py-5 bg-indigo-50/30 rounded-[2.5rem] flex flex-col items-center gap-3 border border-indigo-100/30">
                      <Zap className="w-6 h-6 text-indigo-500" />
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest text-center leading-tight">ល្បឿន & ត្រឹមត្រូវ <br/> AI Processing</span>
                   </div>
                   <div className="px-8 py-5 bg-blue-50/30 rounded-[2.5rem] flex flex-col items-center gap-3 border border-blue-100/30">
                      <ShieldCheck className="w-6 h-6 text-blue-500" />
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest text-center leading-tight">សុវត្ថិភាព100% <br/> Secure & Private</span>
                   </div>
                   <div className="px-8 py-5 bg-green-50/30 rounded-[2.5rem] flex flex-col items-center gap-3 border border-green-100/30">
                      <Check className="w-6 h-6 text-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest text-center leading-tight">គាំទ្រច្រើនផ្លូវ <br/> DOCX, LaTeX, PDF</span>
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* Result Footer Banner */}
          <div className="h-24 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 px-12 flex items-center justify-between">
             <div className="flex items-center gap-5">
                <div className="flex -space-x-3">
                   <div className="w-12 h-12 rounded-full bg-blue-400 border-[6px] border-white/20 flex items-center justify-center text-white text-xs font-black shadow-xl">AI</div>
                   <div className="w-12 h-12 rounded-full bg-indigo-600 border-[6px] border-white/20 flex items-center justify-center text-white text-xs font-black shadow-xl">OC</div>
                   <div className="w-12 h-12 rounded-full bg-pink-500 border-[6px] border-white/20 flex items-center justify-center text-white text-xs font-black shadow-xl">RT</div>
                </div>
                <div className="flex flex-col">
                   <span className="text-white font-black text-sm">ប្រើរូបមន្តតាមរយៈ AI</span>
                   <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest tracking-tighter">SESSION ធ្វើការនាពេលនេះ • គ្រប់គ្រងដោយបញ្ញាសិប្បនិម្មិត</span>
                </div>
             </div>
             <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-lg animate-pulse" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/40 shadow-lg" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/40 shadow-lg" />
             </div>
          </div>
        </section>
      </main>

      <footer className="h-16 bg-white border-t border-slate-100 flex items-center px-12 gap-10 text-[11px] font-black uppercase tracking-widest text-slate-400 shrink-0">
         <div className="flex items-center gap-4">
           <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
           <span className="text-slate-600">ស្ថានភាព៖ អនឡាញពិតាកាល</span>
         </div>
         <div className="flex items-center gap-4 border-l border-slate-100 pl-10">
           <Zap className="w-4 h-4 text-orange-400 fill-orange-400/20" />
           <span>AI Engine: Ultra v4.5.2</span>
         </div>
         <div className="flex items-center gap-4 border-l border-slate-100 pl-10">
           <RotateCcw className="w-4 h-4 text-indigo-400" />
           <span>ល្បឿន៖ 0.8s Ultra FAST</span>
         </div>

         <div className="ml-auto flex items-center gap-12">
            <span>Server: Virtual Private Hub</span>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm shadow-emerald-100">SHIELD ACTIVE</span>
            </div>
         </div>
      </footer>
    </div>
  );
}


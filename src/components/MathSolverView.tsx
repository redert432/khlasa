import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Image as ImageIcon, Sparkles, CheckCircle2, ChevronRight, Loader2, Brain, X } from 'lucide-react';
import { solveMathProblem } from '../lib/gemini';
import { useI18n } from './LanguageContext';

export function MathSolverView() {
  const { t, language } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [result, setResult] = useState<{ solution: string, steps: string[], explanation: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const handleSolve = async () => {
    if (!file) return;
    setIsSolving(true);
    try {
      const data = await solveMathProblem(file, language === 'ar' ? 'Arabic' : 'English');
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSolving(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-theme-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-theme-accent" />
        </div>
        <h2 className="text-4xl font-serif font-bold text-white mb-4">{t.mathSolver}</h2>
        <p className="text-theme-text-secondary text-lg font-light leading-relaxed">
          {t.mathSolverDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
        {/* Left Side: Upload & Preview */}
        <div className="space-y-6 h-full">
          <div 
            className={`glass-card rounded-[40px] border-2 border-dashed transition-all relative overflow-hidden flex flex-col items-center justify-center min-h-[400px] p-8 ${
              preview ? 'border-theme-accent/30' : 'border-theme-border hover:border-theme-accent/50'
            }`}
          >
            {preview ? (
              <>
                <img src={preview} alt="Problem Preview" className="absolute inset-0 w-full h-full object-contain p-4" />
                <button 
                  onClick={reset}
                  className="absolute top-4 right-4 bg-red-500/80 p-2 rounded-full text-white hover:bg-red-500 transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-6 group w-full h-full justify-center">
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <div className="w-20 h-20 bg-theme-bg/50 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform border border-theme-border">
                  <Camera className="w-10 h-10 text-theme-accent" />
                </div>
                <div className="text-center">
                  <div className="text-white font-bold text-xl mb-2">{t.uploadMath}</div>
                  <div className="text-theme-text-secondary text-sm font-light">{t.mathPlaceholder}</div>
                </div>
              </label>
            )}
          </div>

          <button 
            disabled={!file || isSolving}
            onClick={handleSolve}
            className={`w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all ${
              !file || isSolving 
                ? 'bg-theme-border text-theme-text-secondary cursor-not-allowed opacity-50' 
                : 'bg-theme-accent text-theme-bg shadow-xl shadow-theme-accent/20 hover:brightness-110 active:scale-95'
            }`}
          >
            {isSolving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
            {isSolving ? t.solving : t.generateSummary}
          </button>
        </div>

        {/* Right Side: Results */}
        <div className="h-full">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card rounded-[40px] p-8 border border-theme-border h-full flex flex-col"
              >
                <div className="inline-flex items-center gap-2 bg-theme-accent/10 px-4 py-2 rounded-full text-theme-accent text-xs font-bold uppercase tracking-widest mb-6">
                  <CheckCircle2 className="w-4 h-4" />
                  {t.solution}
                </div>

                <div className="text-3xl font-serif font-bold text-white mb-8 p-6 bg-theme-bg/50 rounded-3xl border border-theme-border text-center">
                  {result.solution}
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-theme-text-secondary uppercase tracking-widest flex items-center gap-2">
                       <ChevronRight className="w-4 h-4" />
                       {t.steps}
                    </h3>
                    {result.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-4 group">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-theme-surface-sm border border-theme-border flex items-center justify-center text-xs font-bold text-theme-accent group-hover:bg-theme-accent group-hover:text-theme-bg transition-colors">
                            {idx + 1}
                          </div>
                          {idx < result.steps.length - 1 && <div className="w-px flex-1 bg-theme-border my-1" />}
                        </div>
                        <div className="flex-1 text-white font-light pb-4 text-sm leading-relaxed" dir="auto">
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 bg-theme-accent/5 rounded-3xl border border-theme-accent/10">
                    <p className="text-xs text-theme-text-secondary italic font-light" dir="auto">
                      {result.explanation}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full glass-card rounded-[40px] border border-theme-border flex flex-col items-center justify-center p-12 text-center opacity-40 grayscale group-hover:grayscale-0 transition-all">
                <div className="w-24 h-24 bg-theme-surface-sm rounded-full flex items-center justify-center mb-8 border border-theme-border">
                  <ImageIcon className="w-10 h-10 text-theme-text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-theme-text-secondary mb-2" dir="auto">
                   {language === 'ar' ? 'بانتظار المسألة...' : 'Waiting for problem...'}
                </h3>
                <p className="text-xs text-theme-text-secondary font-light max-w-xs">{t.mathSolverDesc}</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

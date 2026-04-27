import React, { useState, useRef } from 'react';
import { FileUp, Image as ImageIcon, Loader2, ArrowLeft, Camera, FileText } from 'lucide-react';
import { summarizeDocument } from '../lib/gemini';
import { saveMeeting } from '../lib/storage';
import { useI18n } from './LanguageContext';

export function DocumentUploadView({ onCancel, onComplete }: { onCancel: () => void, onComplete: (id: string) => void }) {
  const { t, language: appLang } = useI18n();
  const [docTitle, setDocTitle] = useState(t.titlePlaceholder);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summaryLanguage, setSummaryLanguage] = useState<string>(appLang === 'ar' ? 'Arabic' : appLang === 'es' ? 'Spanish' : appLang === 'fr' ? 'French' : 'English');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-set title from file name (without extension) if not changed yet
      if (docTitle === 'New Document') {
        setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);

    try {
      const id = Date.now().toString();

      // Process with Gemini
      const insights = await summarizeDocument(selectedFile, summaryLanguage);

      // Save to storage
      saveMeeting({
        id,
        title: docTitle || 'Untitled Document',
        summary: insights.summary,
        actionItems: insights.actionItems,
        illustrationSvg: insights.illustrationSvg,
        status: 'completed',
        type: 'document',
        createdAt: Date.now()
      });

      setIsProcessing(false);
      onComplete(id);
    } catch (err) {
      setIsProcessing(false);
      console.error(err);
      alert("Failed to process the document. Please try again.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <button 
        onClick={onCancel}
        className="flex items-center gap-2 text-theme-text-secondary hover:text-theme-accent transition-colors mb-6 font-medium text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> {t.back}
      </button>

      <div className="bg-theme-surface-lg rounded-3xl p-6 md:p-10 shadow-lg border border-theme-border">
        <div className="mb-8">
          <label className="block text-xs font-bold tracking-wide text-theme-text-secondary uppercase mb-2">{t.titleLabel}</label>
          <input 
            type="text" 
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            dir="auto"
            className="w-full text-3xl mb-0 bg-transparent border-none outline-none text-theme-accent placeholder:text-theme-text-secondary/50 focus:ring-0 p-0"
            placeholder={t.titlePlaceholder}
          />
        </div>

        <div className="mb-8 relative group">
          <div className="w-full h-64 p-4 rounded-2xl bg-theme-surface-sm border-2 border-dashed border-theme-border flex flex-col items-center justify-center transition-all">
            {selectedFile ? (
              <div className="flex flex-col items-center text-center">
                 <div className="w-16 h-16 bg-theme-accent/10 rounded-2xl flex items-center justify-center mb-4 text-theme-accent">
                    {selectedFile.type.includes('pdf') ? <FileText className="w-8 h-8" /> : <ImageIcon className="w-8 h-8" />}
                 </div>
                 <h3 className="text-theme-text-primary font-medium truncate max-w-sm">{selectedFile.name}</h3>
                 <p className="text-theme-text-secondary text-xs mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                 <button 
                    onClick={() => setSelectedFile(null)}
                    className="mt-4 text-xs font-bold text-red-400 hover:text-red-500 transition-colors"
                 >
                    {t.remove}
                 </button>
              </div>
            ) : (
              <div className="text-center p-6">
                 <div className="flex justify-center gap-4 mb-6">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-16 h-16 bg-theme-surface-lg rounded-2xl shadow border border-theme-border flex items-center justify-center hover:border-theme-accent text-theme-text-secondary hover:text-theme-accent transition-all group-hover:scale-105"
                    >
                        <FileUp className="w-8 h-8" />
                    </button>
                    <button 
                        onClick={() => cameraInputRef.current?.click()}
                        className="w-16 h-16 bg-theme-surface-lg rounded-2xl shadow border border-theme-border flex items-center justify-center hover:border-theme-accent text-theme-text-secondary hover:text-theme-accent transition-all group-hover:scale-105"
                    >
                        <Camera className="w-8 h-8" />
                    </button>
                 </div>
                 <h3 className="text-theme-text-primary font-bold mb-1">{t.dropZone}</h3>
                 <p className="text-theme-text-secondary text-sm" dir="auto">{t.dropSubtitle}</p>
              </div>
            )}
            
            <input 
               type="file" 
               ref={fileInputRef} 
               className="hidden" 
               accept="application/pdf,image/png,image/jpeg,image/webp" 
               onChange={handleFileChange}
            />
            {/* Capture generic image attribute */}
            <input 
               type="file" 
               ref={cameraInputRef} 
               className="hidden" 
               accept="image/*" 
               capture="environment"
               onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-theme-border pt-6">
          <div className="flex items-center gap-2 text-sm text-theme-text-secondary">
             <span dir="auto">{t.summaryLang}:</span>
             <select 
                value={summaryLanguage}
                onChange={(e) => setSummaryLanguage(e.target.value)}
                className="bg-theme-surface-sm border border-theme-border text-theme-text-primary rounded outline-none p-1.5 focus:border-theme-accent"
             >
                <option value="Arabic">Arabic / العربية</option>
                <option value="English">English / الإنجليزية</option>
                <option value="Spanish">Spanish / Español</option>
                <option value="French">French / Français</option>
             </select>
          </div>
          <button
            onClick={handleProcess}
            disabled={isProcessing || !selectedFile}
            className="bg-theme-accent text-theme-bg px-8 py-3 rounded-xl font-bold tracking-wide flex items-center gap-2 hover:bg-theme-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-theme-accent/10"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t.processing}
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                {t.generateSummary}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

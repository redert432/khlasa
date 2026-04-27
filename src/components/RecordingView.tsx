import React, { useState } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { Mic, Square, Loader2, ArrowLeft, Send, Globe } from 'lucide-react';
import { summarizeMeeting } from '../lib/gemini';
import { saveMeeting } from '../lib/storage';
import { useI18n } from './LanguageContext';

export function RecordingView({ onCancel, onComplete }: { onCancel: () => void, onComplete: (id: string) => void }) {
  const { t, language: appLang } = useI18n();
  const [meetingTitle, setMeetingTitle] = useState(t.titlePlaceholder);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [language, setLanguage] = useState<string>(appLang === 'ar' ? 'ar-SA' : appLang === 'es' ? 'es-ES' : appLang === 'fr' ? 'fr-FR' : 'en-US'); 
  const [summaryLanguage, setSummaryLanguage] = useState<string>(appLang === 'ar' ? 'Arabic' : appLang === 'es' ? 'Spanish' : appLang === 'fr' ? 'French' : 'English');

  const { isRecording, transcript, setTranscript, startRecording, stopRecording, isSupported } = useSpeechRecognition(language);

  const handleProcess = async () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);

    try {
      const id = Date.now().toString();

      // Stop recording if active
      if (isRecording) stopRecording();

      // 2. Process with Gemini
      const insights = await summarizeMeeting(transcript, summaryLanguage) as any;

      // 3. Save to storage
      saveMeeting({
        id,
        title: meetingTitle || 'Untitled Meeting',
        transcript: transcript,
        diarizedTranscript: insights.diarizedTranscript,
        summary: insights.summary,
        actionItems: insights.actionItems,
        illustrationSvg: insights.illustrationSvg,
        status: 'completed',
        type: 'audio',
        createdAt: Date.now()
      });

      setIsProcessing(false);
      onComplete(id);
    } catch (err) {
      setIsProcessing(false);
      console.error(err);
      alert("Failed to process the meeting. Please try again.");
    }
  };


  return (
    <div className="max-w-3xl mx-auto">
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
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
            dir="auto"
            className="w-full text-3xl mb-0 bg-transparent border-none outline-none text-theme-accent placeholder:text-theme-text-secondary/50 focus:ring-0 p-0"
            placeholder={t.titlePlaceholder}
          />
        </div>

        {!isSupported && !pasteMode && (
          <div className="bg-theme-surface-sm border border-theme-border text-theme-text-secondary p-4 rounded-xl mb-6 text-sm">
            {t.noItems} {t.recordOrUpload}
            <button onClick={() => setPasteMode(true)} className="ml-2 font-bold text-theme-accent underline">{t.pasteManually}</button>
          </div>
        )}

        {isSupported && (
          <div className="flex flex-col items-center justify-center gap-4 mb-10">
            {isRecording ? (
              <button 
                onClick={stopRecording}
                className="w-24 h-24 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full flex flex-col items-center justify-center transition-all shadow-sm ring-4 ring-red-500/10"
              >
                <Square className="w-8 h-8 mb-1 fill-current" />
                <span className="text-xs font-semibold uppercase tracking-wider">{t.stop}</span>
              </button>
            ) : (
              <button 
                onClick={() => { startRecording(); setPasteMode(false); }}
                className="w-24 h-24 bg-theme-surface-sm border-4 border-theme-border overflow-hidden hover:bg-theme-border text-theme-accent rounded-full flex flex-col items-center justify-center transition-all shadow-md group"
              >
                <Mic className="w-8 h-8 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold uppercase tracking-wider">{t.record}</span>
              </button>
            )}
            
            <div className="flex items-center gap-2 mt-4 text-theme-text-secondary">
              <Globe className="w-4 h-4" />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isRecording}
                className="bg-theme-surface-sm border border-theme-border rounded border-none outline-none text-sm p-1 cursor-pointer disabled:opacity-50"
              >
                <option value="ar-SA">Arabic (العربية)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Spanish (Español)</option>
                <option value="fr-FR">French (Français)</option>
              </select>
            </div>
          </div>
        )}

        <div className="mb-6 relative">
          <label className="block text-xs font-bold tracking-wide text-theme-text-secondary uppercase mb-2 flex justify-between">
            <span>{t.transcript}</span>
            {isSupported && (
              <button 
                onClick={() => setPasteMode(!pasteMode)} 
                className="text-theme-text-secondary hover:text-theme-accent transition-colors underline"
                dir="auto"
              >
                {pasteMode ? t.autoCapture : t.pasteManually}
              </button>
            )}
          </label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            disabled={isRecording || (!pasteMode && isSupported)}
            dir="auto"
            placeholder={
              isRecording ? t.listening : 
              pasteMode ? t.titlePlaceholder : t.recordOrUpload
            }
            className="w-full h-64 p-4 rounded-2xl bg-theme-surface-sm border border-theme-border focus:border-theme-accent focus:ring focus:ring-theme-accent/20 transition-all resize-none text-theme-text-primary leading-relaxed font-sans placeholder:text-theme-text-secondary/50 disabled:opacity-70"
          ></textarea>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6 border-t border-theme-border pt-6">
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
            disabled={isProcessing || !transcript.trim() || isRecording}
            className="bg-theme-accent text-theme-bg px-8 py-3 rounded-xl font-bold tracking-wide flex items-center gap-2 hover:bg-theme-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-theme-accent/10"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t.processing}
              </>
            ) : (
              <>
                <Send className="w-5 h-5 -ml-1" />
                {t.generateSummary}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { BookOpen, FileUp, Loader2, ArrowLeft, Send, Sparkles, Plus, Trash2 } from 'lucide-react';
import { compileResearch } from '../lib/gemini';
import { saveMeeting } from '../lib/storage';
import { useI18n } from './LanguageContext';

export function ResearchCreatorView({ onCancel, onComplete }: { onCancel: () => void, onComplete: (id: string) => void }) {
  const { t, language: appLang } = useI18n();
  const [title, setTitle] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summaryLanguage, setSummaryLanguage] = useState<string>(appLang === 'ar' ? 'Arabic' : appLang === 'es' ? 'Spanish' : appLang === 'fr' ? 'French' : 'English');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCompile = async () => {
    if (!sourceText && files.length === 0) return;
    
    setIsProcessing(true);
    try {
      const result = await compileResearch(sourceText, files, summaryLanguage);
      const meetingId = saveMeeting({
        title: title || result.title || 'Research Compilation',
        type: 'research',
        status: 'completed',
        illustrationSvg: result.illustrationSvg,
        researchContent: {
          abstract: result.abstract,
          introduction: result.introduction,
          methodology: result.methodology,
          findings: result.findings,
          conclusion: result.conclusion,
          references: result.references
        }
      });
      onComplete(meetingId);
    } catch (error) {
      console.error('Research compilation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const fillExample = () => {
    setTitle(appLang === 'ar' ? 'أدوات النجاح الدراسي الرقمي' : 'Digital Student Success Toolkit');
    setSourceText(appLang === 'ar' ? `تنظيم الوقت والمهام (الإنتاجية)
Notion: يعتبر "المقر الرئيسي" للطلاب؛ يمكنك فيه كتابة الملاحظات، تنظيم جداول المحاضرات، وتتبع المهام الدراسية في مكان واحد.
Google Calendar: ضروري لجدولة مواعيد الامتحانات والمحاضرات مع خاصية التنبيهات التلقائية.
MyStudyLife: تطبيق متخصص للطلاب فقط، يتيح لك إدخال جدول الحصص والواجبات المدرسية بشكل منظم جداً.

الدراسة والمذاكرة الذكية
Anki أو Quizlet: تعتمد هذه التطبيقات على "التكرار المتباعد"، وهي مثالية لحفظ المصطلحات.
Photomath: حل المسائل الرياضية بمجرد تصويرها.
Wolfram Alpha: محرك معرفي قوي للمسائل العلمية والفيزيائية المتقدمة.

التركيز ومنع التشتت
Forest: تطبيق يحفزك على ترك الهاتف؛ كلما ركزت أكثر نمت شجرتك الافتراضية.
Tide: يوفر أصواتاً بيضاء تساعد على التركيز العميق.

البحث والكتابة الأكاديمية
Perplexity AI: محرك بحث ذكي يعطيك إجابات مباشرة مع ذكر المصادر.
Grammarly / QuillBot: أدوات أساسية لتحسين الكتابة باللغة الإنجليزية.
Zotero: إدارة المراجع والمصادر وتوليد الفهارس تلقائياً.` : `Productivity & Task Management
Notion: The "headquarters" for students; notes, schedules, and task tracking.
Google Calendar: Essential for scheduling exams and lectures with reminders.
MyStudyLife: Student-only app for class schedules and assignments.

Smart Studying
Anki or Quizlet: Spaced repetition for memorizing terms and languages.
Photomath: Solve math problems by taking a photo.
Wolfram Alpha: Powerful computational knowledge engine for advanced science.

Focus & Concentration
Forest: Gamified focus that grows virtual trees when you stay off your phone.
Tide: White noise and Pomodoro timer for deep focus.

Academic Research & Writing
Perplexity AI: Smart search engine with direct citations.
Grammarly / QuillBot: Grammar correction and professional paraphrasing.
Zotero: Reference management and automated bibliography generation.`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onCancel}
          className="flex items-center gap-2 text-theme-text-secondary hover:text-theme-accent transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> {t.back}
        </button>
        <button 
          onClick={fillExample}
          className="text-xs font-bold text-theme-accent uppercase tracking-widest hover:underline flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {appLang === 'ar' ? 'جرب مثالاً تعليمياً' : 'Try Educational Example'}
        </button>
      </div>

      <div className="bg-theme-surface-lg rounded-3xl p-6 md:p-10 shadow-lg border border-theme-border">
        <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-theme-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-theme-accent" />
            </div>
            <h2 className="text-3xl font-bold text-theme-text-primary mb-2">{t.academicResearch}</h2>
            <p className="text-theme-text-secondary">{t.reviewSummaries}</p>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-xs font-bold tracking-wide text-theme-text-secondary uppercase mb-2">{t.titleLabel}</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl bg-theme-surface-sm border border-theme-border rounded-xl px-4 py-3 outline-none text-theme-text-primary focus:border-theme-accent transition-all"
              placeholder={t.titlePlaceholder}
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-wide text-theme-text-secondary uppercase mb-2">{t.researchSources}</label>
            <textarea 
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              dir="auto"
              placeholder={t.researchPlaceholder}
              className="w-full h-48 p-4 rounded-xl bg-theme-surface-sm border border-theme-border focus:border-theme-accent focus:ring focus:ring-theme-accent/20 transition-all resize-none text-theme-text-primary leading-relaxed font-sans placeholder:text-theme-text-secondary/50"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-wide text-theme-text-secondary uppercase mb-4">{t.newDocument}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               {files.map((file, idx) => (
                  <div key={idx} className="relative aspect-square bg-theme-surface-sm border border-theme-border rounded-xl flex flex-col items-center justify-center p-2 group">
                      <BookOpen className="w-8 h-8 text-theme-text-secondary mb-1 opacity-50" />
                      <span className="text-[10px] text-theme-text-secondary truncate w-full text-center px-1 font-medium">{file.name}</span>
                      <button 
                        onClick={() => removeFile(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                  </div>
               ))}
               <button 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-theme-border rounded-xl flex flex-col items-center justify-center text-theme-text-secondary hover:border-theme-accent hover:text-theme-accent transition-all bg-theme-surface-sm/50"
               >
                 <Plus className="w-6 h-6 mb-1" />
                 <span className="text-[10px] font-bold uppercase tracking-wider">{t.newDocument}</span>
               </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden" 
              accept=".pdf,image/*"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-12 pt-8 border-t border-theme-border">
          <div className="flex items-center gap-2 text-sm text-theme-text-secondary">
             <span dir="auto">{t.summaryLang}:</span>
             <select 
                value={summaryLanguage}
                onChange={(e) => setSummaryLanguage(e.target.value)}
                className="bg-transparent border-none font-bold text-theme-accent outline-none cursor-pointer p-0"
             >
                <option value="Arabic">Arabic / العربية</option>
                <option value="English">English / الإنجليزية</option>
                <option value="Spanish">Spanish / Español</option>
                <option value="French">French / Français</option>
             </select>
          </div>
          <button
            onClick={handleCompile}
            disabled={isProcessing || (!sourceText && files.length === 0)}
            className={`w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-xl ${
                isProcessing ? 'bg-theme-border text-theme-text-secondary cursor-not-allowed' : 'bg-theme-accent text-theme-bg hover:brightness-110 active:scale-95 shadow-theme-accent/20'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                {t.compiling}
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                {t.compileResearch}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

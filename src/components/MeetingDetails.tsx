import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Calendar, FileText, CheckCircle2, Share, Mail, BookOpen, Sparkles, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { getMeeting, Meeting } from '../lib/storage';
import { useI18n } from './LanguageContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function MeetingDetails({ meetingId, onBack }: { meetingId: string, onBack: () => void }) {
  const { t, dir } = useI18n();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchMeeting() {
      try {
        const m = getMeeting(meetingId);
        setMeeting(m);
      } finally {
        setLoading(false);
      }
    }
    fetchMeeting();
  }, [meetingId]);

  if (loading) {
    return <div className="text-center py-20 text-theme-text-secondary font-medium">Loading details...</div>;
  }

  if (!meeting) {
    return <div className="text-center py-20 text-theme-text-secondary">Meeting not found.</div>;
  }

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    setIsDownloading(true);
    try {
      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-theme-bg'),
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${meeting.title.replace(/\s+/g, '_')}_research.pdf`);
    } catch (error) {
      console.error('PDF Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    let text = '';
    if (meeting.type === 'research' && meeting.researchContent) {
      const c = meeting.researchContent;
      text = `Research title: ${meeting.title}\n\nAbstract:\n${c.abstract}\n\nIntroduction:\n${c.introduction}\n\nFindings:\n${c.findings}\n\nConclusion:\n${c.conclusion}\n\nReferences:\n${c.references?.join('\n')}`;
    } else {
      text = `Meeting: ${meeting.title}\n\nSummary:\n${meeting.summary}\n\nAction Items:\n${meeting.actionItems?.join('\n') || 'None'}`;
    }
    const subject = encodeURIComponent(`${meeting.type === 'research' ? 'Research' : 'Meeting Notes'}: ${meeting.title}`);
    const body = encodeURIComponent(text);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-theme-text-secondary hover:text-theme-accent transition-colors mb-2 font-medium text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> {t.back}
      </button>

      <div className="bg-theme-surface-lg p-8 rounded-3xl shadow-sm border border-theme-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-4 items-start">
            <div className={`p-3 rounded-2xl ${meeting.type === 'research' ? 'bg-purple-500/10 text-purple-500' : 'bg-theme-accent/10 text-theme-accent'}`}>
                {meeting.type === 'research' ? <BookOpen className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-3xl font-bold font-serif m-0 mb-2" dir="auto">
                {meeting.title}
              </h2>
              <div className="flex items-center gap-2 text-sm text-theme-text-secondary">
                <Calendar className="w-4 h-4" />
                {meeting.createdAt ? format(new Date(meeting.createdAt), 'PPP p') : '...'}
              </div>
            </div>
        </div>
        <div className="flex gap-2">
          {meeting.type === 'research' && meeting.status === 'completed' && (
            <button 
              disabled={isDownloading}
              onClick={handleDownloadPDF}
              className="bg-theme-accent text-theme-bg px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:brightness-110 disabled:opacity-50"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {t.downloadPDF}
            </button>
          )}
          <button 
            onClick={handleShare}
            className="bg-theme-surface-sm hover:bg-theme-border text-theme-text-secondary px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors border border-theme-border"
          >
            <Mail className="w-4 h-4" />
            {meeting.type === 'research' ? t.compileResearch : t.summary}
          </button>
        </div>
      </div>

      {meeting.status === 'processing' && (
        <div className="bg-theme-surface-sm border border-theme-border text-theme-accent p-4 rounded-xl flex items-center gap-3">
          <div className="animate-pulse w-2 h-2 bg-theme-accent rounded-full" />
          {t.processing}
        </div>
      )}

      <div ref={contentRef} className="space-y-8 p-4 print:p-8">
        {meeting.illustrationSvg && (
          <div className="bg-theme-surface-lg rounded-3xl p-8 border border-theme-border flex justify-center items-center overflow-hidden mb-8">
             <div 
               className="max-w-md w-full aspect-video flex justify-center items-center" 
               dangerouslySetInnerHTML={{ __html: meeting.illustrationSvg }} 
             />
          </div>
        )}

        {meeting.status === 'completed' && meeting.type === 'research' && meeting.researchContent && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-12 py-10 border-b border-theme-border hidden print:block">
               <h1 className="text-4xl font-serif font-bold mb-4">{meeting.title}</h1>
               <p className="text-theme-text-secondary">{format(new Date(meeting.createdAt), 'PPP')}</p>
            </div>

            <section className="bg-theme-surface-lg rounded-3xl p-10 border border-theme-border shadow-sm font-serif">
              <h3 className="text-sm font-bold text-theme-text-secondary uppercase tracking-widest mb-6 border-b border-theme-border pb-3 text-center">{t.abstract}</h3>
              <p className="text-lg leading-relaxed text-theme-text-primary text-justify italic" dir="auto">
                {meeting.researchContent.abstract}
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-theme-surface-lg rounded-3xl p-8 border border-theme-border shadow-sm">
                <h3 className="text-lg font-bold text-theme-accent mb-4 border-b border-theme-border pb-2" dir="auto">{t.introduction}</h3>
                <div className="text-theme-text-secondary leading-relaxed whitespace-pre-wrap" dir="auto">
                  {meeting.researchContent.introduction}
                </div>
              </section>
              <section className="bg-theme-surface-lg rounded-3xl p-8 border border-theme-border shadow-sm">
                <h3 className="text-lg font-bold text-theme-accent mb-4 border-b border-theme-border pb-2" dir="auto">{t.methodology}</h3>
                <div className="text-theme-text-secondary leading-relaxed whitespace-pre-wrap" dir="auto">
                  {meeting.researchContent.methodology}
                </div>
              </section>
            </div>

            <section className="bg-theme-surface-lg rounded-3xl p-10 border border-theme-border shadow-sm">
              <h3 className="text-2xl font-bold text-theme-text-primary mb-6 flex items-center gap-2" dir="auto">
                <Sparkles className="w-6 h-6 text-theme-accent" />
                {t.findings}
              </h3>
              <div className="text-theme-text-secondary leading-relaxed whitespace-pre-wrap text-lg" dir="auto">
                {meeting.researchContent.findings}
              </div>
            </section>

            <section className="bg-theme-surface-sm rounded-3xl p-10 border border-theme-border">
              <h3 className="text-lg font-bold text-theme-text-primary mb-4" dir="auto">{t.conclusion}</h3>
              <p className="text-theme-text-secondary leading-relaxed" dir="auto">
                {meeting.researchContent.conclusion}
              </p>
            </section>

            {meeting.researchContent.references && meeting.researchContent.references.length > 0 && (
              <section className="bg-black/20 rounded-3xl p-8 border border-theme-border">
                <h3 className="text-sm font-bold text-theme-text-secondary uppercase tracking-widest mb-4">{t.references}</h3>
                <ul className="space-y-2 list-disc list-inside text-[10px] text-theme-text-secondary font-mono">
                  {meeting.researchContent.references.map((r, i) => (
                    <li key={i} dir="auto">{r}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>

      {meeting.status === 'completed' && meeting.type !== 'research' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <section className="bg-theme-surface-lg rounded-3xl p-8 border border-theme-border shadow-sm">
              <h3 className="text-lg font-bold text-theme-text-primary mb-4 flex items-center gap-2" dir="auto">
                <FileText className="w-5 h-5 text-theme-accent" />
                {t.summary}
              </h3>
              <div className="prose prose-invert max-w-none text-theme-text-secondary whitespace-pre-wrap leading-relaxed" dir="auto">
                {meeting.summary || t.noSummary}
              </div>
            </section>

            <section className="bg-theme-surface-lg rounded-3xl p-8 text-theme-text-primary shadow-sm border border-theme-border">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-theme-text-primary" dir="auto">
                <CheckCircle2 className="w-5 h-5 text-theme-accent-dark" />
                {t.actionItems}
              </h3>
              {meeting.actionItems && meeting.actionItems.length > 0 ? (
                <ul className="space-y-3">
                  {meeting.actionItems.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 bg-theme-surface-sm border border-theme-border p-4 rounded-xl">
                      <div className="w-5 h-5 rounded-full border-2 border-theme-accent flex-shrink-0 mt-0.5" />
                      <span className="text-theme-text-primary leading-snug" dir="auto">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-theme-text-secondary italic" dir="auto">{t.noAction}</p>
              )}
            </section>
          </div>

          <div className="md:col-span-1">
            {meeting.diarizedTranscript ? (
               <section className="bg-theme-surface-lg rounded-3xl p-6 border border-theme-border shadow-sm sticky top-24">
                <h3 className="text-sm font-bold text-theme-text-secondary uppercase tracking-wider mb-4 border-b border-theme-border pb-3" dir="auto">
                  {t.conversation}
                </h3>
                <div className="text-sm text-theme-text-secondary leading-relaxed h-[400px] overflow-y-auto pr-2 custom-scrollbar whitespace-pre-wrap" dir="auto">
                  {meeting.diarizedTranscript}
                </div>
              </section>
            ) : meeting.transcript ? (
              <section className="bg-theme-surface-lg rounded-3xl p-6 border border-theme-border shadow-sm sticky top-24">
                <h3 className="text-sm font-bold text-theme-text-secondary uppercase tracking-wider mb-4 border-b border-theme-border pb-3" dir="auto">
                  {t.rawTranscript}
                </h3>
                <div className="text-xs text-theme-text-secondary leading-relaxed font-mono h-[400px] overflow-y-auto pr-2 custom-scrollbar whitespace-pre-wrap" dir="auto">
                  {meeting.transcript}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Plus, Mic, FileText, CheckCircle2, Trash2, Calendar, FileUp, Settings as SettingsIcon, Globe, BookOpen, Sparkles, ArrowRight, Brain } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { RecordingView } from './RecordingView';
import { DocumentUploadView } from './DocumentUploadView';
import { ResearchCreatorView } from './ResearchCreatorView';
import { MeetingDetails } from './MeetingDetails';
import { SettingsModal } from './SettingsModal';
import { WelcomeOverlay } from './WelcomeOverlay';
import { ResourceHub } from './ResourceHub';
import { StudentWorkspace } from './StudentWorkspace';
import { Flashcards } from './Flashcards';
import { MathSolverView } from './MathSolverView';
import { getMeetings, deleteMeeting as removeMeetingFromStorage, Meeting } from '../lib/storage';
import { useI18n } from './LanguageContext';

export function Dashboard() {
  const { t, language, setLanguage } = useI18n();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activeView, setActiveView] = useState<'list' | 'recording' | 'document' | 'research' | 'hub' | 'workspace' | 'flashcards' | 'math' | 'details'>('list');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (activeView === 'list') {
      const loaded = getMeetings().sort((a,b) => b.createdAt - a.createdAt);
      setMeetings(loaded);
    }
  }, [activeView]);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('khulasa_welcome_v1');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const handleDismissWelcome = () => {
    localStorage.setItem('khulasa_welcome_v1', 'true');
    setShowWelcome(false);
  };

  const removeMeeting = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(t.deleteConfirm)) return;
    removeMeetingFromStorage(id);
    setMeetings(getMeetings().sort((a,b) => b.createdAt - a.createdAt));
    if (selectedMeetingId === id) {
      setActiveView('list');
      setSelectedMeetingId(null);
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-theme-bg flex flex-col selection:bg-theme-accent/30">
      <div className="atmosphere" />
      
      <header className="fixed top-0 left-0 right-0 h-20 bg-theme-bg/50 backdrop-blur-2xl border-b border-theme-border z-40 px-6 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => { setActiveView('list'); setSelectedMeetingId(null); }}
        >
          <div className="w-10 h-10 bg-theme-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(197,164,126,0.3)] group-hover:scale-105 transition-transform">
            <Mic className="w-6 h-6 text-theme-bg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif tracking-tight text-theme-text-primary m-0 leading-none">Khulasa</h1>
            <span className="text-[10px] font-bold text-theme-accent uppercase tracking-[0.2em] opacity-80">Intelligence Summarizer</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="px-4 py-2 rounded-xl border border-theme-border hover:bg-theme-accent/10 hover:border-theme-accent/30 transition-all text-xs font-bold flex items-center gap-2"
          >
            <Globe className="w-4 h-4 text-theme-accent" />
            <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          <button 
            onClick={() => setShowSettings(true)}
            className="p-2.5 hover:bg-theme-surface-sm rounded-xl transition-all flex items-center gap-2 text-theme-text-secondary hover:text-theme-accent hover:border-theme-accent/30 border border-transparent"
            title={t.settings}
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider hidden md:inline">{t.settings}</span>
          </button>
        </div>
      </header>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      <AnimatePresence>
        {showWelcome && <WelcomeOverlay onDismiss={handleDismissWelcome} />}
      </AnimatePresence>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 pt-28 text-theme-text-primary">
        <AnimatePresence mode="wait">
          {activeView === 'list' && (
            <motion.div 
              key="list-view"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={containerVariants}
              className="space-y-12"
            >
              <section className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <motion.div variants={itemVariants} className="md:col-span-8">
                  <h2 className="text-4xl font-serif font-bold mb-2 tracking-tight" dir="auto">{t.yourHub}</h2>
                  <p className="text-theme-text-secondary text-lg font-light leading-relaxed max-w-xl" dir="auto">{t.reviewSummaries}</p>
                </motion.div>
                
                <motion.div variants={itemVariants} className="md:col-span-4 flex flex-col justify-end gap-3">
                  <div className="flex flex-wrap gap-3 sm:justify-end">
                    <button 
                      onClick={() => setActiveView('workspace')}
                      className="flex-1 bg-theme-surface-sm hover:border-theme-accent/30 border border-theme-border text-theme-text-primary px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-theme-accent/5 backdrop-blur-md"
                    >
                      <Sparkles className="w-5 h-5 text-theme-accent" />
                      <span>{t.studentWorkspace}</span>
                    </button>
                    <button 
                      onClick={() => setActiveView('hub')}
                      className="flex-1 bg-theme-surface-sm hover:border-theme-accent/30 border border-theme-border text-theme-text-primary px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-theme-accent/5"
                    >
                      <Sparkles className="w-5 h-5 text-theme-accent" />
                      <span>{t.resourceHub}</span>
                    </button>
                    <button 
                      onClick={() => setActiveView('math')}
                      className="flex-1 bg-theme-surface-sm hover:border-theme-accent/30 border border-theme-border text-theme-text-primary px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-theme-accent/5 backdrop-blur-md"
                    >
                      <Sparkles className="w-5 h-5 text-theme-accent" />
                      <span>{t.mathSolver}</span>
                    </button>
                    <button 
                      onClick={() => setActiveView('flashcards')}
                      className="flex-1 bg-theme-surface-sm hover:border-theme-accent/30 border border-theme-border text-theme-text-primary px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-theme-accent/5 backdrop-blur-md"
                    >
                      <Brain className="w-5 h-5 text-theme-accent" />
                      <span>{t.flashcards}</span>
                    </button>
                    <button 
                      onClick={() => setActiveView('recording')}
                      className="flex-1 bg-theme-accent hover:brightness-110 text-theme-bg px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-theme-accent/20 active:scale-95"
                    >
                      <Mic className="w-5 h-5" />
                      <span>{t.newMeeting}</span>
                    </button>
                  </div>
                </motion.div>
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.button 
                  variants={itemVariants}
                  onClick={() => setActiveView('research')}
                  className="group relative overflow-hidden bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/20 rounded-3xl p-8 flex flex-col items-start text-left transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-purple-500/5"
                >
                  <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{t.academicResearch}</h3>
                  <p className="text-purple-300/60 text-sm font-light">Compile notes and sources into university-grade research papers.</p>
                  <ArrowRight className="absolute bottom-8 right-8 w-5 h-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                </motion.button>

                <motion.button 
                  variants={itemVariants}
                  onClick={() => setActiveView('document')}
                  className="group relative overflow-hidden bg-theme-accent/5 hover:bg-theme-accent/10 border border-theme-accent/20 rounded-3xl p-8 flex flex-col items-start text-left transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-theme-accent/5"
                >
                  <div className="w-12 h-12 bg-theme-accent/20 rounded-2xl flex items-center justify-center mb-6 text-theme-accent group-hover:scale-110 transition-transform">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{t.newDocument}</h3>
                  <p className="text-theme-accent/60 text-sm font-light">Upload PDF or images to extract summaries and deep insights.</p>
                  <ArrowRight className="absolute bottom-8 right-8 w-5 h-5 text-theme-accent opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                </motion.button>

                <motion.div 
                  variants={itemVariants}
                  className="hidden md:flex bg-theme-surface-sm/50 border border-theme-border rounded-3xl p-8 flex-col justify-center items-center text-center italic text-theme-text-secondary font-light"
                >
                  <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                  "Khulasa turns complexity into clarity in seconds."
                </motion.div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                   <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-theme-text-secondary">Recent Work</h3>
                   <div className="h-px flex-1 bg-theme-border" />
                </div>
                
                {meetings.length === 0 ? (
                  <div className="text-center py-20 bg-theme-surface-lg/50 rounded-[40px] border border-theme-border border-dashed">
                    <FileText className="w-12 h-12 text-theme-text-secondary mx-auto mb-4 opacity-10" />
                    <h3 className="text-lg font-medium text-theme-text-primary mb-1" dir="auto">{t.noItems}</h3>
                    <p className="text-theme-text-secondary text-sm" dir="auto font-light">{t.recordOrUpload}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {meetings.map((m) => (
                      <motion.div 
                        variants={itemVariants}
                        key={m.id} 
                        onClick={() => {
                          setSelectedMeetingId(m.id);
                          setActiveView('details');
                        }}
                        className="glass-card group p-6 rounded-[32px] cursor-pointer relative flex flex-col h-full hover:shadow-2xl hover:shadow-theme-accent/5 transition-all"
                      >
                         <div className="flex justify-between items-start mb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${
                              m.type === 'research' ? 'bg-purple-500/10 text-purple-400' : 
                              m.type === 'document' ? 'bg-theme-accent/10 text-theme-accent' : 
                              'bg-red-500/10 text-red-400'
                            }`}>
                              {m.type === 'research' ? <BookOpen className="w-5 h-5" /> : 
                               m.type === 'document' ? <FileUp className="w-5 h-5" /> : 
                               <Mic className="w-5 h-5" />}
                            </div>
                            <button 
                              onClick={(e) => removeMeeting(m.id, e)} 
                              className="p-2 text-theme-text-secondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 rounded-xl"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                         
                         <h3 className="text-xl font-bold text-white mb-2 leading-tight pr-4 font-serif" title={m.title} dir="auto">{m.title}</h3>
                         
                         <div className="flex items-center gap-2 text-xs text-theme-text-secondary mt-1 mb-8 font-light">
                            <Calendar className="w-3.5 h-3.5" />
                            {m.createdAt ? format(new Date(m.createdAt), 'MMMM d, yyyy') : 'Just now'}
                         </div>
                         
                         <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-theme-bg/50 border border-theme-border text-[10px] font-bold text-theme-text-secondary uppercase tracking-wider">
                              <CheckCircle2 className="w-3 h-3 text-theme-accent" />
                              {m.actionItems?.length || 0} Task{m.actionItems?.length !== 1 ? 's' : ''}
                            </div>
                            <div className={`w-2 h-2 rounded-full ${m.status === 'processing' ? 'bg-theme-accent animate-pulse' : 'bg-green-500'}`} />
                         </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
            </motion.div>
          )}

          {activeView === 'research' && (
            <motion.div key="research-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <ResearchCreatorView 
                onCancel={() => setActiveView('list')} 
                onComplete={(id) => {
                  setSelectedMeetingId(id);
                  setActiveView('details');
                }} 
              />
            </motion.div>
          )}

          {activeView === 'math' && (
            <motion.div key="math-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex justify-start mb-8">
                <button 
                  onClick={() => setActiveView('list')}
                  className="flex items-center gap-2 text-theme-text-secondary hover:text-theme-accent transition-colors font-medium text-sm"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> {t.back}
                </button>
              </div>
              <MathSolverView />
            </motion.div>
          )}

          {activeView === 'flashcards' && (
            <motion.div key="flashcards-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex justify-start mb-8">
                <button 
                  onClick={() => setActiveView('list')}
                  className="flex items-center gap-2 text-theme-text-secondary hover:text-theme-accent transition-colors font-medium text-sm"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> {t.back}
                </button>
              </div>
              <Flashcards />
            </motion.div>
          )}

          {activeView === 'workspace' && (
            <motion.div key="workspace-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex justify-start mb-8">
                <button 
                  onClick={() => setActiveView('list')}
                  className="flex items-center gap-2 text-theme-text-secondary hover:text-theme-accent transition-colors font-medium text-sm"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> {t.back}
                </button>
              </div>
              <StudentWorkspace />
            </motion.div>
          )}

          {activeView === 'hub' && (
            <motion.div key="hub-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex justify-start mb-8">
                <button 
                  onClick={() => setActiveView('list')}
                  className="flex items-center gap-2 text-theme-text-secondary hover:text-theme-accent transition-colors font-medium text-sm"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> {t.back}
                </button>
              </div>
              <ResourceHub onClose={() => setActiveView('list')} />
            </motion.div>
          )}

          {activeView === 'recording' && (
            <motion.div key="recording-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <RecordingView 
                onCancel={() => setActiveView('list')} 
                onComplete={(id) => {
                  setSelectedMeetingId(id);
                  setActiveView('details');
                }} 
              />
            </motion.div>
          )}

          {activeView === 'document' && (
            <motion.div key="document-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <DocumentUploadView 
                onCancel={() => setActiveView('list')} 
                onComplete={(id) => {
                  setSelectedMeetingId(id);
                  setActiveView('details');
                }} 
              />
            </motion.div>
          )}

          {activeView === 'details' && selectedMeetingId && (
            <motion.div key="details-view" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
              <MeetingDetails 
                meetingId={selectedMeetingId} 
                onBack={() => {
                  setActiveView('list');
                  setSelectedMeetingId(null);
                }} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

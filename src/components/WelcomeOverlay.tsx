import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Globe, BookOpen, Clock, ArrowRight, Mic } from 'lucide-react';
import { useI18n } from './LanguageContext';

export function WelcomeOverlay({ onDismiss }: { onDismiss: () => void }) {
  const { t } = useI18n();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const principles = [
    {
      icon: <Sparkles className="w-6 h-6 text-theme-accent" />,
      title: t.principle1Title,
      desc: t.principle1Desc
    },
    {
      icon: <Globe className="w-6 h-6 text-blue-400" />,
      title: t.principle2Title,
      desc: t.principle2Desc
    },
    {
      icon: <BookOpen className="w-6 h-6 text-purple-400" />,
      title: t.principle3Title,
      desc: t.principle3Desc
    },
    {
      icon: <Clock className="w-6 h-6 text-green-400" />,
      title: t.principle4Title,
      desc: t.principle4Desc
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-theme-bg/95 backdrop-blur-md overflow-y-auto"
    >
      <div className="atmosphere" />
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-4xl w-full bg-theme-surface-lg rounded-[48px] p-8 md:p-16 border border-theme-border shadow-2xl relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-theme-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-theme-accent/5 rounded-full blur-3xl -ml-32 -mb-32" />

        <div className="relative">
          <motion.div variants={item} className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-theme-accent rounded-3xl flex items-center justify-center shadow-2xl shadow-theme-accent/30 rotate-6">
              <Mic className="w-10 h-10 text-theme-bg" />
            </div>
          </motion.div>

          <motion.div variants={item} className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6 tracking-tight">
              {t.welcomeTitle}
            </h1>
            <p className="text-xl text-theme-text-secondary font-light">
              {t.welcomeSubtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {principles.map((p, idx) => (
              <motion.div 
                key={idx}
                variants={item}
                className="group p-6 rounded-3xl border border-theme-border bg-theme-surface-sm hover:border-theme-accent/30 transition-all hover:bg-theme-bg"
              >
                <div className="w-12 h-12 bg-theme-bg rounded-2xl flex items-center justify-center mb-4 border border-theme-border group-hover:scale-110 transition-transform">
                  {p.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
                <p className="text-sm text-theme-text-secondary leading-relaxed font-light">
                  {p.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onDismiss}
              className="w-full sm:w-auto px-10 py-5 bg-theme-accent text-theme-bg rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:brightness-110 transition-all active:scale-95 shadow-xl shadow-theme-accent/20"
            >
              {t.getStarted}
              <ArrowRight className="w-6 h-6" />
            </button>
            <button 
              onClick={onDismiss}
              className="text-theme-text-secondary hover:text-white transition-colors text-sm font-medium"
            >
              {t.skip}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

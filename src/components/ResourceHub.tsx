import React from 'react';
import { motion } from 'motion/react';
import { Layout, Palette, Zap, Shield, Search, PenTool, Hash, Cloud, Layers, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useI18n } from './LanguageContext';

export function ResourceHub({ onClose }: { onClose: () => void }) {
  const { t, language } = useI18n();

  const categories = [
    {
      title: language === 'ar' ? 'الإنتاجية وتنظيم الوقت' : 'Productivity & Time Management',
      items: [
        { name: 'Notion', desc: language === 'ar' ? 'المقر الرئيسي للملاحظات والجداول.' : 'Notes, schedules, and task headquarters.' },
        { name: 'Google Calendar', desc: language === 'ar' ? 'جدولة المواعيد والتنبيهات التلقائية.' : 'Automatic scheduling and alerts.' },
        { name: 'MyStudyLife', desc: language === 'ar' ? 'تنظيم جداول الحصص والواجبات.' : 'Class schedules and assignment tracking.' }
      ]
    },
    {
      title: language === 'ar' ? 'الدراسة والمذاكرة الذكية' : 'Smart Studying',
      items: [
        { name: 'Anki / Quizlet', desc: language === 'ar' ? 'التكرار المتباعد لحفظ المصطلحات.' : 'Spaced repetition for memorization.' },
        { name: 'Photomath', desc: language === 'ar' ? 'حل المسائل الرياضية بالكاميرا.' : 'Solve math via camera.' },
        { name: 'Wolfram Alpha', desc: language === 'ar' ? 'محرك معرفي للمسائل المتقدمة.' : 'Knowledge engine for advanced problems.' }
      ]
    },
    {
      title: language === 'ar' ? 'البحث والكتابة الأكاديمية' : 'Academic Writing',
      items: [
        { name: 'Perplexity AI', desc: language === 'ar' ? 'بحث ذكي مع ذكر المصادر.' : 'Smart search with source citations.' },
        { name: 'Grammarly', desc: language === 'ar' ? 'تصحيح القواعد والأسلوب.' : 'Grammar and style correction.' },
        { name: 'Zotero', desc: language === 'ar' ? 'إدارة المراجع وتوليد الفهارس.' : 'Reference management and citations.' }
      ]
    },
    {
      title: language === 'ar' ? 'التركيز والتعاون' : 'Focus & Collaboration',
      items: [
        { name: 'Forest', desc: language === 'ar' ? 'تحفيز التركيز عبر زراعة الأشجار.' : 'Gamified focus through tree planting.' },
        { name: 'Canva', desc: language === 'ar' ? 'تصميم العروض والملصقات العلمية.' : 'Design presentations and posters.' },
        { name: 'Google Drive', desc: language === 'ar' ? 'التخزين السحابي والعمل الجماعي.' : 'Cloud storage and collaboration.' }
      ]
    }
  ];

  return (
    <div className="space-y-12 pb-20">
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-theme-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Layers className="w-8 h-8 text-theme-accent" />
        </div>
        <h2 className="text-4xl font-serif font-bold text-white mb-4">{t.resourceHub}</h2>
        <p className="text-theme-text-secondary text-lg font-light leading-relaxed">
          {t.resourceHubDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((cat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-8 rounded-[40px] border border-theme-border flex flex-col h-full"
          >
            <h3 className="text-xl font-bold text-theme-accent mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {cat.title}
            </h3>
            <div className="space-y-6">
              {cat.items.map((item, i) => (
                <div key={i} className="group border-b border-theme-border/10 pb-4 last:border-0 last:pb-0">
                  <h4 className="font-bold text-white mb-1 group-hover:text-theme-accent transition-colors">{item.name}</h4>
                  <p className="text-sm text-theme-text-secondary font-light">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

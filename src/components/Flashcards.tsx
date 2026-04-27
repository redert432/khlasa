import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Eye, Brain, Check, X, RotateCcw } from 'lucide-react';
import { useI18n } from './LanguageContext';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  level: number; // 0-4 for SRS
  nextReview: number;
}

export function Flashcards() {
  const { t, language } = useI18n();
  const [cards, setCards] = useState<Flashcard[]>(() => JSON.parse(localStorage.getItem('khulasa_flashcards') || '[]'));
  const [isAdding, setIsAdding] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [isStudying, setIsStudying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    localStorage.setItem('khulasa_flashcards', JSON.stringify(cards));
  }, [cards]);

  const addCard = () => {
    if (!newFront || !newBack) return;
    const newCard: Flashcard = {
      id: Math.random().toString(36).substr(2, 9),
      front: newFront,
      back: newBack,
      level: 0,
      nextReview: Date.now()
    };
    setCards([newCard, ...cards]);
    setNewFront('');
    setNewBack('');
    setIsAdding(false);
  };

  const deleteCard = (id: string) => {
    setCards(cards.filter(c => c.id !== id));
  };

  const studyCards = cards.filter(c => c.nextReview <= Date.now());

  const handleResult = (known: boolean) => {
    const card = studyCards[currentIndex];
    const newLevel = known ? Math.min(card.level + 1, 4) : 0;
    // Simple SRS intervals (in minutes for demo purposes, hours in real usage)
    const intervals = [1, 5, 20, 60, 1440]; // 1m, 5m, 20m, 1h, 1d
    const nextReview = Date.now() + intervals[newLevel] * 60000;

    setCards(cards.map(c => c.id === card.id ? { ...c, level: newLevel, nextReview } : c));
    
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      setIsStudying(false);
      setCurrentIndex(0);
      setShowAnswer(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-4xl font-serif font-bold text-white mb-4">{t.flashcards}</h2>
        <p className="text-theme-text-secondary text-lg font-light leading-relaxed">
          {t.flashcardsDesc}
        </p>
      </div>

      <div className="flex justify-between items-center bg-theme-surface-sm p-4 rounded-3xl border border-theme-border">
        <div className="flex items-center gap-4">
          <div className="bg-theme-accent/20 p-3 rounded-2xl">
            <Brain className="w-6 h-6 text-theme-accent" />
          </div>
          <div>
            <div className="text-white font-bold">{cards.length} {t.flashcards}</div>
            <div className="text-xs text-theme-text-secondary">
              {studyCards.length > 0 
                ? (language === 'ar' ? `لديك ${studyCards.length} بطاقة للمذاكرة` : `You have ${studyCards.length} cards to study`)
                : (language === 'ar' ? 'أنت جاهز تماماً!' : 'You are all caught up!')}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {studyCards.length > 0 && !isStudying && (
            <button 
              onClick={() => setIsStudying(true)}
              className="bg-theme-accent text-theme-bg px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:brightness-110 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              {t.study}
            </button>
          )}
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="border border-theme-border text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-theme-bg transition-all"
          >
            <Plus className="w-4 h-4" />
            {t.addCard}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-8 rounded-[40px] border border-theme-accent/20 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-theme-text-secondary uppercase tracking-widest">{t.front}</label>
                  <textarea 
                    className="w-full bg-theme-bg border border-theme-border rounded-2xl p-4 text-white focus:border-theme-accent/50 outline-none transition-all resize-none h-32"
                    value={newFront}
                    onChange={e => setNewFront(e.target.value)}
                    dir="auto"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-theme-text-secondary uppercase tracking-widest">{t.backSide}</label>
                  <textarea 
                    className="w-full bg-theme-bg border border-theme-border rounded-2xl p-4 text-white focus:border-theme-accent/50 outline-none transition-all resize-none h-32"
                    value={newBack}
                    onChange={e => setNewBack(e.target.value)}
                    dir="auto"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsAdding(false)} className="px-6 py-2 text-theme-text-secondary hover:text-white">{t.cancel}</button>
                <button onClick={addCard} className="bg-theme-accent text-theme-bg px-10 py-3 rounded-2xl font-bold">{t.addCard}</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isStudying ? (
        <div className="max-w-xl mx-auto py-10">
          <div className="perspective-1000">
            <motion.div 
              className={`relative w-full aspect-video transition-all duration-500 rounded-[48px] p-10 flex flex-col items-center justify-center text-center cursor-pointer shadow-2xl ${
                showAnswer ? 'bg-theme-surface-lg' : 'bg-theme-accent'
              }`}
              onClick={() => !showAnswer && setShowAnswer(true)}
              animate={{ rotateY: showAnswer ? 180 : 0 }}
            >
              <div className={`transition-all ${showAnswer ? 'opacity-0' : 'opacity-100'}`} style={{ backfaceVisibility: 'hidden' }}>
                <h3 className="text-2xl md:text-3xl font-bold text-theme-bg leading-tight" dir="auto">
                  {studyCards[currentIndex]?.front}
                </h3>
                <div className="mt-8 text-theme-bg/60 text-sm font-bold flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  {t.showAnswer}
                </div>
              </div>
              
              <div className={`absolute inset-0 p-10 flex flex-col items-center justify-center text-center transition-all ${showAnswer ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                   style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight" dir="auto">
                  {studyCards[currentIndex]?.back}
                </h3>
                <div className="mt-12 flex gap-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleResult(false); }}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-red-500 group-hover:border-red-500 transition-all">
                      <X className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-theme-text-secondary group-hover:text-red-400">{t.forgot}</span>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleResult(true); }}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-green-500 group-hover:border-green-500 transition-all">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-theme-text-secondary group-hover:text-green-400">{t.mastered}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="mt-8 text-center text-xs font-bold text-theme-text-secondary uppercase tracking-widest">
            {currentIndex + 1} / {studyCards.length}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.length === 0 ? (
            <div className="md:col-span-3 py-20 text-center">
              <Brain className="w-16 h-16 text-theme-border mx-auto mb-4" />
              <p className="text-theme-text-secondary">{t.noCards}</p>
            </div>
          ) : (
            cards.map(card => (
              <div key={card.id} className="glass-card p-6 rounded-3xl border border-theme-border hover:border-theme-accent/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => deleteCard(card.id)} className="text-theme-text-secondary hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="text-white font-bold leading-tight" dir="auto">{card.front}</div>
                  <div className="text-theme-text-secondary text-sm font-light border-t border-theme-border/10 pt-4" dir="auto">{card.back}</div>
                  <div className="flex justify-between items-center mt-4 pt-2">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map(l => (
                        <div key={l} className={`w-2 h-1 rounded-full ${l <= card.level ? 'bg-theme-accent' : 'bg-theme-border'}`} />
                      ))}
                    </div>
                    <div className="text-[10px] font-bold text-theme-text-secondary uppercase">
                       {card.nextReview <= Date.now() ? (language === 'ar' ? 'جاهزة للمذاكرة' : 'Ready') : (language === 'ar' ? 'تمت المذاكرة' : 'Studied')}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Calendar, CheckSquare, Plus, Save, Trash2, Clock, MapPin, Sparkles } from 'lucide-react';
import { useI18n } from './LanguageContext';

interface Note {
  id: string;
  title: string;
  content: string;
  date: number;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface ScheduleItem {
  id: string;
  subject: string;
  time: string;
  location: string;
  day: string;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_AR = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];

export function StudentWorkspace() {
  const { t, language } = useI18n();
  const [activeTab, setActiveTab] = useState<'notes' | 'schedule' | 'tasks'>('notes');
  
  // Persistence logic
  const [notes, setNotes] = useState<Note[]>(() => JSON.parse(localStorage.getItem('khulasa_notes') || '[]'));
  const [tasks, setTasks] = useState<Task[]>(() => JSON.parse(localStorage.getItem('khulasa_tasks') || '[]'));
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => JSON.parse(localStorage.getItem('khulasa_schedule') || '[]'));

  const [currentNote, setCurrentNote] = useState<Partial<Note>>({});
  const [isEditingNote, setIsEditingNote] = useState(false);

  useEffect(() => localStorage.setItem('khulasa_notes', JSON.stringify(notes)), [notes]);
  useEffect(() => localStorage.setItem('khulasa_tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('khulasa_schedule', JSON.stringify(schedule)), [schedule]);

  const addNote = () => {
    if (!currentNote.title || !currentNote.content) return;
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title: currentNote.title,
      content: currentNote.content,
      date: Date.now()
    };
    setNotes([newNote, ...notes]);
    setCurrentNote({});
    setIsEditingNote(false);
  };

  const addTask = (text: string) => {
    if (!text.trim()) return;
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      completed: false
    };
    setTasks([newTask, ...tasks]);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addScheduleItem = (day: string) => {
    const subject = prompt(language === 'ar' ? 'اسم المادة' : 'Subject Name');
    const time = prompt(language === 'ar' ? 'الوقت (مثلاً 10:00)' : 'Time (e.g. 10:00)');
    if (subject && time) {
      setSchedule([...schedule, { 
        id: Math.random().toString(36).substr(2, 9), 
        subject, time, location: '', day 
      }]);
    }
  };

  const currentDays = language === 'ar' ? DAYS_AR : DAYS;

  return (
    <div className="space-y-8 pb-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-4xl font-serif font-bold text-white mb-4">{t.studentWorkspace}</h2>
        <p className="text-theme-text-secondary text-lg font-light leading-relaxed">
          {t.workspaceDesc}
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-theme-surface-sm p-1.5 rounded-2xl border border-theme-border flex gap-1">
          {[
            { id: 'notes', icon: <Book className="w-4 h-4" />, label: t.notes },
            { id: 'schedule', icon: <Calendar className="w-4 h-4" />, label: t.schedule },
            { id: 'tasks', icon: <CheckSquare className="w-4 h-4" />, label: t.tasks }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === tab.id 
                  ? 'bg-theme-accent text-theme-bg shadow-lg shadow-theme-accent/20' 
                  : 'text-theme-text-secondary hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'notes' && (
          <motion.div 
            key="notes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            <div className="lg:col-span-8">
              <div className="glass-card rounded-[40px] p-8 space-y-6">
                <input 
                  type="text"
                  placeholder={language === 'ar' ? 'عنوان الملاحظة' : 'Note Title'}
                  className="w-full bg-transparent border-none text-2xl font-bold text-white focus:ring-0 placeholder:text-white/20"
                  value={currentNote.title || ''}
                  onChange={e => setCurrentNote({ ...currentNote, title: e.target.value })}
                />
                <textarea 
                  placeholder={t.notePlaceholder}
                  className="w-full bg-transparent border-none text-theme-text-secondary text-lg font-light focus:ring-0 min-h-[400px] resize-none placeholder:text-white/10"
                  value={currentNote.content || ''}
                  onChange={e => setCurrentNote({ ...currentNote, content: e.target.value })}
                  dir="auto"
                />
                <div className="flex justify-end">
                  <button 
                    onClick={addNote}
                    className="bg-theme-accent text-theme-bg px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-theme-accent/20"
                  >
                    <Save className="w-5 h-5" />
                    {t.saveNote}
                  </button>
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 space-y-4">
               <h3 className="text-xs font-bold text-theme-text-secondary uppercase tracking-widest px-4">{language === 'ar' ? 'المسودات الأخيرة' : 'Recent Drafts'}</h3>
               {notes.map(note => (
                 <div key={note.id} className="glass-card p-5 rounded-3xl group border border-transparent hover:border-theme-accent/30 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white truncate pr-4">{note.title}</h4>
                      <button onClick={() => setNotes(notes.filter(n => n.id !== note.id))} className="text-theme-text-secondary hover:text-red-400 opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-theme-text-secondary line-clamp-2 font-light">{note.content}</p>
                 </div>
               ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'schedule' && (
          <motion.div 
            key="schedule"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-7 gap-4"
          >
            {currentDays.map((day, idx) => (
              <div key={idx} className="flex flex-col gap-3">
                <div className="text-center font-bold text-xs uppercase tracking-widest text-theme-text-secondary py-2 border-b border-theme-border mb-2">
                  {day}
                </div>
                {schedule.filter(item => item.day === day).map(item => (
                  <div key={item.id} className="glass-card p-4 rounded-2xl border-l-4 border-l-theme-accent relative group">
                    <button 
                      onClick={() => setSchedule(schedule.filter(s => s.id !== item.id))}
                      className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="text-xs font-bold text-white mb-1">{item.subject}</div>
                    <div className="flex items-center gap-1 text-[10px] text-theme-text-secondary">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => addScheduleItem(day)}
                  className="w-full aspect-square border-2 border-dashed border-theme-border rounded-2xl flex items-center justify-center text-theme-text-secondary hover:text-theme-accent hover:border-theme-accent/50 transition-all group"
                >
                  <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'tasks' && (
          <motion.div 
            key="tasks"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto w-full glass-card rounded-[48px] p-10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
               <Sparkles className="w-24 h-24 text-theme-accent" />
            </div>
            
            <h3 className="text-2xl font-serif font-bold text-white mb-8 relative">{t.tasks}</h3>
            
            <div className="flex gap-4 mb-10 relative">
              <input 
                type="text"
                placeholder={t.taskPlaceholder}
                className="flex-1 bg-theme-bg/50 border border-theme-border rounded-2xl px-6 py-4 text-white focus:border-theme-accent/50 focus:ring-0 outline-none transition-all"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    addTask((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button 
                className="bg-theme-accent text-theme-bg w-14 h-14 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
                onClick={() => {
                  const input = document.querySelector('input[placeholder="' + t.taskPlaceholder + '"]') as HTMLInputElement;
                  addTask(input.value);
                  input.value = '';
                }}
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3 relative">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${
                    task.completed 
                      ? 'bg-theme-bg/30 border-theme-border/50 opacity-50' 
                      : 'bg-theme-bg border-theme-border hover:border-theme-accent/30'
                  }`}
                >
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      task.completed 
                        ? 'bg-theme-accent border-theme-accent' 
                        : 'border-theme-border'
                    }`}
                  >
                    {task.completed && <CheckSquare className="w-4 h-4 text-theme-bg" />}
                  </button>
                  <span className={`flex-1 text-white font-light ${task.completed ? 'line-through' : ''}`} dir="auto">
                    {task.text}
                  </span>
                  <button 
                    onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                    className="text-theme-text-secondary hover:text-red-400 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

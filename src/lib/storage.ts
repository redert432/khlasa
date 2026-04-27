export interface Meeting {
  id: string;
  title: string;
  transcript?: string; // Raw transcript
  diarizedTranscript?: string; // Structured transcript with speakers
  summary?: string;
  actionItems?: string[];
  status: 'processing' | 'completed';
  type?: 'audio' | 'document' | 'research';
  visualThemeImageUrl?: string;
  illustrationSvg?: string;
  researchContent?: {
    abstract?: string;
    introduction?: string;
    methodology?: string;
    findings?: string;
    conclusion?: string;
    references?: string[];
  };
  createdAt: number;
}

export const getMeetings = (): Meeting[] => {
  try {
    const data = localStorage.getItem('khulasa_meetings');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export const getMeeting = (id: string): Meeting | null => {
  const meetings = getMeetings();
  return meetings.find(m => m.id === id) || null;
}

export const saveMeeting = (meeting: Partial<Meeting>) => {
  const meetings = getMeetings();
  const id = meeting.id || Math.random().toString(36).substring(2, 9);
  const updatedAt = Date.now();
  
  const existingIndex = meetings.findIndex(m => m.id === id);
  const newMeeting: Meeting = {
    id,
    title: meeting.title || 'Untitled',
    status: meeting.status || 'processing',
    createdAt: meeting.createdAt || updatedAt,
    ...meeting
  };

  if (existingIndex >= 0) {
    meetings[existingIndex] = newMeeting;
  } else {
    meetings.push(newMeeting);
  }
  
  localStorage.setItem('khulasa_meetings', JSON.stringify(meetings));
  return id;
}

export const deleteMeeting = (id: string) => {
  const meetings = getMeetings();
  const filtered = meetings.filter(m => m.id !== id);
  localStorage.setItem('khulasa_meetings', JSON.stringify(filtered));
}

export interface Settings {
  appLanguage: 'en' | 'ar' | 'es' | 'fr';
  summaryLanguage: string;
  theme: 'light' | 'dark' | 'system';
}

const DEFAULT_SETTINGS: Settings = {
  appLanguage: 'ar', // Default to Arabic as requested
  summaryLanguage: 'Arabic',
  theme: 'dark'
};

export const getSettings = (): Settings => {
  try {
    const data = localStorage.getItem('khulasa_settings');
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export const saveSettings = (settings: Partial<Settings>) => {
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem('khulasa_settings', JSON.stringify(updated));
}

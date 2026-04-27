import { useState, useEffect, useCallback, useRef } from 'react';

// Extend window for webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useSpeechRecognition(lang?: string) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Please try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    if (lang) {
      recognition.lang = lang;
    }
    
    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      if (event.error !== 'aborted') {
        setError(event.error);
        setIsRecording(false);
      }
    };
    
    recognition.onend = () => {
      if (isRecordingRef.current) {
        try {
          recognition.start();
        } catch(e) {
          console.error("Failed to restart recognition:", e);
          setIsRecording(false);
        }
      }
    }

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = useCallback(() => {
    setError(null);
    setTranscript('');
    setIsRecording(true);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("error starting recognition", e);
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("error stopping recognition", e);
      }
    }
  }, []);

  return {
    isRecording,
    transcript,
    setTranscript, // expose so user can manually edit/paste
    startRecording,
    stopRecording,
    error,
    isSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  };
}

import { useRef, useState } from 'react';
import axios from 'axios';

const AI_SERVICE_URL = process.env.REACT_APP_AI_SERVICE_URL || 'http://localhost:8082';

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useProduceDetection() {
  const [aiLoading, setAiLoading]       = useState(false);
  const [aiError, setAiError]           = useState('');
  const [recording, setRecording]       = useState(false);
  const fileInputRef                    = useRef(null);
  const mediaRecorderRef                = useRef(null);

  const triggerCamera = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // ─── Image Analysis ─────────────────────────────────────────────────────────
  const analyzeImage = async (file, onResult) => {
    if (!file) return;
    setAiLoading(true);
    setAiError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        `${AI_SERVICE_URL}/api/ai/analyze-image`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const { cropName } = response.data;
      if (cropName) {
        onResult({ cropName, quantity: null, price: null });
      } else {
        setAiError('Could not identify produce. Please type manually.');
      }
    } catch {
      setAiError('Image detection unavailable. Please type manually.');
    } finally {
      setAiLoading(false);
    }
  };

  // ─── Voice Input (MediaRecorder → Whisper → llama3) ─────────────────────────
  const startVoice = async (onResult) => {
    // If already recording, stop it
    if (recording) {
      mediaRecorderRef.current?.stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      setAiLoading(true);
      setAiError('');
      setRecording(true);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);

        const blob     = new Blob(chunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', blob, 'voice.webm');

        try {
          const response = await axios.post(
            `${AI_SERVICE_URL}/api/ai/voice`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 300000 }
          );
          const { cropName, quantity, expectedPrice } = response.data;
          onResult({ cropName, quantity, price: expectedPrice });
        } catch {
          setAiError('Voice processing failed. Please try again.');
        } finally {
          setAiLoading(false);
        }
      };

      mediaRecorder.onerror = () => {
        setAiError('Recording failed. Please try again.');
        setAiLoading(false);
        setRecording(false);
      };

      mediaRecorder.start();

      // Auto-stop after 8 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') mediaRecorder.stop();
      }, 8000);

    } catch {
      setAiError('Microphone access denied. Please allow microphone permission.');
      setAiLoading(false);
      setRecording(false);
    }
  };

  return {
    aiLoading,
    aiError,
    recording,
    fileInputRef,
    preloadModel: () => {},
    triggerCamera,
    analyzeImage,
    startVoice,
    clearAiError: () => setAiError(''),
  };
}

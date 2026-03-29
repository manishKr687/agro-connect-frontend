import { useRef, useState } from 'react';

/**
 * Hook that wraps the Web Speech API for single-utterance voice input.
 *
 * @param {object} options
 * @param {string} options.lang     - BCP-47 language tag (default: 'hi-IN')
 * @param {function} options.onResult - called with the recognised transcript string
 */
export default function useSpeechInput({ lang = 'hi-IN', onResult }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const supported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const start = () => {
    if (!supported) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
      const spoken = e.results[0][0].transcript;
      onResult(spoken);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend   = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const stop = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const toggle = () => (listening ? stop() : start());

  return { listening, toggle, supported };
}

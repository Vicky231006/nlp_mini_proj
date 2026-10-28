/**
 * speechService.js
 * Frontend audio service providing:
 * 1. Speech-to-Text (STT) via Whisper API with Web Speech API fallback.
 * 2. Text-to-Speech (TTS) via HTML5 SpeechSynthesis with child-friendly prosody.
 */

import { transcribeAudio } from '../../accountApi.js';

/**
 * Sanitizes markdown content for natural spoken delivery.
 * Strips code blocks, formatting asterisks, headers, and citation tags like [1].
 */
export function sanitizeTextForSpeech(markdown) {
  if (typeof markdown !== 'string') return '';
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')      // Code blocks
    .replace(/`([^`]+)`/g, '$1')           // Inline code
    .replace(/\[\d+\]/g, '')               // Citation brackets like [1], [2]
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Markdown links -> link text
    .replace(/[#*_~>]/g, '')               // Markdown headers & style markers
    .replace(/^[-\u2022*]\s+/gm, '')       // Bullet points
    .replace(/\n\s*\n/g, '. ')             // Paragraph breaks to pause
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Converts a Blob to a base64 encoded data string.
 */
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Audio recorder manager for Whisper STT.
 */
export class SpeechRecorder {
  constructor({ onTranscript, onStatusChange, onError }) {
    this.onTranscript = onTranscript;
    this.onStatusChange = onStatusChange;
    this.onError = onError;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.browserRecognition = null;
    this.browserTranscript = '';
  }

  async start() {
    this.audioChunks = [];
    this.browserTranscript = '';

    // Check for browser recognition as instant fallback
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.browserRecognition = new SpeechRecognition();
        this.browserRecognition.continuous = true;
        this.browserRecognition.interimResults = true;
        this.browserRecognition.lang = 'en-US';
        this.browserRecognition.onresult = (event) => {
          let text = '';
          for (let i = 0; i < event.results.length; ++i) {
            text += event.results[i][0].transcript;
          }
          this.browserTranscript = text.trim();
        };
        this.browserRecognition.start();
      } catch {
        this.browserRecognition = null;
      }
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/wav';

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(250); // Collect in 250ms chunks
      this.onStatusChange?.('recording');
    } catch (err) {
      this.onError?.(err instanceof Error ? err.message : 'Microphone access denied or unavailable.');
      this.onStatusChange?.('idle');
    }
  }

  async stop() {
    if (this.browserRecognition) {
      try {
        this.browserRecognition.stop();
      } catch {
        // Ignore
      }
    }

    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      this.onStatusChange?.('idle');
      return;
    }

    this.onStatusChange?.('transcribing');

    return new Promise((resolve) => {
      this.mediaRecorder.onstop = async () => {
        try {
          if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
            this.stream = null;
          }

          const blob = new Blob(this.audioChunks, { type: this.mediaRecorder.mimeType });
          const base64Data = await blobToBase64(blob);

          let transcriptText = '';
          try {
            // Attempt Whisper transcription via backend
            const response = await transcribeAudio(base64Data, 'webm');
            transcriptText = (response?.text || '').trim();
          } catch (whisperError) {
            console.warn('Whisper backend transcription failed, falling back to browser STT:', whisperError);
          }

          // If Whisper was unavailable or returned empty, use browser transcript fallback
          if (!transcriptText && this.browserTranscript) {
            transcriptText = this.browserTranscript;
          }

          if (transcriptText) {
            this.onTranscript?.(transcriptText);
          } else {
            this.onError?.('Could not detect speech. Please try speaking closer to the microphone.');
          }
        } catch (error) {
          this.onError?.(error instanceof Error ? error.message : 'Speech transcription failed.');
        } finally {
          this.onStatusChange?.('idle');
          resolve();
        }
      };

      this.mediaRecorder.stop();
    });
  }
}

/**
 * Text-to-Speech (TTS) manager using HTML5 SpeechSynthesis.
 */
export class TutorSpeaker {
  constructor({ onStateChange }) {
    this.onStateChange = onStateChange;
    this.currentUtterance = null;
    this.activeMessageId = null;
  }

  isAvailable() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  stop() {
    if (this.isAvailable()) {
      window.speechSynthesis.cancel();
    }
    this.activeMessageId = null;
    this.currentUtterance = null;
    this.onStateChange?.({ speaking: false, activeMessageId: null });
  }

  speak(markdownText, messageId) {
    if (!this.isAvailable()) return;

    // If currently speaking this message, toggle off
    if (this.activeMessageId === messageId) {
      this.stop();
      return;
    }

    this.stop();

    const cleanedText = sanitizeTextForSpeech(markdownText);
    if (!cleanedText) return;

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    this.currentUtterance = utterance;
    this.activeMessageId = messageId;

    // Configure friendly, child-appropriate speech rate and pitch
    utterance.rate = 0.95;  // Slightly measured pace for clear comprehension
    utterance.pitch = 1.08; // Warm, engaging, friendly pitch

    // Choose English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find((v) =>
      v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Jenny') || v.name.includes('Google') || v.name.includes('Samantha'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      this.onStateChange?.({ speaking: true, activeMessageId: messageId });
    };

    utterance.onend = () => {
      this.activeMessageId = null;
      this.currentUtterance = null;
      this.onStateChange?.({ speaking: false, activeMessageId: null });
    };

    utterance.onerror = (e) => {
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('Speech synthesis error:', e);
      }
      this.activeMessageId = null;
      this.currentUtterance = null;
      this.onStateChange?.({ speaking: false, activeMessageId: null });
    };

    window.speechSynthesis.speak(utterance);
  }
}

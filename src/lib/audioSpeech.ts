/**
 * Audio Speech Synthesis & Natural Pronunciation Utility for LMLS
 * Strips raw markdown artifacts and optimizes speech cadence.
 */

export function stripMarkdownForSpeech(text: string): string {
  if (!text) return '';

  return text
    // Replace fenced code blocks with brief spoken indicator
    .replace(/```[a-zA-Z]*[\s\S]*?```/g, ' [code block omitted for audio] ')
    // Replace inline code `variable` with just variable
    .replace(/`([^`]+)`/g, '$1')
    // Remove headers (#, ##, ###)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold and italic markers (**bold**, *italic*, __bold__, _italic_)
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Replace markdown links [Anchor Text](http...) with just Anchor Text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove list bullets (*, -, +) and numbers (1., 2.)
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Remove blockquotes (> quote)
    .replace(/^\s*>\s+/gm, '')
    // Remove horizontal rules (---, ***, ___)
    .replace(/^(\*{3,}|-{3,}|_{3,})$/gm, '')
    // Remove markdown table lines (| Col 1 | Col 2 |)
    .replace(/\|/g, ', ')
    // Remove multiple consecutive spaces or newlines
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isSpeechSynthesisAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

export function speakText(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err?: any) => void;
  }
): SpeechSynthesisUtterance | null {
  if (!isSpeechSynthesisAvailable()) {
    options?.onError?.(new Error('SpeechSynthesis not supported'));
    return null;
  }

  try {
    stopSpeech();

    const cleanText = stripMarkdownForSpeech(text);
    if (!cleanText) return null;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = options?.rate ?? 1.05;
    utterance.pitch = options?.pitch ?? 1.0;
    utterance.lang = 'en-US';

    // Prefer smooth English natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Premium'))) ||
      voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    if (options?.onStart) utterance.onstart = options.onStart;
    if (options?.onEnd) utterance.onend = options.onEnd;
    if (options?.onError) utterance.onerror = options.onError;

    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (err) {
    options?.onError?.(err);
    return null;
  }
}

import type { Language } from '../i18n'
import { useSettings } from '../store/settings'

const preferred: Record<Language, string[]> = {
  en: ['en-CA', 'en-US', 'en-GB', 'en'],
  fr: ['fr-CA', 'fr-CH', 'fr-FR', 'fr'],
}

let voices: SpeechSynthesisVoice[] = []

function loadVoices() {
  try {
    voices = window.speechSynthesis?.getVoices() ?? []
  } catch {
    voices = []
  }
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices()
  window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices)
}

export function pickVoice(lang: Language): SpeechSynthesisVoice | null {
  if (!voices.length) loadVoices()
  for (const code of preferred[lang]) {
    const exact = voices.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(code.toLowerCase()))
    if (exact.length) return exact.find((v) => v.localService) ?? exact[0]
  }
  return null
}

export const speechAvailable = () => typeof window !== 'undefined' && 'speechSynthesis' in window

/** Reads a text aloud. Returns false if this device cannot speak. */
export function speak(text: string, lang: Language, opts: { slow?: boolean } = {}): boolean {
  if (!speechAvailable() || !useSettings.getState().speechOn) return false
  try {
    const synth = window.speechSynthesis
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    const voice = pickVoice(lang)
    if (voice) u.voice = voice
    u.lang = voice?.lang ?? preferred[lang][0]
    u.rate = opts.slow ? 0.85 : 0.95
    u.pitch = 1.1
    synth.speak(u)
    return true
  } catch {
    return false
  }
}

export function stopSpeaking() {
  try {
    window.speechSynthesis?.cancel()
  } catch {
    /* ignore */
  }
}

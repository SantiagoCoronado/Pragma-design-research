import { useEffect, useState } from 'react';

function readScheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useColorScheme() {
  const [scheme, setScheme] = useState(readScheme);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setScheme(e.matches ? 'dark' : 'light');
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  return scheme;
}

export function getTheme(scheme) {
  if (scheme === 'dark') {
    return {
      bg: '#0A0A0A',
      surface: '#171717',
      border: '#27272A',
      borderSubtle: '#1F1F22',
      textPrimary: '#FAFAFA',
      textSecondary: '#A1A1AA',
      textMuted: '#71717A',
      swatchInset: 'rgba(255,255,255,0.12)',
      ctaBg: '#52525B',
      ctaText: '#FAFAFA',
      ctaBgHover: '#71717A',
      submitBg: '#FAFAFA',
      submitText: '#0E0E0E',
      submitBorder: '#FAFAFA',
      submitDisabled: '#27272A',
      submitDisabledText: '#71717A',
      rankIdleBg: '#171717',
      rankIdleBorder: '#3F3F46',
      rankIdleText: '#FAFAFA',
      rankSelectedBg: '#FAFAFA',
      rankSelectedBorder: '#FAFAFA',
      rankSelectedText: '#0E0E0E',
      errorBg: 'rgba(127,29,29,0.25)',
      errorBorder: '#7F1D1D',
      errorText: '#FCA5A5',
    };
  }
  return {
    bg: '#FAFAF9',
    surface: '#FFFFFF',
    border: '#E5E5E5',
    borderSubtle: '#F0F0EF',
    textPrimary: '#0E0E0E',
    textSecondary: '#525252',
    textMuted: '#737373',
    swatchInset: 'rgba(0,0,0,0.08)',
    ctaBg: '#52525B',
    ctaText: '#FAFAFA',
    ctaBgHover: '#3F3F46',
    submitBg: '#FFFFFF',
    submitText: '#0E0E0E',
    submitBorder: '#0E0E0E',
    submitDisabled: '#D4D4D8',
    submitDisabledText: '#A1A1AA',
    rankIdleBg: '#FFFFFF',
    rankIdleBorder: '#D4D4D4',
    rankIdleText: '#0E0E0E',
    rankSelectedBg: '#0E0E0E',
    rankSelectedBorder: '#0E0E0E',
    rankSelectedText: '#FAFAFA',
    errorBg: '#FEF2F2',
    errorBorder: '#FECACA',
    errorText: '#991B1B',
  };
}

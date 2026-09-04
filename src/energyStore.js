import { useEffect, useState } from 'react';

const KEY = 'polar_energy_state';
const LOGIN_KEY = 'polar_login_at';
const LANG_KEY = 'polar_language';

export const DEFAULT_ENERGY = { solar: 72, wind: 210, diesel: 0, battery: 120, load: 66 };

export function getEnergy() {
  try { return { ...DEFAULT_ENERGY, ...(JSON.parse(localStorage.getItem(KEY) || '{}')) }; }
  catch { return { ...DEFAULT_ENERGY }; }
}

export function setEnergy(patch) {
  const next = { ...getEnergy(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('polar-energy-change', { detail: next }));
  return next;
}

export function getLanguage() { return localStorage.getItem(LANG_KEY) || 'English'; }
export function setLanguage(value) {
  localStorage.setItem(LANG_KEY, value);
  window.dispatchEvent(new CustomEvent('polar-language-change', { detail: value }));
}

export function startSession() {
  const now = Date.now();
  sessionStorage.setItem(LOGIN_KEY, String(now));
  window.dispatchEvent(new Event('polar-session-change'));
}
export function getLoginAt() { return Number(sessionStorage.getItem(LOGIN_KEY) || 0); }

export function useEnergy() {
  const [energy, setState] = useState(getEnergy);
  useEffect(() => {
    const handler = (e) => setState(e.detail || getEnergy());
    window.addEventListener('polar-energy-change', handler);
    return () => window.removeEventListener('polar-energy-change', handler);
  }, []);
  return energy;
}

export function useLanguage() {
  const [language, setState] = useState(getLanguage);
  useEffect(() => {
    const handler = (e) => setState(e.detail || getLanguage());
    window.addEventListener('polar-language-change', handler);
    return () => window.removeEventListener('polar-language-change', handler);
  }, []);
  return language;
}

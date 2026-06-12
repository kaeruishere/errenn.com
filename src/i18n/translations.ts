import data from './data.json';

export type Lang = 'tr' | 'en';

export const translations = data;

export function t(lang: Lang) {
  return translations[lang];
}


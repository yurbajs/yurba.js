import { en } from '../locales/en';
import { uk } from '../locales/uk';

type Lang = 'en' | 'uk'
type Translations = typeof en

const translations: Record<Lang, Translations> = { en, uk };

export const t = (key: string, lang: Lang = 'en'): string => {
  const keys = key.split('.');
  let value: any = translations[lang];

  for (const k of keys) {
    value = value?.[k];
  }

  return value || key;
};

export const createNavItem = (key: string, path: string, lang: Lang = 'en') => ({
  text: t(key, lang),
  link: lang === 'uk' ? `/uk${path}` : path,
});

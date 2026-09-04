'use client';

import { localizedPath, type Locale } from '@/i18n/routes.mjs';

export function LanguageSwitcher({ path, locale }: { path: string; locale: Locale }) {
  return <nav aria-label={locale === 'en' ? 'Language' : 'Lingua'} className="flex shrink-0 items-center gap-1 text-sm">
    {(['it', 'en'] as const).map((language) => <a
      key={language}
      href={localizedPath(path, language)}
      hrefLang={language}
      lang={language}
      aria-current={locale === language ? 'page' : undefined}
      className={`rounded-lg px-2 py-2 ${locale === language ? 'bg-white/10 font-semibold text-white' : 'text-slate-400 hover:text-white'}`}
      onClick={(event) => {
        if (locale === language) { event.preventDefault(); return; }
        if (!window.dispatchEvent(new Event('pdf-language-change', { cancelable: true }))) event.preventDefault();
      }}
    >{language === 'it' ? 'Italiano' : 'English'}</a>)}
  </nav>;
}

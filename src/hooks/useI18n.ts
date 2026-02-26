import { useCallback, useMemo } from 'react';
import {
  translateUi,
  translateFromUiPack,
  translateFromAuthPack,
  translateTerm,
  getLanguageLabel,
} from '@/i18n/translations';
import { useStore } from '@/store/useStore';

const useI18n = () => {
  const language = useStore((state) => state.language);
  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    return translateUi(language, key, params);
  }, [language]);
  const uiPack = useCallback((path: string, params?: Record<string, string | number>) => {
    const translated = translateFromUiPack(language, path, params);
    return translated || path;
  }, [language]);
  const authPack = useCallback((screen: string, path: string, params?: Record<string, string | number>) => {
    const translated = translateFromAuthPack(language, screen, path, params);
    return translated || path;
  }, [language]);
  const localizeTerm = useCallback((term: string) => {
    return translateTerm(language, term);
  }, [language]);
  const languageLabel = useMemo(() => getLanguageLabel(language), [language]);

  return { language, languageLabel, t, uiPack, authPack, localizeTerm };
};

export default useI18n;
export { useI18n };

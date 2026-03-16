import { useState, useCallback, useRef } from 'react';
import { _LanguageCode } from '@/lib/const';
import { useMutationTranslateReview } from './use-mutation';

const cache: Record<string, string> = {};

export function useReviewTranslation(
  reviewId: string,
  originalComment: string,
  onUpdateTranslation?: (reviewId: string, translated: string | null) => void
) {
  const { mutate: translateMutate } = useMutationTranslateReview();

  const [translations, setTranslations] = useState<Partial<Record<_LanguageCode, string>>>(() => {
    const entries: Partial<Record<_LanguageCode, string>> = {};
    Object.keys(cache).forEach((key) => {
      if (key.startsWith(`review__${reviewId}__`)) {
        const lang = key.split('__')[2] as _LanguageCode;
        entries[lang] = cache[key];
      }
    });
    return entries;
  });

  const [targetLang, setTargetLang] = useState<_LanguageCode | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isShowingTranslated, setIsShowingTranslated] = useState(false);

  const translationsRef = useRef(translations);
  translationsRef.current = translations;

  const currentTranslation = targetLang ? translations[targetLang] : undefined;
  const hasTranslation = !!currentTranslation;
  const displayComment =
    isShowingTranslated && hasTranslation ? currentTranslation : originalComment;

  const translate = useCallback(
    (lang: _LanguageCode) => {
      const key = `review__${reviewId}__${lang}`;
      const cached = translationsRef.current[lang] ?? cache[key];

      if (cached) {
        setTranslations((p) => (p[lang] === cached ? p : { ...p, [lang]: cached }));
        setIsShowingTranslated(true);
        // Update parent with cached translation
        onUpdateTranslation?.(reviewId, cached);
        return;
      }

      setIsTranslating(true);
      translateMutate(
        { review_id: reviewId, lang },
        {
          onSuccess: ({ data }) => {
            const text = data.translate;
            cache[key] = text;
            setTranslations((p) => ({ ...p, [lang]: text }));
            setIsShowingTranslated(true);
            setIsTranslating(false);
            // Update parent with new translation
            onUpdateTranslation?.(reviewId, text);
          },
          onError: () => setIsTranslating(false),
        }
      );
    },
    [reviewId, translateMutate]
  );

  const handleChangeLang = useCallback(
    (lang: _LanguageCode) => {
      setTargetLang(lang);
      translate(lang);
    },
    [translate]
  );

  const handleToggleTranslation = useCallback(() => {
    if (hasTranslation) {
      setIsShowingTranslated((p) => {
        const newValue = !p;
        // Update parent when toggling
        onUpdateTranslation?.(reviewId, newValue && hasTranslation ? currentTranslation : null);
        return newValue;
      });
    } else if (targetLang) {
      translate(targetLang);
    }
  }, [hasTranslation, targetLang, translate, onUpdateTranslation, reviewId, currentTranslation]);

  return {
    targetLang,
    isTranslating,
    isShowingTranslated,
    hasTranslation,
    displayComment,
    handleChangeLang,
    handleToggleTranslation,
  };
}

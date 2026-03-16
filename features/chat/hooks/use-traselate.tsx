import { useState, useCallback, useRef } from 'react';
import { Clipboard } from 'react-native';
import { _LanguageCode } from '@/lib/const';
import { useMutationTranslateMessage } from './use-mutation';

// Global cache – tồn tại suốt vòng đời app, không reset khi unmount
const globalCache: Record<string, string> = {};

export function useTranslateMessage(
  messageId: string,
  originalContent: string,
  targetLang: _LanguageCode,
  setTargetLang: (lang: _LanguageCode) => void,
  initialIsShowing = false
) {
  const { mutate: translateMutate } = useMutationTranslateMessage();

  // Seed translations từ globalCache ngay lúc init → tránh re-render thêm
  const [translations, setTranslations] = useState<Partial<Record<_LanguageCode, string>>>(() => {
    const key = `${messageId}__${targetLang}`;
    return globalCache[key] ? { [targetLang]: globalCache[key] } : {};
  });

  const [isTranslating, setIsTranslating] = useState(false);
  const [isShowingTranslated, setIsShowingTranslated] = useState(
    () => initialIsShowing && !!globalCache[`${messageId}__${targetLang}`]
  );

  // Stable ref để translate callback không cần re-create khi translations thay đổi
  const translationsRef = useRef(translations);
  translationsRef.current = translations;

  const currentTranslation = translations[targetLang];
  const hasTranslation = !!currentTranslation;
  const displayContent =
    isShowingTranslated && hasTranslation ? currentTranslation : originalContent;

  const translate = useCallback(
    (lang: _LanguageCode) => {
      const key = `${messageId}__${lang}`;
      const cached = translationsRef.current[lang] ?? globalCache[key];

      if (cached) {
        // Batch update để tránh 2 lần render
        setTranslations((p) => (p[lang] === cached ? p : { ...p, [lang]: cached }));
        setIsShowingTranslated(true);
        return;
      }

      setIsTranslating(true);
      translateMutate(
        { message_id: messageId, lang },
        {
          onSuccess: ({ data }) => {
            const text = data.translate;
            globalCache[key] = text;
            setTranslations((p) => ({ ...p, [lang]: text }));
            setIsShowingTranslated(true);
            setIsTranslating(false);
          },
          onError: () => setIsTranslating(false),
        }
      );
    },
    // Chỉ phụ thuộc messageId + mutate (stable), không phụ thuộc translations
    [messageId, translateMutate]
  );

  const handleChangeTargetLang = useCallback(
    (lang: _LanguageCode) => {
      setTargetLang(lang);
      translate(lang);
    },
    [translate, setTargetLang]
  );

  const handleTranslateMessage = useCallback(() => {
    if (hasTranslation) {
      setIsShowingTranslated((p) => !p);
    } else {
      translate(targetLang);
    }
  }, [hasTranslation, translate, targetLang]);

  const handleCopyToClipboard = useCallback(
    () => Clipboard.setString(displayContent),
    [displayContent]
  );

  return {
    isTranslating,
    isShowingTranslated,
    hasTranslation,
    displayContent,
    handleChangeTargetLang,
    handleTranslateMessage,
    handleCopyToClipboard,
  };
}

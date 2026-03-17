import { useState, useCallback } from 'react';
import { Clipboard } from 'react-native';
import { _LanguageCode } from '@/lib/const';
import { useMutationTranslateMessage } from './use-mutation';

const globalCache: Record<string, string> = {};

export function useTranslateMessage(
  messageId: string,
  originalContent: string,
  targetLang: _LanguageCode,
  setTargetLang: (lang: _LanguageCode) => void,
  initialIsShowing = false
) {
  const { mutate: translateMutate, isPending } = useMutationTranslateMessage();

  const [isShowingTranslated, setIsShowingTranslated] = useState(initialIsShowing);

  const getCacheKey = (lang: _LanguageCode) => `${messageId}__${lang}`;

  const getTranslation = (lang: _LanguageCode) => {
    return globalCache[getCacheKey(lang)];
  };

  const translate = useCallback(
    (lang: _LanguageCode) => {
      const cached = getTranslation(lang);

      if (cached) {
        setIsShowingTranslated(true);
        return;
      }

      translateMutate(
        { message_id: messageId, lang },
        {
          onSuccess: ({ data }) => {
            globalCache[getCacheKey(lang)] = data.translate;
            setIsShowingTranslated(true);
          },
        }
      );
    },
    [messageId, translateMutate]
  );

  const currentTranslation = getTranslation(targetLang);

  const displayContent =
    isShowingTranslated && currentTranslation ? currentTranslation : originalContent;

  const handleChangeTargetLang = useCallback(
    (lang: _LanguageCode) => {
      setTargetLang(lang);
      translate(lang);
    },
    [setTargetLang, translate]
  );

  const handleTranslateMessage = useCallback(() => {
    if (currentTranslation) {
      setIsShowingTranslated((p) => !p);
    } else {
      translate(targetLang);
    }
  }, [currentTranslation, translate, targetLang]);

  const handleCopyToClipboard = useCallback(() => {
    Clipboard.setString(displayContent);
  }, [displayContent]);

  return {
    isTranslating: isPending,
    isShowingTranslated,
    hasTranslation: !!currentTranslation,
    displayContent,
    handleChangeTargetLang,
    handleTranslateMessage,
    handleCopyToClipboard,
  };
}

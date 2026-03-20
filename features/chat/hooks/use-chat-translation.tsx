import { useCallback, useEffect, useState } from 'react';
import { useMutationTranslateMessage } from './use-mutation';
import { _LanguageCode } from '@/lib/const';
import { _DEFAULT_TRANSLATIONS, LanguageTranslations } from '@/lib/types';
import { ListMessageResponse, PayloadNewMessage } from '../types';
import { useImmer } from 'use-immer';
import { queryClient } from '@/lib/provider/query-provider';
import { InfiniteData } from '@tanstack/react-query';
import useChatStore from '../stores';
import { produce } from 'immer';

export const useChatTranslation = (chatItem: PayloadNewMessage | null) => {
  const { mutate: translateMutate, isPending } = useMutationTranslateMessage();
  const [targetLang, setTargetLang] = useState<_LanguageCode | null>(null);

  const [translatedChat, setTranslatedChat] = useImmer<LanguageTranslations>(_DEFAULT_TRANSLATIONS);
  const room = useChatStore((s) => s.room);

  useEffect(() => {
    if (chatItem) {
      if (chatItem.content_translated) {
        setTranslatedChat(chatItem.content_translated);
      }
      if (!!(chatItem.target_lang_translated && chatItem.translated_content)) {
        const targetLang = chatItem.target_lang_translated;
        const translate = chatItem.translated_content;
        setTargetLang(targetLang);
        setTranslatedChat((draft) => {
          draft[targetLang] = translate;
        });
      }
    }
  }, [chatItem]);

  const handleUpdateTranslation = useCallback(
    (messageId: string, translated: string, lang: _LanguageCode) => {
      if (!room?.id) return;

      queryClient.setQueryData<InfiniteData<ListMessageResponse>>(
        ['chatApi-listMessages', room.id],
        (oldData) => {
          if (!oldData) return oldData;

          return produce(oldData, (draft) => {
            if (!draft.pages) return;

            for (const page of draft.pages) {
              const msgs = page.data?.data;
              if (!msgs) continue;

              const msg = msgs.find((item: PayloadNewMessage) => item.id === messageId);

              if (msg) {
                msg.translated_content = translated;
                msg.target_lang_translated = lang;
                break;
              }
            }
          });
        }
      );
    },
    [room?.id, queryClient]
  );

  const translate = useCallback(
    (lang: _LanguageCode) => {
      if (chatItem && chatItem.content && chatItem.content.trim().length > 0) {
        if (translatedChat[lang] && translatedChat[lang].length > 0) {
          handleUpdateTranslation(chatItem.id, translatedChat[lang], lang);
          return;
        }
        translateMutate(
          { message_id: chatItem.id, lang },
          {
            onSuccess: ({ data }) => {
              const text = data.translate;
              setTranslatedChat((draft) => {
                draft[lang] = text;
              });
              handleUpdateTranslation(chatItem.id, text, lang);
            },
          }
        );
      }
    },
    [chatItem, translatedChat, handleUpdateTranslation]
  );
  const handleChangeTargetLang = useCallback(
    (lang: _LanguageCode) => {
      setTargetLang(lang);
      translate(lang);
    },
    [translate]
  );

  const handleResetTargetLang = useCallback(() => {
    setTargetLang(null);
  }, []);

  const handleResetTranslateChat = useCallback(() => {
    setTranslatedChat(_DEFAULT_TRANSLATIONS);
  }, []);
  return {
    targetLang,
    translatedChat,
    handleChangeTargetLang,
    handleResetTargetLang,
    handleResetTranslateChat,
    isTranslating: isPending,
  };
};

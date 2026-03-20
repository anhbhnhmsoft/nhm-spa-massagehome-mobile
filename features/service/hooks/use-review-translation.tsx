import React, { useState, useCallback, useEffect } from 'react';
import { _LanguageCode } from '@/lib/const';
import { useMutationTranslateReview } from './use-mutation';
import { ListReviewRequest, ListReviewResponse, ReviewItem } from '@/features/service/types';
import { useImmer } from 'use-immer';
import { queryClient } from '@/lib/provider/query-provider';
import { InfiniteData } from '@tanstack/query-core';
import { produce } from 'immer';
import _ from 'lodash';
import { _DEFAULT_TRANSLATIONS, LanguageTranslations } from '@/lib/types';

// bọc callback giúp anh Huy
export function useReviewTranslation(reviewItem: ReviewItem | null, params: ListReviewRequest) {
  const { mutate: translateMutate, isPending } = useMutationTranslateReview();
  const [targetLang, setTargetLang] = useState<_LanguageCode | null>(null);

  const [translatedComment, setTranslatedComment] =
    useImmer<LanguageTranslations>(_DEFAULT_TRANSLATIONS);

  // Update translated comment when review item changes
  useEffect(() => {
    if (reviewItem) {
      if (reviewItem.comment_translated) {
        setTranslatedComment(reviewItem.comment_translated);
      }
      if (!!(reviewItem.target_lang_translated && reviewItem.translated_comment)) {
        const targetLang = reviewItem.target_lang_translated;
        const translate = reviewItem.translated_comment;
        setTargetLang(targetLang);
        setTranslatedComment((draft) => {
          draft[targetLang] = translate;
        });
      }
    }
  }, [reviewItem]);

  const handleUpdateTranslation = useCallback(
    (reviewId: string, translated: string, lang: _LanguageCode) => {
      queryClient.setQueryData<InfiniteData<ListReviewResponse>>(
        ['serviceApi-listReview', params],
        (oldData) => {
          // TS tự hiểu oldData là InfiniteData<ListReviewResponse> | undefined
          if (!oldData) return oldData;
          return produce(oldData, (draft) => {
            for (const page of draft.pages) {
              const review = page.data.data.find((item: ReviewItem) => item.id === reviewId);

              if (review) {
                review.translated_comment = translated;
                review.target_lang_translated = lang;
                break;
              }
            }
          });
        }
      );
    },
    [params]
  );

  const translate = useCallback(
    (lang: _LanguageCode) => {
      if (reviewItem && reviewItem.comment && reviewItem.comment.trim().length > 0) {
        if (translatedComment[lang] && translatedComment[lang].length > 0) {
          handleUpdateTranslation(reviewItem.id, translatedComment[lang], lang);
          return;
        }

        translateMutate(
          { review_id: reviewItem.id, lang },
          {
            onSuccess: ({ data }) => {
              const text = data.translate;
              setTranslatedComment((draft) => {
                draft[lang] = text;
              });
              // Update parent with new translation
              handleUpdateTranslation(reviewItem.id, text, lang);
            },
          }
        );
      }
    },
    [translatedComment, reviewItem]
  );

  const handleChangeLang = useCallback(
    (lang: _LanguageCode) => {
      setTargetLang(lang);
      translate(lang);
    },
    [translate]
  );

  /**
   * Xóa ngôn ngữ đang chọn
   */
  const handleResetTargetLang = useCallback(() => {
    setTargetLang(null);
  }, []);

  const handleResetTranslateComment = useCallback(() => {
    setTranslatedComment(_DEFAULT_TRANSLATIONS);
  }, []);

  return {
    targetLang,
    translatedComment,
    handleChangeLang,
    handleResetTargetLang,
    handleResetTranslateComment,
    loading: isPending,
  };
}
